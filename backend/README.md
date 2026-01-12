Backend API for AI Tool Discovery Replica

This backend provides a small REST API used by the frontend. It uses MongoDB (Motor async driver) for storage and exposes endpoints for listing, searching, filtering and submitting tools.

Run locally (recommended using a virtual environment)

1. Install dependencies (example with pip):

```powershell
python -m venv .venv; .\.venv\Scripts\Activate.ps1
pip install fastapi uvicorn pydantic motor
```

2. Start a local MongoDB (quick with Docker):

```powershell
# start a local mongo container (data persisted in named volume)
docker run -d --name ai-tools-mongo -p 27017:27017 -v aitools-mongo:/data/db mongo:6
```

3. Start the backend server:

```powershell
# optional: set MONGODB_URI to point at your cluster
$env:MONGODB_URI = 'mongodb://localhost:27017'
python -m uvicorn main:app --reload --port 8000
```

Environment variables

- MONGODB_URI (optional) — MongoDB connection string; default: mongodb://localhost:27017
- MONGODB_DB (optional) — database name; default: aitools
- MONGODB_COLLECTION (optional) — collection name; default: tools

Endpoints

- GET /api/tools?q=...&category=...&tag=...&limit=...&offset=... — list/search tools
- GET /api/tools/{id} — get tool details (id is Mongo \_id)
- POST /api/tools — create a tool (JSON body: name, url, description, categories, tags)
- GET /api/categories — list categories
- GET /api/tags — list tags

The server will seed the collection with example tools if the collection is empty on startup.
Backend API for AI Tool Discovery Replica

This minimal backend provides a small REST API used by the frontend. It is intentionally lightweight: file-backed JSON storage, FastAPI, and a few endpoints used for listing, searching, filtering and submitting tools.

Run locally (recommended using a virtual environment):

1. Install dependencies (example with pip):

```powershell
python -m venv .venv; .\.venv\Scripts\Activate.ps1
pip install -e .[dev]
pip install fastapi uvicorn pydantic
```

2. Start server using uvicorn:

```powershell
python -m uvicorn main:app --reload --port 8000
```

Endpoints:

- GET /api/tools?q=...&category=...&tag=...&limit=...&offset=... — list/search tools
- GET /api/tools/{id} — get tool details
- POST /api/tools — create a tool (JSON body: name, url, description, categories, tags)
- GET /api/categories — list categories
- GET /api/tags — list tags

Data is stored at `backend/data/tools.json`. This is a simple starting point; for production replace with a real database.
