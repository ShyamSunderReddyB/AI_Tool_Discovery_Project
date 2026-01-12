from __future__ import annotations

import os
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from bson import ObjectId


MONGODB_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = os.environ.get("MONGODB_DB", "aitools")
COLLECTION_NAME = os.environ.get("MONGODB_COLLECTION", "tools")


class Tool(BaseModel):
    id: str
    name: str
    url: Optional[str] = None
    description: Optional[str] = None
    categories: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)


class ToolCreate(BaseModel):
    name: str
    url: Optional[str] = None
    description: Optional[str] = None
    categories: Optional[List[str]] = None
    tags: Optional[List[str]] = None


app = FastAPI(title="AI Tools API")

# Allow CORS from the frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


def _doc_to_tool(doc: dict) -> Tool:
    return Tool(
        id=str(doc.get("_id")),
        name=doc.get("name"),
        url=doc.get("url"),
        description=doc.get("description"),
        categories=doc.get("categories", []),
        tags=doc.get("tags", []),
    )


@app.on_event("startup")
async def startup_db_client():
    app.state.mongo_client = AsyncIOMotorClient(MONGODB_URI)
    app.state.db = app.state.mongo_client[DB_NAME]
    # Ensure seed data exists if collection is empty
    coll = app.state.db[COLLECTION_NAME]
    count = await coll.count_documents({})
    if count == 0:
        seed = [
            {
                "name": "Example Image Generator",
                "url": "https://example.com/image-gen",
                "description": "Generate images from prompts.",
                "categories": ["Image"],
                "tags": ["image", "generator", "vision"],
            },
            {
                "name": "Example Text Summarizer",
                "url": "https://example.com/summarize",
                "description": "Summarize long articles to short notes.",
                "categories": ["Text"],
                "tags": ["nlp", "summarization", "text"],
            },
        ]
        await coll.insert_many(seed)


@app.on_event("shutdown")
async def shutdown_db_client():
    client: AsyncIOMotorClient = app.state.mongo_client
    client.close()


@app.get("/api/tools", response_model=List[Tool])
async def list_tools(q: Optional[str] = None, category: Optional[str] = None, tag: Optional[str] = None, limit: int = 50, offset: int = 0):
    coll = app.state.db[COLLECTION_NAME]
    query = {}
    if q:
        # simple text search across name, description, tags and categories
        q_regex = {"$regex": q, "$options": "i"}
        query["$or"] = [
            {"name": q_regex},
            {"description": q_regex},
            {"tags": q_regex},
            {"categories": q_regex},
        ]
    if category:
        query["categories"] = category
    if tag:
        query["tags"] = tag

    cursor = coll.find(query).skip(int(offset)).limit(int(limit))
    docs = await cursor.to_list(length=limit)
    return [_doc_to_tool(d) for d in docs]


@app.get("/api/tools/{tool_id}", response_model=Tool)
async def get_tool(tool_id: str):
    coll = app.state.db[COLLECTION_NAME]
    # tool_id may be an ObjectId string
    doc = await coll.find_one({"_id": ObjectId(tool_id)}) if ObjectId.is_valid(tool_id) else await coll.find_one({"_id": tool_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Tool not found")
    return _doc_to_tool(doc)


@app.post("/api/tools", response_model=Tool, status_code=201)
async def create_tool(payload: ToolCreate):
    coll = app.state.db[COLLECTION_NAME]
    doc = {
        "name": payload.name,
        "url": payload.url,
        "description": payload.description,
        "categories": payload.categories or [],
        "tags": payload.tags or [],
    }
    res = await coll.insert_one(doc)
    doc["_id"] = res.inserted_id
    return _doc_to_tool(doc)


@app.get("/api/categories", response_model=List[str])
async def list_categories():
    coll = app.state.db[COLLECTION_NAME]
    cats = await coll.distinct("categories")
    return sorted([c for c in cats if c])


@app.get("/api/tags", response_model=List[str])
async def list_tags():
    coll = app.state.db[COLLECTION_NAME]
    tags = await coll.distinct("tags")
    return sorted([t for t in tags if t])


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
