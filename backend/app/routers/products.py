"""Product router."""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import ProductCreate, ProductUpdate, ProductResponse
from app.services.product_service import ProductService

router = APIRouter(prefix="/products", tags=["Products"])


@router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new product",
    description="Create a new product with unique SKU"
)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db)
):
    """Create a new product."""
    return ProductService.create_product(db, product)


@router.get(
    "",
    response_model=list[ProductResponse],
    summary="Get all products",
    description="Retrieve all products with pagination"
)
def get_products(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all products with pagination."""
    return ProductService.get_products(db, skip=skip, limit=limit)


@router.get(
    "/{product_id}",
    response_model=ProductResponse,
    summary="Get a product",
    description="Retrieve a single product by ID"
)
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    """Get a product by ID."""
    return ProductService.get_product(db, product_id)


@router.put(
    "/{product_id}",
    response_model=ProductResponse,
    summary="Update a product",
    description="Update product details"
)
def update_product(
    product_id: int,
    product: ProductUpdate,
    db: Session = Depends(get_db)
):
    """Update a product."""
    return ProductService.update_product(db, product_id, product)


@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a product",
    description="Delete a product by ID"
)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    """Delete a product."""
    ProductService.delete_product(db, product_id)
