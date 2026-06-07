from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from jose import jwt, JWTError
from .config import settings
from .routers import (
    auth_router,
    courses_router,
    lecturers_router,
    schedules_router,
    overrides_router,
    tasks_router,
    materials_router,
    dashboard_router,
    notifications_router,
    settings_router,
)
from .routers.pomodoros import router as pomodoros_router
from .scheduler import start_scheduler

app = FastAPI(title="Academic Management System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, settings.secret_key, algorithms=["HS256"])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


# Include routers with /api prefix
app.include_router(auth_router, prefix="/api")
app.include_router(courses_router, prefix="/api")
app.include_router(lecturers_router, prefix="/api")
app.include_router(schedules_router, prefix="/api")
app.include_router(overrides_router, prefix="/api")
app.include_router(tasks_router, prefix="/api")
app.include_router(materials_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(notifications_router, prefix="/api")
app.include_router(settings_router, prefix="/api")
app.include_router(pomodoros_router, prefix="/api")


@app.on_event("startup")
async def startup_event():
    from .database import engine, Base
    Base.metadata.create_all(bind=engine)
    start_scheduler()