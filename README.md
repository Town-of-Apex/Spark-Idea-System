# ⚡️ SPARK — The Civic Innovation Engine

**Spark** is a short-form idea-sharing marketplace designed specifically for the **Town of Apex**. It empowers staff to share, upvote, and refine ideas to improve town services, infrastructure, and internal processes.

## 🧠 Core Philosophy
- **Calm Surface, Sharp Signals**: A visually quiet interface where intent (votes, trends, status) pops only when it matters.
- **Ideas Are the UI**: Minimal borders and chrome, letting the content dominate.
- **AI-Augmented**: Leveraging local LLMs (Ollama) to automatically categorize, score, and group related ideas.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Python 3.10+** (managed via `uv`)
- **Node.js 18+**
- **Ollama**: Ensure Ollama is running at `http://localhost:11434`.
  - `ollama pull embeddinggemma:latest` (for similarity)
  - `ollama pull gemma3:4b` (for categorization)

### 2. Installation
From the project root:
```bash
# Install backend dependencies
cd backend && uv sync

# Install frontend dependencies
cd ../frontend && npm install
```

### 3. Launch (Both at once)
We've included a helper script to run the development environment concurrently:
```bash
chmod +x dev.sh
./dev.sh
```
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8000](http://localhost:8000) (Swagger: `/docs`)

---

## 🛡️ Administrative & Auth Features
- **Demo Identity System**: Session-based authentication for `@apexnc.org` emails. 
- **Admin-Locked Control**: The **Settings** (Admin) tab is only visible to specific verified accounts.
- **AI Processing Transparency**: Admin-only "AI READY/PENDING" status badges on every spark card.
- **Manual AI Reprocess**: A manual "fail-safe" button to trigger embeddings and metadata analysis if the background task needs re-running.
- **Responsive "Zero-Bleed" Design**: Cards are now fully responsive, ensuring text and metadata stay perfectly contained on laptop and tablet screens.
- **Lightweight Gamification**: A per-user achievement system with funny badges (e.g. "Human Tesla Coil") which triggers confetti animations upon unlock.
- **Profile Hub**: A dedicated dashboard for tracking citizen metrics (sparks shared, votes cast) and viewing collected badges.

## 🧠 AI & Visualizations
- **Dynamic Similarity Constellation**: An auto-scaling semantic graph that ensures all ideas are visible and clustered by similarity, regardless of dataset size.
- **Impact vs. Effort Matrix**: Strategic prioritization of "Big Bets" and "Quick Wins" using AI-estimated metrics.
- **Automatic Field Extraction**: The AI pulls *Public Impact*, *Effort*, and *Department* from every short-form submission automatically.

---

## 🗺️ Roadmap & Next Phases

### Phase 4: Data Portability & Reporting (High Priority)
- [ ] **Export to CSV/PDF**: Allow leadership to export the "Big Bets" quadrant and trending ideas for monthly strategy meetings.
- [ ] **Status History & Logging**: Track the journey of a Spark from "New" to "Implemented" with timestamps and notes.
- [ ] **Advanced Searching**: Filter ideas by department, AI impact score, or specific tags to find exactly what you need.

### Phase 5: Collaborative Intelligence
- [ ] **Cross-Dept Synergy Detector**: Proactive AI notifications that alert staff when their idea overlaps with another department's submission.
- [ ] **Microsoft Entra (SSO) Integration**: Move from the "Demo" auth to a production-ready Microsoft login.
- [ ] **Project Liaison Mapping**: Assign "Implementation Leads" to high-impact ideas to drive them toward completion.

### Small Improvements & Technical Debt
- [ ] **Impact & Priority Tracking**: Implement backend logic to track and aggregate AI-estimated impact and priority scores across all user submissions.
- [ ] **Admin UI for Achievements**: Move away from JSON-based configuration to a full administrative interface for adding/editing badges.
- [ ] **Mobile Sync**: Optimized offline-first experience for field workers (Public Works, Fire, Police).
- [ ] **Apex Innovation Leaderboard**: Recognize staff members who contribute the most implemented ideas.
- [ ] **Physical 'Spark' Stations**: QR codes for breakrooms that link directly to specific problem-prompting challenges.

---

*Designed for the Town of Apex — Peak Innovation Center.*
