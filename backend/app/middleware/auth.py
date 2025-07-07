from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwk, jwt, JWTError
from jose.utils import base64url_decode
from typing import Optional, Dict, Any
import httpx
from app.core.config import settings
import asyncio
from clerk_backend_api import Clerk
import json
import time

security = HTTPBearer()

class ClerkAuth:
    def __init__(self):
        self.clerk_secret_key = settings.CLERK_SECRET_KEY
        self.clerk_publishable_key = settings.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
        self.clerk_client = None
        self.jwks_cache = {}
        self.jwks_cache_time = 0
        self.jwks_cache_duration = 3600  # 1 hour cache
        
        if self.clerk_secret_key:
            self.clerk_client = Clerk(bearer_auth=self.clerk_secret_key)
    
    async def get_clerk_jwks(self) -> Dict[str, Any]:
        """Get Clerk's public keys for JWT verification"""
        current_time = time.time()
        
        # Return cached JWKS if still valid
        if (self.jwks_cache and 
            current_time - self.jwks_cache_time < self.jwks_cache_duration):
            return self.jwks_cache
        
        try:
            # Fetch JWKS from Clerk
            async with httpx.AsyncClient() as client:
                # Extract frontend API from publishable key to construct JWKS URL
                if self.clerk_publishable_key:
                    try:
                        # Decode the base64-encoded part of the publishable key
                        import base64
                        parts = self.clerk_publishable_key.split('_')
                        if len(parts) >= 3:
                            # Decode the base64 part to get the frontend API
                            encoded_part = parts[2]
                            # Add padding if needed
                            missing_padding = len(encoded_part) % 4
                            if missing_padding:
                                encoded_part += '=' * (4 - missing_padding)
                            
                            decoded_bytes = base64.b64decode(encoded_part)
                            decoded_str = decoded_bytes.decode('utf-8')
                            
                            # Extract domain from decoded string (should be something like "renewed-squid-37.clerk.accounts.dev$")
                            if '.clerk.accounts.dev' in decoded_str:
                                frontend_api = decoded_str.replace('.clerk.accounts.dev$', '').replace('.clerk.accounts.dev', '')
                                jwks_url = f"https://{frontend_api}.clerk.accounts.dev/.well-known/jwks.json"
                            else:
                                jwks_url = "https://clerk.dev/.well-known/jwks.json"
                        else:
                            jwks_url = "https://clerk.dev/.well-known/jwks.json"
                    except Exception:
                        # Fallback to generic endpoint if decoding fails
                        jwks_url = "https://clerk.dev/.well-known/jwks.json"
                else:
                    # Fallback to generic endpoint
                    jwks_url = "https://clerk.dev/.well-known/jwks.json"
                
                response = await client.get(jwks_url)
                response.raise_for_status()
                
                self.jwks_cache = response.json()
                self.jwks_cache_time = current_time
                return self.jwks_cache
                
        except Exception as e:
            # Fallback to unverified claims in development or with test keys
            if not self.clerk_secret_key or (self.clerk_secret_key and self.clerk_secret_key.startswith('sk_test_')):
                return {}
            raise HTTPException(
                status_code=503,
                detail=f"Unable to fetch Clerk JWKS for token verification: {str(e)}"
            )
    
    def verify_jwt_signature(self, token: str, jwks: Dict[str, Any]) -> Dict[str, Any]:
        """Verify JWT signature using Clerk's public keys"""
        try:
            # Get the signing key from the JWT header
            unverified_header = jwt.get_unverified_header(token)
            rsa_key = {}
            
            for key in jwks.get("keys", []):
                if key["kid"] == unverified_header["kid"]:
                    rsa_key = {
                        "kty": key["kty"],
                        "kid": key["kid"],
                        "use": key["use"],
                        "n": key["n"],
                        "e": key["e"]
                    }
                    break
            
            if not rsa_key:
                raise HTTPException(
                    status_code=401,
                    detail="Unable to find appropriate key for token verification"
                )
            
            # Verify the token
            payload = jwt.decode(
                token,
                rsa_key,
                algorithms=["RS256"],
                audience=None,  # Clerk doesn't use audience
                options={"verify_aud": False}
            )
            
            return payload
            
        except JWTError as e:
            raise HTTPException(
                status_code=401,
                detail=f"Token verification failed: {str(e)}"
            )
        
    async def verify_token(self, credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
        token = credentials.credentials
        
        try:
            if self.clerk_secret_key and not self.clerk_secret_key.startswith('sk_test_'):
                # Production: Verify token signature with Clerk's public keys
                try:
                    jwks = await self.get_clerk_jwks()
                    if jwks:
                        payload = self.verify_jwt_signature(token, jwks)
                    else:
                        # Fallback for development
                        payload = jwt.get_unverified_claims(token)
                    
                    user_id = payload.get("sub")
                    
                    if not user_id:
                        raise HTTPException(
                            status_code=401, 
                            detail="Invalid authentication credentials: missing user ID"
                        )
                    
                    # Verify token expiration
                    exp = payload.get("exp")
                    if exp and time.time() > exp:
                        raise HTTPException(
                            status_code=401,
                            detail="Token has expired"
                        )
                    
                    return {"user_id": user_id, "payload": payload}
                    
                except HTTPException:
                    raise
                except Exception as e:
                    raise HTTPException(
                        status_code=401,
                        detail=f"Token verification failed: {str(e)}"
                    )
            else:
                # Development/test fallback: decode without verification
                payload = jwt.get_unverified_claims(token)
                user_id = payload.get("sub")
                
                if not user_id:
                    raise HTTPException(
                        status_code=401,
                        detail="Invalid authentication credentials: missing user ID"
                    )
                    
                return {"user_id": user_id, "payload": payload}
            
        except JWTError as e:
            raise HTTPException(
                status_code=401,
                detail=f"Invalid authentication credentials: {str(e)}"
            )

clerk_auth = ClerkAuth()

async def get_current_user(auth_data: dict = Security(clerk_auth.verify_token)) -> str:
    return auth_data["user_id"]