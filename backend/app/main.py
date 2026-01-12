from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import connect_to_mongo, close_mongo_connection
from app.routers import auth, tools, reviews, admin_tools, admin_reviews


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API for AI Tool Discovery Platform with user reviews and admin moderation",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(tools.router)
app.include_router(reviews.router)
app.include_router(admin_tools.router)
app.include_router(admin_reviews.router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "AI Tool Discovery API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
