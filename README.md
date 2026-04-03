# Partner Intelligence Platform (PI Platform)

A production-ready internal web application for managing corporate international partnerships.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js · NestJS · TypeORM |
| Database | PostgreSQL 15 |
| Frontend | React 18 · TypeScript · Vite |
| UI | Ant Design 5 |
| Charts | ECharts (echarts-for-react) |
| State | TanStack Query + Zustand |
| Auth | JWT (Passport.js) |

---

## Project Structure

```
PI Platform/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/           # JWT auth, login, profile
│   │   │   ├── employees/      # Employee CRUD + org chart
│   │   │   ├── domains/        # Domain CRUD
│   │   │   ├── partners/       # Partner CRUD + health score
│   │   │   ├── assignments/    # Employee ↔ Partner assignments
│   │   │   ├── activities/     # Activity log + score trigger
│   │   │   ├── history/        # Audit log service
│   │   │   └── dashboard/      # Analytics endpoints
│   │   ├── common/
│   │   │   ├── decorators/     # @Roles, @CurrentUser
│   │   │   ├── guards/         # RolesGuard
│   │   │   ├── filters/        # HttpExceptionFilter
│   │   │   └── interceptors/   # TransformInterceptor
│   │   └── database/seed/      # Seed script with example data
│   └── ...
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Login/
    │   │   ├── Dashboard/      # KPIs, charts, activity feed
    │   │   ├── OrgChart/       # Hierarchy tree + workload
    │   │   ├── Partners/       # Explorer table with filters
    │   │   ├── PartnerDetail/  # Detail, activities, insights
    │   │   └── Admin/          # Employee/domain management
    │   ├── api/                # Typed API clients
    │   ├── components/         # Shared UI components
    │   ├── store/              # Zustand auth store
    │   └── types/              # Full TypeScript types
    └── ...
```

---

## Quick Start

### Option A: Docker Compose (Recommended)

```bash
# Clone the repo and enter the project
cd "PI Platform"

# Start all services
docker-compose up --build

# In a separate terminal, seed the database
docker exec pi_backend npm run seed
```

Access:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api
- **Swagger Docs**: http://localhost:3001/api/docs

---

### Option B: Local Development

#### Prerequisites
- Node.js 20+
- PostgreSQL 15

#### 1. Database Setup

```sql
CREATE DATABASE pi_platform;
CREATE USER pi_user WITH PASSWORD 'pi_password';
GRANT ALL PRIVILEGES ON DATABASE pi_platform TO pi_user;
```

#### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials

npm install
npm run start:dev
```

#### 3. Seed Data

```bash
# In a new terminal, in the backend directory:
npm run seed
```

#### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@company.com | password123 |
| Manager | david.kim@company.com | password123 |
| Staff | alice.j@company.com | password123 |

---

## API Overview

### Authentication
```
POST /api/auth/login       → { token, user }
GET  /api/auth/me          → Current user profile
```

### Dashboard (all GET)
```
GET /api/dashboard/stats              → KPI totals
GET /api/dashboard/workload           → Employee workload scores
GET /api/dashboard/domain-breakdown   → Per-domain analytics
GET /api/dashboard/activity-trend     → Activity count over time
GET /api/dashboard/risk-partners      → Partners at risk
GET /api/dashboard/recent-activities  → Latest activity feed
```

### Partners
```
GET    /api/partners          → List (with filters: domain, priority, status, search)
POST   /api/partners          → Create
GET    /api/partners/:id      → Detail (with activities + assignments)
PATCH  /api/partners/:id      → Update
DELETE /api/partners/:id      → Delete (admin only)
GET    /api/partners/:id/history → Audit log
POST   /api/partners/recalculate → Bulk health recalculation (admin)
```

### Employees
```
GET    /api/employees         → List (with workload + partner count)
POST   /api/employees         → Create (manager/admin)
GET    /api/employees/org-chart → Hierarchical org tree
GET    /api/employees/:id     → Detail with assignments
PATCH  /api/employees/:id     → Update
DELETE /api/employees/:id     → Delete (admin only)
```

### Assignments
```
POST   /api/assignments       → Assign employee to partner
GET    /api/assignments       → List (filter: employeeId, partnerId)
PATCH  /api/assignments/:id/role → Change role (main/support)
DELETE /api/assignments/:id   → Remove assignment
```

### Activities
```
POST   /api/activities        → Log activity (triggers health recalculation)
GET    /api/activities        → List (filter: partnerId, employeeId, type, from, to)
PATCH  /api/activities/:id    → Update
DELETE /api/activities/:id    → Delete (recalculates score)
```

---

## Business Logic

### Health Score Algorithm
Computed automatically on every activity change:

| Component | Criteria | Points |
|-----------|----------|--------|
| **Recency** | ≤7 days since last activity | 50 |
| | ≤14 days | 40 |
| | ≤30 days | 30 |
| | ≤60 days | 15 |
| | >60 days | 0 |
| **Volume** | 10+ activities in 90 days | 30 |
| | 6–9 | 25 |
| | 3–5 | 20 |
| | 1–2 | 10 |
| **Engagement** | 3+ activities in last 30 days | 20 |
| | 2 | 15 |
| | 1 | 10 |

**Max score: 100. No activities = 0.**

### Risk Detection
- Status → **Risk** if: no activity in 30+ days OR health_score < 40
- Status → **Inactive** if: no activity in 90+ days AND health_score < 10

### Workload Scoring
```
workload = Σ weight(partner.priorityLevel)
  Strategic = 3
  Key       = 2
  Normal    = 1
```

---

## RBAC Permissions

| Action | Staff | Manager | Admin |
|--------|-------|---------|-------|
| View all data | ✓ | ✓ | ✓ |
| Log activities | ✓ | ✓ | ✓ |
| Create/edit partners | — | ✓ | ✓ |
| Manage employees | — | ✓ | ✓ |
| Delete records | — | — | ✓ |
| Manage domains | — | — | ✓ |
| Bulk recalculate | — | — | ✓ |

---

## Example API Responses

### GET /api/dashboard/stats
```json
{
  "success": true,
  "data": {
    "totalPartners": 20,
    "byPriority": { "strategic": 7, "key": 7, "normal": 6 },
    "byStatus": { "active": 14, "risk": 5, "inactive": 1 },
    "totalEmployees": 12,
    "totalActivities": 48,
    "recentActivities": 23,
    "avgHealthScore": 61
  }
}
```

### GET /api/partners/:id
```json
{
  "success": true,
  "data": {
    "id": "uuid...",
    "name": "Microsoft",
    "priorityLevel": "Strategic",
    "status": "Active",
    "healthScore": 90,
    "domain": { "name": "Software", "colorHex": "#1890ff" },
    "assignments": [
      {
        "role": "main",
        "employee": { "name": "Alice Johnson", "title": "Partnership Manager" }
      }
    ],
    "activities": [
      {
        "type": "meeting",
        "date": "2024-01-20",
        "title": "Q1 Business Review",
        "note": "Discussed Azure consumption targets...",
        "employee": { "name": "Alice Johnson" }
      }
    ]
  }
}
```
