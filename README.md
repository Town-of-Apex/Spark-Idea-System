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

## 🛠️ System Features
- **Dynamic AI Insights**: Every Spark is automatically analyzed for *Difficulty*, *Public Impact*, and *Strategic Department*.
- **Constellation Similarity**: Uses vector embeddings to visually and numerically group related ideas.
- **Impact vs. Effort Matrix**: A big-picture view of "Quick Wins" vs. "Big Bets" using AI-estimated metrics.
- **Keyword Pulse**: A keyword-cloud driven by actual idea frequency, filtering out noise.
- **AI Lab (Admin)**: Add your own "Analysis Dimensions" to have the AI extract new metadata fields from every submission.

---

## 🗺️ Future Roadmap

### Phase 4: Administrative Excellence (Next Up)
- [ ] **Advanced Status Tracking**: Detailed logs of when an idea moves from "Reviewing" to "Implemented."
- [ ] **Export to CSV/PDF**: Allow leadership to export the "Big Bets" quadrant for monthly meetings.
- [ ] **Microsoft SSO Integration**: Connect to town emails for verified identities and notifications.

### Phase 5: Resource & Synergy Alerts (Antigravity's Picks)
- [ ] **Cross-Dept Synergy Detector**: AI alerts that trigger when two departments spark similar ideas, prompting collaborative projects.
- [ ] **AI Cost-Estimation**: An AI dimension that estimates rough budget and labor hours to give leadership a better ROI picture.
- [ ] **Citizen Portal Link**: Toggle a public flag on implemented ideas to show residents what the staff is achieving for the town.

### Phase 6: Field-First & Gamification
- [ ] **Offline-First Support**: Mobile/Tablet optimization with sync for field workers (Public Works, Fire, etc.).
- [ ] **Apex Innovation Awards**: A leaderboard for staff whose ideas get the most traction or implementation.
- [ ] **QR-Spark**: Print dynamic QR codes for physical break rooms that link directly to specific "Problem Prompts."

---

*Designed for the Town of Apex — Peak Innovation Center.*
