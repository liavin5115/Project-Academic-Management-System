from .auth import router as auth_router
from .courses import router as courses_router
from .lecturers import router as lecturers_router
from .schedules import router as schedules_router
from .overrides import router as overrides_router
from .tasks import router as tasks_router
from .materials import router as materials_router
from .dashboard import router as dashboard_router
from .notifications import router as notifications_router

from .settings import router as settings_router
from .gpa import router as gpa_router

__all__ = [
    "auth_router",
    "courses_router",
    "lecturers_router",
    "schedules_router",
    "overrides_router",
    "tasks_router",
    "materials_router",
    "dashboard_router",
    "notifications_router",
    "settings_router",
    "gpa_router",
]