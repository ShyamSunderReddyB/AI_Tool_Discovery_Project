# AI Tool Discovery - Backend

FastAPI backend for the AI Tool Discovery platform with MongoDB.

## Features

- 🔐 JWT Authentication (simple password storage)
- 🔍 Tool Discovery with filtering and search
- ⭐ User Reviews with moderation
- 👨‍💼 Admin Dashboard for tools and reviews
- 📊 Automatic rating calculation

## Setup

### Prerequisites

- Python 3.9+
- MongoDB (local or Atlas)

### Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Edit `.env` and set your configuration:
```env
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=ai_tools_discovery
JWT_SECRET_KEY=your-secret-key-here
```

### Running the Application

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### Authentication
- `POST /auth/signup` - Create new user
- `POST /auth/login` - Login and get JWT token

### Public Tools
- `GET /tools` - List tools with filters
- `GET /tools/{id}` - Get tool details
- `GET /tools/{id}/reviews` - Get tool reviews

### Reviews (Authenticated)
- `POST /reviews` - Submit review
- `GET /reviews/me` - Get my reviews

### Admin - Tools
- `GET /admin/tools` - List all tools
- `POST /admin/tools` - Create tool
- `PUT /admin/tools/{id}` - Update tool
- `DELETE /admin/tools/{id}` - Delete tool

### Admin - Reviews
- `GET /admin/reviews` - List reviews for moderation
- `PATCH /admin/reviews/{id}` - Approve/reject review

## Project Structure

```
backend/
├── app/
│   ├── models/          # Pydantic models
│   │   ├── tool.py
│   │   ├── review.py
│   │   └── user.py
│   ├── routers/         # API routes
│   │   ├── auth.py
│   │   ├── tools.py
│   │   ├── reviews.py
│   │   ├── admin_tools.py
│   │   └── admin_reviews.py
│   ├── services/        # Business logic
│   │   └── rating_service.py
│   ├── utils/           # Utilities
│   │   ├── auth.py
│   │   └── dependencies.py
│   ├── config.py        # Configuration
│   ├── database.py      # MongoDB connection
│   └── main.py          # FastAPI app
├── .env.example         # Environment template
└── requirements.txt     # Dependencies
```

## Database Collections

### tools
- Tool information with computed ratings
- Indexed on: name, category, pricingModel, avgRating

### reviews
- User reviews with moderation status
- Indexed on: toolId, userId, status

### users
- User accounts with roles
- Indexed on: email (unique)

## Development Notes

- Passwords are stored as plain text (development only)
- JWT tokens expire after 24 hours
- Reviews require moderation before affecting ratings
- Text search enabled on tool names and descriptions
