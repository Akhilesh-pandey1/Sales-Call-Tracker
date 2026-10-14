import os
from backend.app.config.base import BaseConfig


class ProdConfig(BaseConfig):
    DEBUG: bool = False
    
    prod_database_url: str = os.getenv("DATABASE_URL", "")
    if prod_database_url.startswith("postgres://"):
        prod_database_url = prod_database_url.replace("postgres://", "postgresql://", 1)
        
    SQLALCHEMY_DATABASE_URI: str = prod_database_url
