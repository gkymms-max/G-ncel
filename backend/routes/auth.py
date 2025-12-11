from fastapi import APIRouter, HTTPException, status
from models import User, UserLogin, UserRegister, Token
from utils import db, hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=Token)
async def register(user_data: UserRegister):
    # Check if username exists
    existing_user = await db.users.find_one({"username": user_data.username}, {"_id": 0})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    
    # Check if this is the first user (will be admin)
    user_count = await db.users.count_documents({})
    role = "admin" if user_count == 0 else "user"
    
    # Create user
    user = User(
        username=user_data.username,
        password_hash=hash_password(user_data.password),
        role=role
    )
    
    user_dict = user.model_dump()
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    await db.users.insert_one(user_dict)
    
    # Create token
    access_token = create_access_token(data={"username": user.username, "role": user.role})
    
    return Token(access_token=access_token, token_type="bearer", role=user.role)

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"username": credentials.username}, {"_id": 0})
    if not user or not verify_password(credentials.password, user['password_hash']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    access_token = create_access_token(data={"username": user['username'], "role": user['role']})
    
    return Token(access_token=access_token, token_type="bearer", role=user['role'])
