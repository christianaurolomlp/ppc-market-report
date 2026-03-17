import os
import json
import logging
from datetime import datetime, timezone

import httpx
from bs4 import BeautifulSoup
import anthropic
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models import Report, ReportJob, ReportKeyword, ReportCompetitor, ReportInsight, AppConfig

logger = logging.getLogger(__name__)

ANTHROPIC_API_KEY_ENV = os.getenv("ANTHROPIC_API_KEY", "")


async def get_anthropic_api_key(db: AsyncSession) -> str:
    """Get API key: env first, then DB, then error."""
    if ANTHROPIC_API_KEY_ENV:
        return ANTHROPIC_API_KEY_ENV
    result = await db.execute(
        select(AppConfig).where(AppConfig.key == "anthropic_api_key")
    )
    row = result.scalar_one_or_none()
    if row and row.value:
        return row.value
    raise ValueError("API key no configurada. Ve a /configuracion para añadirla.")

ANALYSIS_PROMPT = """Eres un analista experto en PPC y marketing digital. Se te proporciona el contenido extraído de una página web. Tu tarea es analizar el negocio y generar un informe completo de mercado PPC.

## Contenido de la web analizada:
URL: {url}

{web_content}

## Tu tarea:
Analiza este negocio y genera un informe PPC completo. Responde ÚNICAMENTE con un JSON válido (sin markdown, sin ```json, solo el JSON puro) con este esquema exacto:

{{
  "business": {{
    "what_it_sells": "descripción clara de qué vende o qué servicio ofrece",
    "target_client": "a quién se dirige (tipo de cliente ideal)",
    "category": "categoría o sector del negocio",
    "market": "mercado geográfico principal (país/región)",
    "language": "idioma principal de la web",
    "confidence": "high|medium|low"
  }},
  "market_score": 7,
  "opportunity_level": "high|medium|low",
  "executive_summary": "Resumen ejecutivo de 3-4 frases sobre la oportunidad PPC de este negocio. Debe ser claro, accionable y entendible por un CEO no técnico.",
  "keyword_clusters": [
    {{
      "cluster": "nombre del cluster temático",
      "keywords": [
        {{
          "keyword": "keyword específica",
          "volume_estimate": "high|medium|low",
          "cpc_estimate": "€X-Y",
          "competition": "high|medium|low",
          "intent": "commercial|informational|transactional"
        }}
      ]
    }}
  ],
  "competitors": [
    {{
      "name": "nombre del competidor",
      "domain": "dominio.com",
      "google": "high|medium|low|none",
      "meta": "high|medium|low|none",
      "linkedin": "high|medium|low|none",
      "tiktok": "high|medium|low|none",
      "activity_level": "high|medium|low",
      "notes": "observación breve sobre este competidor"
    }}
  ],
  "insights": [
    {{
      "type": "insight|recommendation",
      "content": "contenido del insight o recomendación",
      "priority": 1
    }}
  ],
  "confidence_level": "high|medium|low"
}}

## Reglas importantes:
1. Genera 3-5 clusters de keywords con 3-5 keywords cada uno
2. Los CPC son ESTIMACIONES conservadoras basadas en el sector — indícalo como rango (ej: "€1-3")
3. Los volúmenes son estimaciones relativas (high/medium/low), no números exactos
4. Detecta 3 competidores probables inferidos del nicho — sé honesto si son inferidos
5. Las señales por canal (Google/Meta/LinkedIn/TikTok) deben basarse en el tipo de negocio y público objetivo
6. Genera al menos 3 insights y 3 recomendaciones (máximo 5 de cada una)
7. El market_score va de 1 a 10 (10 = máxima oportunidad)
8. Si la información es limitada, usa confidence_level "low" y sé transparente
9. NO inventes certeza donde no la hay — usa lenguaje conservador ("parece", "sugiere", "podría")
10. El executive_summary debe ser útil para un CEO que no sabe de PPC
11. Responde en el idioma de la web analizada (si es español, responde en español; si es inglés, en inglés)
"""


