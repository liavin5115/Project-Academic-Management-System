from .course import CourseCreate, CourseUpdate, CourseOut
from .lecturer import LecturerCreate, LecturerUpdate, LecturerOut
from .schedule import ScheduleCreate, ScheduleUpdate, ScheduleOut, ScheduleOverrideCreate, ScheduleOverrideUpdate, ScheduleOverrideOut
from .task import TaskCreate, TaskUpdate, TaskOut
from .material import MaterialCreate, MaterialUpdate, MaterialOut
from .notification_log import NotificationLogOut

__all__ = [
    "CourseCreate",
    "CourseUpdate",
    "CourseOut",
    "LecturerCreate",
    "LecturerUpdate",
    "LecturerOut",
    "ScheduleCreate",
    "ScheduleUpdate",
    "ScheduleOut",
    "ScheduleOverrideCreate",
    "ScheduleOverrideUpdate",
    "ScheduleOverrideOut",
    "TaskCreate",
    "TaskUpdate",
    "TaskOut",
    "MaterialCreate",
    "MaterialUpdate",
    "MaterialOut",
    "NotificationLogOut",
]