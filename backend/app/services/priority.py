from datetime import datetime


def calculate_priority_score(deadline: datetime, difficulty: int) -> float:
    now = datetime.now(deadline.tzinfo)
    hours_remaining = max((deadline - now).total_seconds() / 3600, 0.1)
    urgency = 1 / hours_remaining
    score = (urgency * 1000) * (difficulty / 5)
    return round(score, 4)