async def scrape_website(url: str) -> str:
    """Scrape website content using httpx + BeautifulSoup."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    try:
        async with httpx.AsyncClient(
            follow_redirects=True, timeout=10.0, verify=False
        ) as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")

        # Remove scripts, styles, nav, footer
        for tag in soup(["script", "style", "nav", "footer", "iframe", "noscript"]):
            tag.decompose()

        # Extract meaningful content
        parts = []

        # Title
        title = soup.find("title")
        if title:
            parts.append(f"Título: {title.get_text(strip=True)}")

        # Meta description
        meta_desc = soup.find("meta", attrs={"name": "description"})
        if meta_desc and meta_desc.get("content"):
            parts.append(f"Meta descripción: {meta_desc['content']}")

        # H1s
        for h1 in soup.find_all("h1"):
            text = h1.get_text(strip=True)
            if text:
                parts.append(f"H1: {text}")

        # H2s
        for h2 in soup.find_all("h2"):
            text = h2.get_text(strip=True)
            if text:
                parts.append(f"H2: {text}")

        # Main content — paragraphs
        for p in soup.find_all("p"):
            text = p.get_text(strip=True)
            if len(text) > 20:
                parts.append(text)

        # Limit content length
        content = "\n\n".join(parts)
        if len(content) > 8000:
            content = content[:8000] + "\n\n[...contenido truncado...]"

        return content if content.strip() else "No se pudo extraer contenido significativo de la web."

    except httpx.TimeoutException:
        return "Error: timeout al intentar acceder a la web. La web tardó más de 10 segundos en responder."
    except httpx.HTTPStatusError as e:
        return f"Error HTTP {e.response.status_code} al acceder a la web."
    except Exception as e:
        return f"Error al acceder a la web: {str(e)}"


async def analyze_with_claude(url: str, web_content: str, api_key: str) -> dict:
    """Send scraped content to Claude for analysis."""
    client = anthropic.Anthropic(api_key=api_key)

    prompt = ANALYSIS_PROMPT.format(url=url, web_content=web_content)

    message = client.messages.create(
        model="claude-sonnet-4-6-20250514",
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )

    response_text = message.content[0].text.strip()

    # Try to parse JSON — handle potential markdown wrapping
    if response_text.startswith("```"):
        lines = response_text.split("\n")
        # Remove first and last line (```json and ```)
        json_lines = []
        started = False
        for line in lines:
            if line.strip().startswith("```") and not started:
                started = True
                continue
            if line.strip() == "```" and started:
                break
            if started:
                json_lines.append(line)
        response_text = "\n".join(json_lines)

    return json.loads(response_text)


async def process_job(job_id: str, db: AsyncSession):
    """Process a report job end-to-end."""
    # Fetch job
    result = await db.execute(select(ReportJob).where(ReportJob.id == job_id))
    job = result.scalar_one_or_none()

    if not job:
        logger.error(f"Job {job_id} not found")
        return

    if job.status not in ("pending", "failed"):
        logger.info(f"Job {job_id} already {job.status}, skipping")
        return

    try:
        # Update status to processing
        job.status = "processing"
        await db.commit()

        # Step 1: Scrape website
        logger.info(f"Scraping {job.website_url}")
        web_content = await scrape_website(job.website_url)

        # Step 1.5: Get API key
        api_key = await get_anthropic_api_key(db)

        # Step 2: Analyze with Claude
        logger.info(f"Analyzing with Claude for job {job_id}")
        analysis = await analyze_with_claude(job.website_url, web_content, api_key)

        # Step 3: Save report
        business = analysis.get("business", {})
        report = Report(
            job_id=job.id,
            website_url=job.website_url,
            business_summary=json.dumps(business, ensure_ascii=False),
            what_it_sells=business.get("what_it_sells", ""),
            target_client=business.get("target_client", ""),
            category=business.get("category", ""),
            market=business.get("market", ""),
            language=business.get("language", ""),
            market_score=analysis.get("market_score", 5),
            opportunity_level=analysis.get("opportunity_level", "medium"),
            executive_summary=analysis.get("executive_summary", ""),
            confidence_level=analysis.get("confidence_level", "medium"),
        )
        db.add(report)
        await db.flush()

        # Save keywords
        for cluster in analysis.get("keyword_clusters", []):
            cluster_name = cluster.get("cluster", "General")
            for kw in cluster.get("keywords", []):
                keyword = ReportKeyword(
                    report_id=report.id,
                    cluster_name=cluster_name,
                    keyword=kw.get("keyword", ""),
                    search_volume=kw.get("volume_estimate", "medium"),
                    cpc_estimate=kw.get("cpc_estimate", "N/A"),
                    competition_level=kw.get("competition", "medium"),
                    intent_type=kw.get("intent", "commercial"),
                )
                db.add(keyword)

        # Save competitors
        for comp in analysis.get("competitors", []):
            competitor = ReportCompetitor(
                report_id=report.id,
                competitor_name=comp.get("name", ""),
                competitor_domain=comp.get("domain", ""),
                google_signal=comp.get("google", "none"),
                meta_signal=comp.get("meta", "none"),
                linkedin_signal=comp.get("linkedin", "none"),
                tiktok_signal=comp.get("tiktok", "none"),
                activity_level=comp.get("activity_level", "medium"),
                notes=comp.get("notes", ""),
            )
            db.add(competitor)

        # Save insights
        for ins in analysis.get("insights", []):
            insight = ReportInsight(
                report_id=report.id,
                type=ins.get("type", "insight"),
                content=ins.get("content", ""),
                priority_order=ins.get("priority", 1),
            )
            db.add(insight)

        # Update job as completed
        job.status = "completed"
        job.report_id = report.id
        job.completed_at = datetime.now(timezone.utc)
        await db.commit()

        logger.info(f"Job {job_id} completed. Report ID: {report.id}")

    except json.JSONDecodeError as e:
        job.status = "failed"
        job.error_message = f"Error parsing Claude response: {str(e)}"
        await db.commit()
        logger.error(f"Job {job_id} failed: JSON parse error — {e}")

    except anthropic.APIError as e:
        job.status = "failed"
        job.error_message = f"Anthropic API error: {str(e)}"
        await db.commit()
        logger.error(f"Job {job_id} failed: Anthropic API error — {e}")

    except Exception as e:
        job.status = "failed"
        job.error_message = f"Unexpected error: {str(e)}"
        await db.commit()
        logger.error(f"Job {job_id} failed: {e}", exc_info=True)
