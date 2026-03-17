import asyncio
import logging
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Optional

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db, init_db, async_session
from models import Lead, ReportJob, Report, ReportKeyword, ReportCompetitor, ReportInsight
from processor import process_job

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing database...")
    await init_db()
    logger.info("Database initialized")
    yield


app = FastAPI(
    title="PPC Market Report API",
    description="Analiza tu web y descubre tu oportunidad real en PPC",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Schemas ──────────────────────────────────────────────────────────

class LeadCreate(BaseModel):
    website_url: str
    email: Optional[str] = None


class LeadResponse(BaseModel):
    lead_id: str
    job_id: str
    status: str


class JobStatus(BaseModel):
    job_id: str
    status: str
    report_id: Optional[str] = None
    error_message: Optional[str] = None
    created_at: str
    completed_at: Optional[str] = None


class KeywordOut(BaseModel):
    cluster_name: str
    keyword: str
    search_volume: Optional[str] = None
    cpc_estimate: Optional[str] = None
    competition_level: Optional[str] = None
    intent_type: Optional[str] = None


class CompetitorOut(BaseModel):
    competitor_name: str
    competitor_domain: Optional[str] = None
    google_signal: Optional[str] = None
    meta_signal: Optional[str] = None
    linkedin_signal: Optional[str] = None
    tiktok_signal: Optional[str] = None
    activity_level: Optional[str] = None
    notes: Optional[str] = None


class InsightOut(BaseModel):
    type: str
    content: str
    priority_order: int


class ReportOut(BaseModel):
    id: str
    website_url: str
    what_it_sells: Optional[str] = None
    target_client: Optional[str] = None
    category: Optional[str] = None
    market: Optional[str] = None
    language: Optional[str] = None
    market_score: Optional[int] = None
    opportunity_level: Optional[str] = None
    executive_summary: Optional[str] = None
    confidence_level: Optional[str] = None
    created_at: str
    keywords: list[KeywordOut] = []
    competitors: list[CompetitorOut] = []
    insights: list[InsightOut] = []


# ── Background worker ────────────────────────────────────────────────

async def run_job_in_background(job_id: str):
    """Run the processing job in background."""
    async with async_session() as db:
        await process_job(job_id, db)


# ── Endpoints ────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "service": "ppc-market-report"}


@app.post("/api/leads", response_model=LeadResponse)
async def create_lead(
    data: LeadCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Create a new lead and start report generation."""
    # Normalize URL
    url = data.website_url.strip()
    if not url.startswith("http"):
        url = "https://" + url

    # Create lead
    lead = Lead(website_url=url, email=data.email)
    db.add(lead)
    await db.flush()

    # Create job
    job = ReportJob(lead_id=lead.id, website_url=url, status="pending")
    db.add(job)
    await db.commit()

    # Start processing in background
    background_tasks.add_task(run_job_in_background, str(job.id))

    return LeadResponse(
        lead_id=str(lead.id), job_id=str(job.id), status="pending"
    )


@app.get("/api/jobs/{job_id}", response_model=JobStatus)
async def get_job_status(job_id: str, db: AsyncSession = Depends(get_db)):
    """Get the status of a report job."""
    try:
        uid = uuid.UUID(job_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid job ID")

    result = await db.execute(select(ReportJob).where(ReportJob.id == uid))
    job = result.scalar_one_or_none()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return JobStatus(
        job_id=str(job.id),
        status=job.status,
        report_id=str(job.report_id) if job.report_id else None,
        error_message=job.error_message,
        created_at=job.created_at.isoformat() if job.created_at else "",
        completed_at=job.completed_at.isoformat() if job.completed_at else None,
    )


@app.get("/api/reports/{report_id}", response_model=ReportOut)
async def get_report(report_id: str, db: AsyncSession = Depends(get_db)):
    """Get the full report with all related data."""
    try:
        uid = uuid.UUID(report_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid report ID")

    # Fetch report
    result = await db.execute(select(Report).where(Report.id == uid))
    report = result.scalar_one_or_none()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    # Fetch keywords
    kw_result = await db.execute(
        select(ReportKeyword)
        .where(ReportKeyword.report_id == uid)
        .order_by(ReportKeyword.cluster_name)
    )
    keywords = kw_result.scalars().all()

    # Fetch competitors
    comp_result = await db.execute(
        select(ReportCompetitor).where(ReportCompetitor.report_id == uid)
    )
    competitors = comp_result.scalars().all()

    # Fetch insights
    ins_result = await db.execute(
        select(ReportInsight)
        .where(ReportInsight.report_id == uid)
        .order_by(ReportInsight.priority_order)
    )
    insights = ins_result.scalars().all()

    return ReportOut(
        id=str(report.id),
        website_url=report.website_url,
        what_it_sells=report.what_it_sells,
        target_client=report.target_client,
        category=report.category,
        market=report.market,
        language=report.language,
        market_score=report.market_score,
        opportunity_level=report.opportunity_level,
        executive_summary=report.executive_summary,
        confidence_level=report.confidence_level,
        created_at=report.created_at.isoformat() if report.created_at else "",
        keywords=[
            KeywordOut(
                cluster_name=kw.cluster_name,
                keyword=kw.keyword,
                search_volume=kw.search_volume,
                cpc_estimate=kw.cpc_estimate,
                competition_level=kw.competition_level,
                intent_type=kw.intent_type,
            )
            for kw in keywords
        ],
        competitors=[
            CompetitorOut(
                competitor_name=c.competitor_name,
                competitor_domain=c.competitor_domain,
                google_signal=c.google_signal,
                meta_signal=c.meta_signal,
                linkedin_signal=c.linkedin_signal,
                tiktok_signal=c.tiktok_signal,
                activity_level=c.activity_level,
                notes=c.notes,
            )
            for c in competitors
        ],
        insights=[
            InsightOut(
                type=i.type,
                content=i.content,
                priority_order=i.priority_order,
            )
            for i in insights
        ],
    )


@app.post("/api/process/{job_id}")
async def trigger_process(
    job_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Manually trigger processing of a job (internal use)."""
    try:
        uid = uuid.UUID(job_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid job ID")

    result = await db.execute(select(ReportJob).where(ReportJob.id == uid))
    job = result.scalar_one_or_none()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    background_tasks.add_task(run_job_in_background, str(job.id))

    return {"message": "Processing started", "job_id": str(job.id)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
