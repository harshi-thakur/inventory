# Inventory Management API

A production-ready REST API for inventory management built with FastAPI, SQLAlchemy, and PostgreSQL.

## Features

- ✅ **RESTful API Design** - Clean, standard REST endpoints
- ✅ **FastAPI** - Modern, fast web framework with automatic documentation
- ✅ **SQLAlchemy ORM** - Type-safe database interactions
- ✅ **PostgreSQL** - Production-grade relational database
- ✅ **Pydantic Validation** - Strong type validation for all requests
- ✅ **Transaction Management** - Database transactions for order creation
- ✅ **Inventory Management** - Automatic stock reduction and restoration
- ✅ **Error Handling** - Comprehensive error responses with proper HTTP status codes
- ✅ **Swagger Documentation** - Auto-generated API docs at `/docs`
- ✅ **Docker Support** - Ready for containerization
- ✅ **Environment Configuration** - Configurable via environment variables

## Architecture

```
backend/
├── app/
│   ├── core/              # Configuration and exceptions
│   │   ├── config.py      # Settings management
│   │   └── exceptions.py  # Custom exceptions
│   ├── models/            # SQLAlchemy ORM models
│   ├── schemas/           # Pydantic validation schemas
│   ├── routers/           # API route handlers
│   ├── services/          # Business logic layer
│   ├── dependencies/      # FastAPI dependencies
│   ├── database.py        # Database configuration
│   └── main.py            # Application entry point
├── requirements.txt       # Python dependencies
├── .env.example           # Environment variables template
├── Dockerfile             # Docker configuration
└── .dockerignore          # Docker build exclusions
```

## Requirements

- Python 3.12+
- PostgreSQL 12+
- pip or poetry

## Installation

### 1. Clone and Setup

```bash
cd backend
```

### 2. Create Virtual Environment

```bash
python -m venv venv
# PowerShell
.\venv\Scripts\Activate.ps1

# Command Prompt
venv\Scripts\activate.bat
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment

Copy `.env.example` to `.env` and update with your PostgreSQL credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL=postgresql://username:password@localhost:5432/inventory
APP_NAME=Inventory API
APP_VERSION=1.0.0
DEBUG=False
FRONTEND_URL=http://localhost:3000
```

For local Vite development, use `http://localhost:5173`. For local Docker, use `http://localhost:3000`.

For deployment, set `FRONTEND_URL` to the deployed frontend URL, for example:

```bash
FRONTEND_URL=https://your-frontend.vercel.app
```

If you need more than one allowed origin, use `FRONTEND_URLS` with comma-separated values.

### 5. Run Application

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Access the API:
- API: http://localhost:8000
- Swagger Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Deployment

When deploying the backend to Render and the frontend to Vercel, configure these environment variables:

- Backend: `FRONTEND_URL=https://your-frontend.vercel.app` or `FRONTEND_URLS=...`
- Frontend: `VITE_API_URL=https://your-backend.onrender.com`

## Database Models

### Product
- `id` (Integer, Primary Key)
- `name` (String)
- `sku` (String, Unique)
- `price` (Float, >= 0)
- `stock_quantity` (Integer, >= 0)
- `created_at` (DateTime)
- `updated_at` (DateTime)

### Customer
- `id` (Integer, Primary Key)
- `full_name` (String)
- `email` (String, Unique)
- `phone_number` (String)
- `created_at` (DateTime)

### Order
- `id` (Integer, Primary Key)
- `customer_id` (Foreign Key)
- `total_amount` (Float)
- `created_at` (DateTime)

### OrderItem
- `id` (Integer, Primary Key)
- `order_id` (Foreign Key)
- `product_id` (Foreign Key)
- `quantity` (Integer, > 0)
- `unit_price` (Float)

## API Endpoints

### Products

**Create Product**
```
POST /products
Content-Type: application/json

{
  "name": "Laptop",
  "sku": "LP1001",
  "price": 55000,
  "stock_quantity": 10
}
```

**Get All Products**
```
GET /products?skip=0&limit=100
```

**Get Product by ID**
```
GET /products/{id}
```

**Update Product**
```
PUT /products/{id}
Content-Type: application/json

{
  "price": 54000,
  "stock_quantity": 15
}
```

**Delete Product**
```
DELETE /products/{id}
```

### Customers

**Create Customer**
```
POST /customers
Content-Type: application/json

{
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone_number": "9999999999"
}
```

**Get All Customers**
```
GET /customers?skip=0&limit=100
```

**Get Customer by ID**
```
GET /customers/{id}
```

**Delete Customer**
```
DELETE /customers/{id}
```

### Orders

**Create Order**
```
POST /orders
Content-Type: application/json

{
  "customer_id": 1,
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    },
    {
      "product_id": 2,
      "quantity": 1
    }
  ]
}
```

**Get All Orders**
```
GET /orders?skip=0&limit=100
```

**Get Order Details**
```
GET /orders/{id}
```

**Delete Order**
```
DELETE /orders/{id}
```

### Health Check

**Health Check**
```
GET /
```

Response:
```json
{
  "status": "healthy"
}
```

## Business Logic

### Order Creation
1. Validates customer exists
2. Validates all products exist
3. Checks stock availability for all items
4. Calculates total amount automatically
5. Reduces product inventory
6. Creates order and items in a transaction
7. Rolls back on any failure

### Stock Management
- Product stock cannot be negative
- Stock is automatically reduced when order is created
- Stock is restored when order is deleted

### Validation Rules
- Product SKU must be unique
- Customer email must be unique
- Product price must be positive
- Order quantity must be positive
- Stock quantity cannot be negative

## Error Handling

The API returns appropriate HTTP status codes:

- `200 OK` - Successful GET request
- `201 Created` - Successful POST request
- `204 No Content` - Successful DELETE request
- `400 Bad Request` - Invalid request data
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (duplicate SKU, email, insufficient stock)
- `422 Unprocessable Entity` - Validation error
- `500 Internal Server Error` - Server error

Example Error Response:
```json
{
  "detail": "Product with ID 999 not found"
}
```

## Docker Deployment

### Build Image

```bash
docker build -t inventory-api:1.0 .
```

### Run Container

```bash
docker run -d \
  --name inventory-api \
  -p 8000:8000 \
  -e DATABASE_URL=postgresql://user:password@postgres:5432/inventory \
  inventory-api:1.0
```

### Docker Compose

```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: inventory
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/inventory
      DEBUG: "False"
    depends_on:
      - db

volumes:
  postgres_data:
```

## Performance Considerations

- Connection pooling disabled in `database.py` for proper transaction handling
- Indexes on frequently queried columns (SKU, email, IDs)
- Check constraints at database level for data integrity
- Transactions used for multi-step operations

## Security Considerations

- Environment variables for sensitive data
- Input validation via Pydantic
- Database constraints for data integrity
- CORS middleware configured
- No hardcoded credentials

## Development

### Running with Hot Reload

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Database Migrations (Optional - Alembic)

```bash
# Initialize alembic (if not already done)
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Initial migration"

# Apply migrations
alembic upgrade head
```

## Testing

```bash
# Install testing dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest
```


