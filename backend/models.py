import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Text,
    DateTime,
    ForeignKey,
    Enum as SAEnum,
)
from sqlalchemy.dialects.postgresql import UUID
from database import Base


def utcnow():
    return datetime.now(timezone.utc)


def new_uuid():
    return uuid.uuid4()


class Lead(Base):
    __tablename__ = "leads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    website_url = Column(String(2048), nullable=False)
    email = Column(String(512), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)


class ReportJob(Base):
    __tablename__ = "report_jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    lead_id = Column(UUID(as_uuid=True), ForeignKey("leads.id"), nullable=False)
    website_url = Column(String(2048), nullable=False)
    status = Column(
        String(20), default="pending", nullable=False
    )  # pending, processing, completed, failed
    error_message = Column(Text, nullable=True)
    report_id = Column(UUID(as_uuid=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    completed_at = Column(DateTime(timezone=True), nullable=True)


class Report(Base):
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    job_id = Column(UUID(as_uuid=True), ForeignKey("report_jobs.id"), nullable=False)
    website_url = Column(String(2048), nullable=False)
    business_summary = Column(Text, nullable=True)
    what_it_sells = Column(Text, nullable=True)
    target_client = Column(Text, nullable=True)
    category = Column(String(512), nullable=True)
    market = Column(String(512), nullable=True)
    language = Column(String(100), nullable=True)
    market_score = Column(Integer, nullable=True)
    opportunity_level = Column(String(20), nullable=True)  # high, medium, low
    executive_summary = Column(Text, nullable=True)
    confidence_level = Column(String(20), nullable=True)  # high, medium, low
    created_at = Column(DateTime(timezone=True), default=utcnow)


class ReportKeyword(Base):
    __tablename__ = "report_keywords"

    id = Column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    report_id = Column(UUID(as_uuid=True), ForeignKey("reports.id"), nullable=False)
    cluster_name = Column(String(512), nullable=False)
    keyword = Column(String(1024), nullable=False)
    search_volume = Column(String(50), nullable=True)  # high/medium/low
    cpc_estimate = Column(String(100), nullable=True)  # e.g. "€1-3"
    competition_level = Column(String(20), nullable=True)  # high/medium/low
    intent_type = Column(String(50), nullable=True)  # commercial/informational/transactional


class ReportCompetitor(Base):
    __tablename__ = "report_competitors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    report_id = Column(UUID(as_uuid=True), ForeignKey("reports.id"), nullable=False)
    competitor_name = Column(String(512), nullable=False)
    competitor_domain = Column(String(2048), nullable=True)
    google_signal = Column(String(20), nullable=True)  # high/medium/low/none
    meta_signal = Column(String(20), nullable=True)
    linkedin_signal = Column(String(20), nullable=True)
    tiktok_signal = Column(String(20), nullable=True)
    activity_level = Column(String(20), nullable=True)  # high/medium/low
    notes = Column(Text, nullable=True)


class AppConfig(Base):
    __tablename__ = "app_config"

    id = Column(Integer, primary_key=True)
    key = Column(String, unique=True, nullable=False)
    value = Column(Text, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)


class ReportInsight(Base):
    __tablename__ = "report_insights"

    id = Column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    report_id = Column(UUID(as_uuid=True), ForeignKey("reports.id"), nullable=False)
    type = Column(String(20), nullable=False)  # insight or recommendation
    content = Column(Text, nullable=False)
    priority_order = Column(Integer, nullable=False, default=1)
