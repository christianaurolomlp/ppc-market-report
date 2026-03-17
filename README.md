# PPC Market Report

**Analiza tu web y descubre tu oportunidad real en PPC.**

Herramienta que genera automáticamente un informe gratuito de mercado PPC a partir de la URL de una web: demanda estimada, costes por clic, competidores probables, señales por canal y recomendaciones accionables.

![Stack](https://img.shields.io/badge/Stack-Next.js%20%2B%20FastAPI%20%2B%20PostgreSQL-blue)

---

## 🏗️ Stack

| Capa | Tecnología |
|------|-----------|
| **Frontend** | Next.js 14 (App Router, TypeScript, Tailwind CSS) |
| **Backend** | FastAPI (Python 3.11+) |
| **Base de datos** | PostgreSQL |
| **IA** | Claude Sonnet 4 (Anthropic API) |
| **Scraping** | httpx + BeautifulSoup4 |

## 📁 Estructura

```
ppc-market-report/
├── frontend/          # Next.js app
│   ├── src/app/
│   │   ├── page.tsx                    # Landing page
│   │   ├── procesando/[jobId]/page.tsx # Pantalla de procesamiento
│   │   ├── informe/[reportId]/page.tsx # Vista del informe
│   │   └── error/page.tsx              # Pantalla de error
│   └── .env.local
├── backend/
│   ├── main.py          # FastAPI app + endpoints
│   ├── models.py        # SQLAlchemy models
│   ├── database.py      # DB connection + init
│   ├── processor.py     # Scraping + Claude analysis
│   ├── requirements.txt
│   └── .env.example
└── README.md
```

## 🚀 Instalación

### Prerrequisitos

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+

### 1. Base de datos

```bash
createdb ppc_market_report
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tu DATABASE_URL y ANTHROPIC_API_KEY

# Ejecutar
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Abre http://localhost:3000

## 🔑 API Keys necesarias

| Key | Dónde obtenerla | Para qué |
|-----|----------------|---------|
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com/) | Análisis de negocio e informe IA |
| `DATABASE_URL` | Tu PostgreSQL local o hosted | Almacenar leads, jobs e informes |

## 📡 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/leads` | Crear lead + iniciar análisis |
| `GET` | `/api/jobs/{job_id}` | Estado del job |
| `GET` | `/api/reports/{report_id}` | Informe completo |
| `POST` | `/api/process/{job_id}` | Relanzar procesamiento |
| `GET` | `/health` | Health check |

## 🔄 Flujo

1. Usuario introduce URL en la landing
2. Se crea un lead y un job en DB
3. El backend scrapea la web (httpx + BeautifulSoup)
4. Envía contenido a Claude para análisis completo
5. Claude devuelve JSON estructurado con: negocio, keywords, competidores, insights, recomendaciones
6. Se guarda todo en PostgreSQL
7. El frontend redirige al informe visual

## 🚢 Deploy (Railway recomendado)

### Backend (FastAPI)
- Root directory: `backend`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Variables: `DATABASE_URL`, `ANTHROPIC_API_KEY`

### Frontend (Next.js)
- Root directory: `frontend`
- Build command: `npm run build`
- Start command: `npm start`
- Variables: `NEXT_PUBLIC_API_URL` (URL del backend)

### PostgreSQL
- Añadir servicio PostgreSQL en Railway
- Conectar la `DATABASE_URL` al backend

## 📋 Roadmap

- [x] MVP: Landing + procesamiento + informe básico
- [ ] Email capture antes de mostrar informe completo
- [ ] DataForSEO API para datos reales de keywords
- [ ] Panel admin con historial de informes
- [ ] Scoring comercial de leads
- [ ] Alertas por email cuando se genera un informe
- [ ] Versión premium con más datos

---

**by George Growth**
