import os
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

def upload_meeting_photo(file_bytes, filename: str) -> str:
    """
    Uploads a shepherd meeting screenshot photo (JPG/PNG) to Cloudinary
    and returns a compressed mobile-optimized CDN URL.
    """
    result = cloudinary.uploader.upload(
        file_bytes,
        folder="generational_chapel/sps_photos",
        resource_type="image",
        transformation=[
            {"width": 1200, "crop": "limit"},
            {"quality": "auto:good"},
            {"fetch_format": "auto"}
        ]
    )
    return result.get("secure_url")

def upload_study_resource_file(file_bytes, filename: str) -> str:
    """
    Uploads a weekly SPS Study Guide resource file (PDF / DOCX) to Cloudinary
    and returns a secure download URL.
    """
    result = cloudinary.uploader.upload(
        file_bytes,
        folder="generational_chapel/study_guides",
        resource_type="raw",
        public_id=f"study_{filename}"
    )
    return result.get("secure_url")
