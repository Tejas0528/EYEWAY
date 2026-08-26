from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time

from db.database import connect_db, disconnect_db
from routes import auth, complaints, analytics

app = FastAPI(
    title="EYEWAY — Civic Governance API",
    description="Role-based complaint management system for citizens, officers, and admins.",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Timing middleware ─────────────────────────────────────────────────────────
@app.middleware("http")
async def timing(request: Request, call_next):
    t = time.time()
    response = await call_next(request)
    response.headers["X-Response-Time"] = f"{(time.time()-t)*1000:.1f}ms"
    return response

# ── Lifecycle ─────────────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    await connect_db()

@app.on_event("shutdown")
async def shutdown():
    await disconnect_db()

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router,       prefix="/auth",       tags=["Auth"])
app.include_router(complaints.router, prefix="/complaints",  tags=["Complaints"])
app.include_router(analytics.router,  prefix="/analytics",  tags=["Analytics"])

# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    return {"app": "EYEWAY API", "version": "2.0.0", "status": "running", "docs": "/docs"}

@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok"}
