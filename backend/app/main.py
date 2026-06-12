"""Main application entry point."""
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.config import settings
from app.database import get_db, init_db
from app.schemas import HealthCheckResponse
from app.routers import products, customers, orders

# Initialize database
init_db()

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Production-ready Inventory Management API",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)


# Health check endpoint
@app.get(
    "/",
    response_model=HealthCheckResponse,
    tags=["Health"],
    summary="Health check",
    description="Check if the API is healthy"
)
def health_check(db: Session = Depends(get_db)):
    """
    Health check endpoint.
    
    Verifies that the API and database connection are working.
    """
    try:
        # Simple database query to verify connection
        db.execute(text("SELECT 1"))
        return {"status": "healthy"}
    except Exception as e:
        print(f"Health check error: {e}")
        return {"status": "unhealthy"}


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info"
    )
