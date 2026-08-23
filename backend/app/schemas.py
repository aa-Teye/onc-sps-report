from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class SPSReportCreate(BaseModel):
    shepherd_name: str
    shepherd_phone: Optional[str] = None
    group_name: str
    zone_name: str
    attendance: int
    souls_won: int
    notes: Optional[str] = None

class SPSReportResponse(SPSReportCreate):
    id: str
    photo_proof_url: Optional[str] = None
    status: str
    date_submitted: datetime

    class Config:
        from_attributes = True

class ZoneReportCreate(BaseModel):
    zone_leader_name: str
    zone_name: str
    total_shepherds: int
    reported_count: int
    total_attendance: int
    has_issue: bool = False
    issue_text: Optional[str] = None
    issue_priority: Optional[str] = "Low"

class ZoneReportResponse(ZoneReportCreate):
    id: str
    date_submitted: datetime

    class Config:
        from_attributes = True

class SundayAttendanceCreate(BaseModel):
    branch_name: str
    pastor_name: str
    men_count: int
    women_count: int
    children_count: int
    youth_count: int
    first_timers_count: int
    offering_ghc: str

class SundayAttendanceResponse(SundayAttendanceCreate):
    id: str
    service_date: datetime

    class Config:
        from_attributes = True

class AnnouncementCreate(BaseModel):
    title: str
    category: str
    event_date: Optional[str] = None
    event_location: Optional[str] = None
    description: str

class AnnouncementResponse(AnnouncementCreate):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class MeetingCreate(BaseModel):
    title: str
    meeting_date: str
    meeting_time: str
    venue: str
    target_group: str
    agenda: Optional[str] = None
    scheduled_by: str

class MeetingResponse(MeetingCreate):
    id: str
    status: str

    class Config:
        from_attributes = True

class MemberCreate(BaseModel):
    full_name: str
    phone_number: Optional[str] = None
    shepherd_name: Optional[str] = None
    zone_name: str
    residence: Optional[str] = None
    member_type: str = "active"
    risk_status: str = "low"

class MemberResponse(MemberCreate):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
