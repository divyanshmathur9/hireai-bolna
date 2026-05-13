# 🎯 HireAI — AI Candidate Screening System

> Built for the Bolna Full Stack Engineer Assignment by Divyansh Mathur

![HireAI Dashboard](https://img.shields.io/badge/Status-Live-brightgreen) ![Bolna](https://img.shields.io/badge/Powered%20by-Bolna%20Voice%20AI-blue) ![Next.js](https://img.shields.io/badge/Frontend-Next.js-black) ![Node.js](https://img.shields.io/badge/Backend-Node.js-green)

---

## 🧠 Problem Statement

HR teams waste **15 minutes per candidate** on initial phone screenings — asking basic questions about notice period, salary expectations, and availability. Most candidates are filtered out at this stage anyway.

**HireAI automates this entirely using Bolna's Voice AI.**

---

## ✅ Outcome Metric

| Metric | Before (Manual) | After (HireAI) |
|--------|----------------|----------------|
| Time per screening | 15 minutes | 3 minutes |
| HR effort required | High | Zero |
| Consistency | Varies | 100% consistent |
| Scalability | 1 call at a time | Unlimited parallel calls |

---

## 🏗️ Architecture

```
Recruiter (Web App)
       ↓
Next.js Frontend (HireAI Dashboard)
       ↓
Node.js / Express Backend API
       ↓
Bolna Voice AI Agent (Maya)
       ↓
Candidate's Phone (Real Call)
       ↓
Webhook → Backend scores call
       ↓
Supabase DB → Dashboard updates live
```

---

## 🚀 Features

- 📞 **One-click screening calls** — enter candidate details and trigger a real AI phone call
- 🎙️ **Maya Voice Agent** — structured 5-question HR screening prompt on Bolna
- 📊 **Live dashboard** — real-time status updates every 5 seconds
- 🧠 **AI scoring** — automatic 0-100 score based on transcript analysis
- 🔍 **Search & filter** — find candidates by name, role, or status
- 📋 **Transcript viewer** — full call transcript in a slide-in detail panel
- ✓ **Hire / Reject actions** — quick decision buttons per candidate
- 📥 **CSV export** — download all screening results

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js, Tailwind CSS |
| Backend | Node.js, Express |
| Database | Supabase (PostgreSQL) |
| Voice AI | Bolna (Maya Agent) |
| Webhook tunnel | ngrok |
| Deployment | Vercel (frontend), Railway (backend) |

---

## 📁 Project Structure

```
hireai-bolna/
├── bolna-screener/          # Backend
│   ├── server.js            # Express API + webhook handler
│   ├── .env                 # Environment variables
│   └── package.json
│
└── bolna-frontend/          # Frontend
    ├── pages/
│   │   └── index.js         # Main dashboard
    ├── next.config.js       # API proxy config
    └── package.json
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- Bolna account (platform.bolna.ai)
- Supabase account (supabase.com)
- ngrok account (ngrok.com)

### 1. Clone the repo
```bash
git clone https://github.com/divyanshmathur/hireai-bolna.git
cd hireai-bolna
```

### 2. Setup Backend
```bash
cd bolna-screener
npm install
```

Create `.env` file:
```
BOLNA_API_KEY=your_bolna_api_key
BOLNA_AGENT_ID=your_agent_id
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
PORT=3001
```

### 3. Setup Supabase
Run this SQL in Supabase SQL Editor:
```sql
CREATE TABLE candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  phone TEXT,
  role TEXT,
  call_id TEXT,
  status TEXT DEFAULT 'pending',
  transcript TEXT,
  score INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Setup Frontend
```bash
cd ../bolna-frontend
npm install
```

### 5. Run the app
```bash
# Terminal 1 - Backend
cd bolna-screener && node server.js

# Terminal 2 - ngrok tunnel
ngrok http 3001

# Terminal 3 - Frontend
cd bolna-frontend && npm run dev
```

### 6. Add webhook to Bolna
Go to Bolna → AI Candidate Screener → Analytics tab → paste your ngrok URL:
```
https://your-ngrok-url.ngrok-free.dev/api/webhook/bolna
```

Open `http://localhost:3000` and start screening! 🎉

---

## 🎙️ Bolna Agent Configuration

**Agent Name:** AI Candidate Screener  
**Voice:** Maya  
**Language:** English  
**Routing:** India  

**Screening Questions:**
1. Confirm interest in the role
2. Current notice period
3. Salary expectations (LPA)
4. Relevant experience summary
5. Open to hybrid work from Pune

---

## 📹 Demo

> https://drive.google.com/drive/folders/1mPMc-DjedBzEB52mNbLfBlslhUXMCobL

---

## 👨‍💻 Author

**Divyansh Mathur**  
div9mathur@gmail.com  
Built for Bolna FSE Assignment — May 2026
