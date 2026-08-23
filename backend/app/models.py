import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users font-body"
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    full_name = Column(String, nullable=False)
    phone_number = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, nullable=False)  # 'shepherd', 'branch_pastor', 'zone_leader', 'general_overseer'
    hashed_pin = Column(String, nullable=False)
    zone_name = Column(String, nullable=True)
    branch_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class SPSReport(Base):
    __tablename__ = "sps_reports"

    id = Column(String, primary_key=True, default=generate_uuid)
    shepherd_name = Column(String, nullable=False)
    shepherd_phone = Column(String, nullable=True)
    group_name = Column(String, nullable=False)
    zone_name = Column(String, nullable=False)
    attendance = Column(Integer, default=0)
    souls_won = Column(Integer, default=0)
    notes = Column(Text, nullable=True)
    photo_proof_url = Column(String, nullable=True)  # Cloudinary URL for meeting screenshot
    status = Column(String, default="healthy")       # 'healthy', 'warning', 'flagged'
    date_submitted = Column(DateTime, default=datetime.utcnow)

class ZoneReport(Base):
    __tablename__ = "zone_reports"

    id = Column(String, primary_key=True, default=generate_uuid)
    zone_leader_name = Column(String, nullable=False)
    zone_name = Column(String, nullable=False)
    total_shepherds = Column(Integer, default=0)
    reported_count = Column(Integer, default=0)
    total_attendance = Column(Integer, default=0)
    has_issue = Column(Boolean, default=False)
    issue_text = Column(Text, nullable=True)
    issue_priority = Column(String, nullable=True) # 'Low', 'Medium', 'High'
    date_submitted = Column(DateTime, default=datetime.utcnow)

class SundayAttendance(Base):
    __tablename__ = "sunday_attendance"

    id = Column(String, primary_key=True, default=generate_uuid)
    branch_name = Column(String, nullable=False)
    pastor_name = Column(String, nullable=False)
    men_count = Column(Integer, default=0)
    women_count = Column(Integer, default=0)
    children_count = Column(Integer, default=0)
    youth_count = Column(Integer, default=0)
    first_timers_count = Column(Integer, default=0)
    offering_ghc = Column(String, default="0.00")
    service_date = Column(DateTime, default=datetime.utcnow)

class StudyResource(Base):
    __tablename__ = "study_resources"

    id = Column(String, primary_key=True, default=generate_uuid)
    target_week = Column(String, nullable=False)
    topic_title = Column(String, nullable=False)
    scripture_passage = Column(String, nullable=False)
    memory_verse = Column(Text, nullable=True)
    discussion_prompts = Column(Text, nullable=True)
    file_url = Column(String, nullable=True)        # Cloudinary PDF / DOCX CDN URL
    date_published = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="Active")

class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)       # 'Urgent Alert', 'Mandatory', 'General News'
    event_date = Column(String, nullable=True)
    event_location = Column(String, nullable=True)
    description = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    meeting_date = Column(String, nullable=False)
    meeting_time = Column(String, nullable=False)
    venue = Column(String, nullable=False)
    target_group = Column(String, nullable=False)
    agenda = Column(Text, nullable=True)
    scheduled_by = Column(String, nullable=False)
    status = Column(String, default="Scheduled")

class BoardEscalation(Base):
    __tablename__ = "board_escalations"

    id = Column(String, primary_key=True, default=generate_uuid)
    branch_name = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    category = Column(String, nullable=False)
    urgency = Column(String, default="Normal")
    budget_requested = Column(String, default="GH₵ 0")
    description = Column(Text, nullable=False)
    board_comments = Column(Text, nullable=True)
    status = Column(String, default="Under Board Review")
    created_at = Column(DateTime, default=datetime.utcnow)

class Member(Base):
    __tablename__ = "members"

    id = Column(String, primary_key=True, default=generate_uuid)
    full_name = Column(String, nullable=False)
    phone_number = Column(String, nullable=True)
    shepherd_name = Column(String, nullable=True)
    zone_name = Column(String, nullable=False)
    residence = Column(String, nullable=True)
    member_type = Column(String, default="active") # 'active', 'seeker', 'pending'
    risk_status = Column(String, default="low")    # 'low', 'medium', 'high'
    created_at = Column(DateTime, default=datetime.utcnow)
