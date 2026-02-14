# 🤖 Career Agent

> **AI-Powered Career Co-Pilot** - From Resume to Real Employment

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-000?style=for-the-badge&logo=vercel)](https://career-3ne4hs5om-bharathans-projects-30f45a85.vercel.app/)
[![Team](https://img.shields.io/badge/Team-7Byte-blue?style=for-the-badge)](https://github.com/iambharathan)

---

## 🎯 Problem Statement

Job seekers struggle with:
- **ATS Rejection**: 75% of resumes never reach human eyes due to poor ATS optimization
- **Skill Gaps**: Candidates don't know what skills they're missing for their dream roles
- **No Clear Roadmap**: Lack of structured learning paths to become job-ready

---

## 💡 Our Solution: Career Agent

An **AI-powered career platform** that:
1. **Analyzes resumes** using OpenAI GPT-4 for intelligent parsing
2. **Identifies skill gaps** by comparing your skills against job requirements
3. **Generates personalized 30-day learning roadmaps** with curated resources

---

## 🚀 Live Demo

**🔗 [https://career-3ne4hs5om-bharathans-projects-30f45a85.vercel.app/](https://career-3ne4hs5om-bharathans-projects-30f45a85.vercel.app/)**

---

## ✨ Key Features

### 1. 📄 AI Resume Screening
- Upload PDF/DOCX resumes
- AI extracts skills, experience, and qualifications
- Get ATS compatibility score
- Receive improvement suggestions

### 2. 🎯 Smart Skill Gap Analysis
- Compare your skills against target roles
- Visual skill comparison charts
- Identify critical missing skills
- Priority-based skill recommendations

### 3. 📅 30-Day Personalized Roadmap
- AI-generated learning plan
- Grouped daily tasks (Day 1-7, Day 8-14, etc.)
- Curated learning resources
- Expandable day-by-day breakdown
- Progress tracking checkpoints

### 4. 📝 AI Resume Builder
- Generate professional summaries
- AI-powered content suggestions
- Multiple resume templates
- Export to PDF

---

## 🛠️ Technical Implementation

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Landing    │  │  Resume     │  │  Skill Gap          │  │
│  │  Page       │  │  Screening  │  │  Analysis           │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Resume     │  │  30-Day     │  │  Dashboard          │  │
│  │  Builder    │  │  Roadmap    │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI LAYER (OpenAI GPT-4)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Resume     │  │  Skill Gap  │  │  Roadmap            │  │
│  │  Parser     │  │  Analyzer   │  │  Generator          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Supabase)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  User       │  │  Resumes    │  │  Roadmaps           │  │
│  │  Profiles   │  │  Storage    │  │  Storage            │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, Shadcn/UI |
| **Animations** | Framer Motion |
| **AI/ML** | OpenAI GPT-4 API |
| **Backend** | Supabase (PostgreSQL) |
| **PDF Processing** | pdf-parse, pdfjs-dist |
| **Deployment** | Vercel |

### Key Integrations

1. **OpenAI GPT-4**: Intelligent resume parsing, skill extraction, roadmap generation
2. **Supabase**: User authentication, data storage, real-time updates
3. **PDF.js**: Client-side PDF text extraction
4. **Recharts**: Interactive skill comparison visualizations

---

## 🧠 Logic & System Reasoning

### Resume Analysis Flow
```
User uploads resume → PDF text extraction → OpenAI parses content →
Extract skills, experience, education → Store in database → Display results
```

### Skill Gap Detection Logic
```
1. Parse user's current skills from resume
2. Fetch required skills for target role (AI-powered)
3. Compare and calculate gap percentage
4. Prioritize skills by importance
5. Generate visual comparison
```

### 30-Day Roadmap Generation
```
1. Identify missing skills from gap analysis
2. Categorize by complexity (complex: 7 days, medium: 4 days, basic: 3 days)
3. Create daily learning tasks with resources
4. Group similar consecutive days
5. Add checkpoints and projects
```

### Edge Case Handling
- **Empty resumes**: Graceful error messages
- **Unsupported formats**: File type validation
- **API failures**: Fallback to cached data
- **Large files**: Size limit with user feedback

---

## 💡 Innovation & Idea Quality

### Originality
- **Multi-agent AI approach**: Different AI "agents" handle resume analysis, skill gap detection, and roadmap generation
- **Smart day grouping**: Similar learning days are grouped (Day 1-7) with expandable details
- **Realistic skill pacing**: Complex skills get more days, not just equal distribution

### Practical Usefulness
- Solves real job-seeker pain points
- Actionable roadmaps with specific resources
- ATS optimization suggestions
- Progress tracking

### Creativity
- Animated, modern UI/UX
- Typewriter text effects
- Glass-morphism design
- Interactive skill comparison charts

---

## 📁 Project Structure

```
Career-Navigator-fresh/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # Shadcn components
│   │   ├── dashboard/    # Dashboard-specific components
│   │   ├── Navbar.tsx
│   │   └── DashboardNavbar.tsx
│   ├── pages/            # Main pages
│   │   ├── Index.tsx     # Landing page
│   │   ├── Dashboard.tsx
│   │   ├── ResumeScreening.tsx
│   │   ├── ResumeBuilder.tsx
│   │   ├── SkillGap.tsx
│   │   └── Roadmap30Day.tsx
│   ├── config/           # API configurations
│   │   ├── apiKeys.ts
│   │   └── openaiClient.ts
│   ├── contexts/         # React contexts
│   │   └── UserContext.tsx
│   └── integrations/     # External service integrations
│       └── supabase/
├── public/
├── .env                  # Environment variables
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/iambharathan/career-prj.git

# Navigate to project
cd Career-Navigator-fresh

# Install dependencies
npm install

# Create .env file
echo "VITE_OPENAI_API_KEY=your_openai_api_key" > .env

# Start development server
npm run dev
```

### Environment Variables

```env
VITE_OPENAI_API_KEY=sk-...
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
```

---

## 👥 Team 7Byte

| Role | Member |
|------|--------|
| **Team Number** | 27 |
| **Problem Statement** | 1 |

---

## 📊 Judging Criteria Alignment

### 1. Technical Implementation (10 Marks)
- ✅ Working prototype deployed on Vercel
- ✅ OpenAI GPT-4 integration for AI features
- ✅ Supabase backend integration
- ✅ Clean React/TypeScript architecture
- ✅ PDF parsing and text extraction

### 2. Logic & System Reasoning (5 Marks)
- ✅ Clear multi-step workflow (Upload → Analyze → Gap → Roadmap)
- ✅ Intelligent skill prioritization
- ✅ Realistic learning day allocation
- ✅ Edge case handling

### 3. Innovation & Idea Quality (5 Marks)
- ✅ Unique AI-agent based approach
- ✅ Solves real job-seeker problems
- ✅ Creative UI with animations
- ✅ Practical 30-day roadmaps

### 4. Presentation & Demo (5 Marks)
- ✅ Live demo available
- ✅ Clean, intuitive UI
- ✅ Clear user flow

---

## 📜 License

MIT License - Feel free to use and modify!

---

<p align="center">
  <b>Built with ❤️ by Team 7Byte for TechX Vibeathon</b>
</p>
