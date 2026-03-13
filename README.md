<img width="789" height="97" alt="image" src="https://github.com/user-attachments/assets/f6b6b4af-7f42-43c6-9015-e2236528027f" /># Intelligent Inclusive Learning Ecosystem
<img width="1277" height="734" alt="image" src="https://github.com/user-attachments/assets/731b4705-10ab-446a-adda-211d686a2685" />



https://github.com/user-attachments/assets/d6b799dd-b8a0-42a0-a588-4d62c13defb2


**Project resources**
<a href="https://drive.google.com/drive/folders/1mSzyuS_It3MjtxQI11ZgtFGYU0qDubYo?usp=sharing">Google Drive Folder</a>
**EduNova** (formerly SkillGPS) is a comprehensive, state-of-the-art educational platform designed to redefine self-paced learning. By leveraging advanced Artificial Intelligence (Groq & Google Gemini), it dynamically generates personalized learning roadmaps, assesses code in real-time within a multi-language IDE, and simulates technical interviews for comprehensive skill development.

---


## 🛠️ Technology Stack

| Category | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, GSAP (Animations) |
| **Backend API** | Node.js, Express.js, WebSocket |
| **AI Microservices** | Python, FastAPI, LangGraph, Groq API (Llama 3), Google Gemini |
| **Database** | SQLite, JSON Stores |
| **Code Execution** | Subprocess Execution, Docker (Optional scaling) |
|**langraph** | **Automate Agentic AI**|
|**Open AI Whisper** |
|**Bart ts ** | FFmpeg|
---

## ✨ Core Features

*   🗺️ **Dynamic AI Learning Paths:** Instantly generate structured, step-by-step roadmaps tailored to user goals and experience levels.
*   💻 **Integrated Multi-Language IDE:** A robust browser-based IDE supporting 17+ programming languages with real-time compilation and execution.
*   🧠 **AI Algorithm Assessor & Instructor:** A highly sophisticated LangGraph-powered AI engine that performs semantic logic auditing, detects edge cases, and provides instant, actionable feedback and optimized code references.
*   🎤 **Voice-Activated Assistant:** Multilingual voice navigation and hands-free tutoring for an accessible learning experience.
*   📄 **Intelligent Resume Builder:** Automatically aggregates learned skills and projects to generate professional, ATS-friendly resumes.
*   🎭 **Native AI Mock Interviews:** A deeply integrated technical and behavioral assessment engine simulating real-world tech interviews.
*   📊 **Progress Analytics:** Visual, data-driven dashboards tracking skill acquisition and milestone completion.

---



## 🏗️ System Architecture

The platform operates on a microservices architecture to ensure scalability and separation of concerns:

```text
EduNova_Workspace/
├── client/                     # Frontend UI (React) ────────────────────→ Port 5173
├── backend/                    # Core Business Logic (Node.js) ──────────→ Port 5001
├── ai/
│   ├── main.py                 # Learning Path & Task AI (FastAPI) ──────→ Port 8002
│   └── app.py                  # AI Algorithm Instructor (LangGraph) ────→ Port 5005
└── Ai-Interview-Tester/
    └── backend/                # Interview Assessment Engine (Node.js) ──→ Port 5000
```

---

## 🚀 Quick Start Guide

To run the platform locally, you will need to start the microservices concurrently. 

### 1. Install Dependencies

Open your terminal and install dependencies for each service:

```bash
# Frontend
cd client && npm install

# Core Backend
cd ../backend && npm install

# Interview Engine
cd ../Ai-Interview-Tester/backend && npm install

# AI Microservices
cd ../../ai && python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Ensure you have a `.env` file in the `ai/` directory with the required AI API keys:
```env
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Start the Services

Open **four separate terminals** and start the following processes:

**Terminal 1: Core Backend**
```bash
cd backend
node index.js
```

**Terminal 2: Interview Engine**
```bash
cd Ai-Interview-Tester/backend
npm start
```

**Terminal 3: AI Microservices (FastAPI + LangGraph)**
*Note: Both AI services can be run from the `ai/` directory.*
```bash
cd ai
# Start the Algorithm Instructor
python app.py 

# In another terminal inside /ai, start the Curriculum Generator:
python main.py
```

**Terminal 4: Frontend Development Server**
```bash
cd client
npm run dev
```

The application will be accessible at **`http://localhost:5173`**.

---

## 🧠 AI Assessment Engine Deep-Dive (v4.0)

Our proprietary Algorithm Validation Graph utilizes a **6-Node LangGraph State Machine**:
1. **Intent & Language Classifier:** Detects the language and extracts the problem context.
2. **Semantic Logic Auditor:** Checks code flow without penalizing style or syntax.
3. **Technical Flaw Detector:** Locates infinite loops, out-of-bounds, and operator errors.
4. **Edge Case Stress-Tester:** Evaluates against extreme bounds.
5. **The Gatekeeper (LLM Judge):** Re-validates flags to eliminate false positives.
6. **Response Orchestrator:** Generates precise, actionable feedback without revealing the answer unnecessarily.

---

## 👨‍💻 Developed By
**Wired Warriors**
