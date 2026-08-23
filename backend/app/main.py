import os
from fastapi import FastAPI, Depends, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional

from .database import engine, get_db, Base
from . import models, schemas
from .cloudinary_config import upload_meeting_photo, upload_study_resource_file

# Create database tables automatically on Neon PostgreSQL
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Generational Chapel International - Executive SPS API",
    description="Production REST API backend connected to Neon PostgreSQL and Cloudinary CDN.",
    version="2.0.0"
)

# Enable CORS for Vercel deployment frontend and local development
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://*.vercel.app",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "church": "Generational Chapel International",
        "system": "Executive SPS & Pastoral Portal API",
        "status": "Online",
        "database": "Neon PostgreSQL Connected",
        "media_cdn": "Cloudinary Enabled",
        "documentation": "/docs"
    }

# -------------------------------------------------------------------
# 1. SPS REPORT ENDPOINTS (WITH CLOUDINARY PHOTO PROOF UPLOADS)
# -------------------------------------------------------------------

@app.get("/api/sps-reports", response_model=List[schemas.SPSReportResponse])
def get_all_sps_reports(db: Session = Depends(get_db)):
    return db.query(models.SPSReport).order_by(models.SPSReport.date_submitted.desc()).all()

@app.post("/api/sps-reports", response_model=schemas.SPSReportResponse)
async def create_sps_report(
    group_name: str = Form(...),
    shepherd_name: str = Form(...),
    shepherd_phone: Optional[str] = Form(None),
    zone_name: str = Form(...),
    attendance: int = Form(0),
    souls_won: int = Form(0),
    notes: Optional[str] = Form(None),
    photo_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    photo_url = None
    if photo_file:
        file_bytes = await photo_file.read()
        photo_url = upload_meeting_photo(file_bytes, photo_file.filename)

    status = "healthy"
    if attendance < 5 and attendance > 0:
        status = "warning"
    elif attendance == 0:
        status = "flagged"

    report = models.SPSReport(
        shepherd_name=shepherd_name,
        shepherd_phone=shepherd_phone,
        group_name=group_name,
        zone_name=zone_name,
        attendance=attendance,
        souls_won=souls_won,
        notes=notes,
        photo_proof_url=photo_url,
        status=status
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report

# -------------------------------------------------------------------
# 2. ZONE REPORTS ENDPOINTS
# -------------------------------------------------------------------

@app.get("/api/zone-reports", response_model=List[schemas.ZoneReportResponse])
def get_zone_reports(db: Session = Depends(get_db)):
    return db.query(models.ZoneReport).order_by(models.ZoneReport.date_submitted.desc()).all()

@app.post("/api/zone-reports", response_model=schemas.ZoneReportResponse)
def create_zone_report(report_data: schemas.ZoneReportCreate, db: Session = Depends(get_db)):
    report = models.ZoneReport(**report_data.dict())
    db.add(report)
    db.commit()
    db.refresh(report)
    return report

# -------------------------------------------------------------------
# 3. SUNDAY ATTENDANCE ENDPOINTS
# -------------------------------------------------------------------

@app.get("/api/sunday-attendance", response_model=List[schemas.SundayAttendanceResponse])
def get_sunday_attendance(db: Session = Depends(get_db)):
    return db.query(models.SundayAttendance).order_by(models.SundayAttendance.service_date.desc()).all()

@app.post("/api/sunday-attendance", response_model=schemas.SundayAttendanceResponse)
def create_sunday_attendance(att_data: schemas.SundayAttendanceCreate, db: Session = Depends(get_db)):
    record = models.SundayAttendance(**att_data.dict())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

# -------------------------------------------------------------------
# 4. STUDY RESOURCES (WITH CLOUDINARY PDF UPLOADS)
# -------------------------------------------------------------------

@app.get("/api/resources/studies")
def get_study_resources(db: Session = Depends(get_db)):
    return db.query(models.StudyResource).order_by(models.StudyResource.date_published.desc()).all()

@app.post("/api/resources/studies")
async def create_study_resource(
    target_week: str = Form(...),
    topic_title: str = Form(...),
    scripture_passage: str = Form(...),
    memory_verse: Optional[str] = Form(None),
    discussion_prompts: Optional[str] = Form(None),
    pdf_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    pdf_url = None
    if pdf_file:
        file_bytes = await pdf_file.read()
        pdf_url = upload_study_resource_file(file_bytes, pdf_file.filename)

    resource = models.StudyResource(
        target_week=target_week,
        topic_title=topic_title,
        scripture_passage=scripture_passage,
        memory_verse=memory_verse,
        discussion_prompts=discussion_prompts,
        file_url=pdf_url
    )
    db.add(resource)
    db.commit()
    db.refresh(resource)
    return resource

# -------------------------------------------------------------------
# 5. ANNOUNCEMENTS & MEETINGS
# -------------------------------------------------------------------

@app.get("/api/announcements", response_model=List[schemas.AnnouncementResponse])
def get_announcements(db: Session = Depends(get_db)):
    return db.query(models.Announcement).order_by(models.Announcement.created_at.desc()).all()

@app.post("/api/announcements", response_model=schemas.AnnouncementResponse)
def create_announcement(ann_data: schemas.AnnouncementCreate, db: Session = Depends(get_db)):
    ann = models.Announcement(**ann_data.dict())
    db.add(ann)
    db.commit()
    db.refresh(ann)
    return ann

@app.delete("/api/announcements/{ann_id}")
def delete_announcement(ann_id: str, db: Session = Depends(get_db)):
    ann = db.query(models.Announcement).filter(models.Announcement.id == ann_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
    db.delete(ann)
    db.commit()
    return {"message": "Announcement deleted successfully"}

@app.get("/api/meetings", response_model=List[schemas.MeetingResponse])
def get_meetings(db: Session = Depends(get_db)):
    return db.query(models.Meeting).order_by(models.Meeting.meeting_date.desc()).all()

@app.post("/api/meetings", response_model=schemas.MeetingResponse)
def create_meeting(mtg_data: schemas.MeetingCreate, db: Session = Depends(get_db)):
    mtg = models.Meeting(**mtg_data.dict())
    db.add(mtg)
    db.commit()
    db.refresh(mtg)
    return mtg

@app.delete("/api/meetings/{mtg_id}")
def delete_meeting(mtg_id: str, db: Session = Depends(get_db)):
    mtg = db.query(models.Meeting).filter(models.Meeting.id == mtg_id).first()
    if not mtg:
        raise HTTPException(status_code=404, detail="Meeting not found")
    db.delete(mtg)
    db.commit()
    return {"message": "Meeting deleted successfully"}

# -------------------------------------------------------------------
# 6. MEMBERS DIRECTORY
# -------------------------------------------------------------------

@app.get("/api/members", response_model=List[schemas.MemberResponse])
def get_members(db: Session = Depends(get_db)):
    return db.query(models.Member).order_by(models.Member.created_at.desc()).all()

@app.post("/api/members", response_model=schemas.MemberResponse)
def create_member(mem_data: schemas.MemberCreate, db: Session = Depends(get_db)):
    mem = models.Member(**mem_data.dict())
    db.add(mem)
    db.commit()
    db.refresh(mem)
    return mem
