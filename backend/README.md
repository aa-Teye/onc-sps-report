# Generational Chapel International - Production FastAPI Backend API

This backend is built using Python FastAPI, Neon PostgreSQL serverless database, and Cloudinary media storage CDN.

---

## How to Run Locally

### 1. Install Dependencies
```bash
cd backend
python -m venv venv
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Configure Environment Variables
Copy `env.example` to `.env` and fill in your credentials:
```bash
cp env.example .env
```
Fill in:
- `DATABASE_URL`: Connection string from Neon.tech (`postgresql://owner:pass@ep-xyz.neon.tech/neondb?sslmode=require`)
- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary Cloud Name
- `CLOUDINARY_API_KEY`: Cloudinary API Key
- `CLOUDINARY_API_SECRET`: Cloudinary API Secret

### 3. Run FastAPI Development Server
```bash
uvicorn app.main:app --reload --port 8000
```
Open **`http://localhost:8000/docs`** to test the automatic Swagger API documentation.

---

## Deploying to Render.com (Free 24/7 Hosting)

1. Create a free account on Render.com (https://render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub Repository: `https://github.com/aa-Teye/Generational-chapel-backend-`.
4. Set the following build settings:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Under **Environment Variables**, add:
   - `DATABASE_URL` (From Neon.tech)
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
6. Click **Create Web Service**. Your live backend URL will be: `https://your-api.onrender.com`.

---

## Media Upload Capabilities
- **Meeting Proof Photos**: Uploaded via `POST /api/sps-reports` (JPG/PNG compressed and stored on Cloudinary).
- **Weekly Study Guide PDFs**: Uploaded via `POST /api/resources/studies` (PDF/DOCX stored on Cloudinary raw storage).
