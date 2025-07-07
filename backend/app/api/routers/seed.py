from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from app.db.seed import seed_database, cleanup_seed_data, get_seed_stats
from app.middleware.auth import get_current_user
from app.core.config import settings
import logging
import os

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/seed", tags=["Database Seeding"])

def check_development_mode():
    """Check if we're in development mode. Only allow seed operations in development."""
    is_dev = (
        os.getenv("ENVIRONMENT", "development").lower() == "development" or
        os.getenv("DEBUG", "false").lower() == "true" or
        not settings.CLERK_SECRET_KEY or
        settings.CLERK_SECRET_KEY.startswith("sk_test_")
    )
    
    if not is_dev:
        raise HTTPException(
            status_code=403,
            detail="Seed operations are only available in development mode"
        )

@router.get("/stats")
async def get_seed_statistics(user_id: str = Depends(get_current_user)):
    """Get statistics about seed data in the database"""
    check_development_mode()
    
    try:
        stats = get_seed_stats()
        return stats
    except Exception as e:
        logger.error(f"Error getting seed stats: {e}")
        raise HTTPException(status_code=500, detail="Error getting seed statistics")

@router.post("/")
async def create_seed_data(user_id: str = Depends(get_current_user)):
    """
    Create seed data in the database.
    This endpoint requires authentication and is only available in development mode.
    """
    check_development_mode()
    
    try:
        result = seed_database(user_id=user_id)
        logger.info(f"User {user_id} created seed data")
        return JSONResponse(content=result, status_code=201)
    except Exception as e:
        logger.error(f"Error creating seed data: {e}")
        raise HTTPException(status_code=500, detail="Error creating seed data")

@router.delete("/")
async def delete_seed_data(user_id: str = Depends(get_current_user)):
    """
    Delete all seed data from the database.
    This endpoint requires authentication and is only available in development mode.
    """
    check_development_mode()
    
    try:
        result = cleanup_seed_data()
        logger.info(f"User {user_id} deleted seed data")
        return JSONResponse(content=result, status_code=200)
    except Exception as e:
        logger.error(f"Error deleting seed data: {e}")
        raise HTTPException(status_code=500, detail="Error deleting seed data")

@router.post("/reset")
async def reset_seed_data(user_id: str = Depends(get_current_user)):
    """
    Reset seed data: delete existing seed data and create fresh seed data.
    This endpoint requires authentication and is only available in development mode.
    """
    check_development_mode()
    
    try:
        # First cleanup existing seed data
        cleanup_result = cleanup_seed_data()
        logger.info(f"Cleanup result: {cleanup_result}")
        
        # Then create fresh seed data
        seed_result = seed_database(user_id=user_id)
        logger.info(f"Seed result: {seed_result}")
        
        logger.info(f"User {user_id} reset seed data")
        
        return JSONResponse(content={
            "message": "Seed data reset successfully",
            "cleanup": cleanup_result,
            "seed": seed_result
        }, status_code=200)
    except Exception as e:
        logger.error(f"Error resetting seed data: {e}")
        raise HTTPException(status_code=500, detail="Error resetting seed data")