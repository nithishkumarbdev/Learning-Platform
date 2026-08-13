export type Project = {
  id: string;
  name: string;
  days: string;
  goal: string;
  why: string;
  skills: string[];
  tools: string[];
  features: string[];
  aiTools: string[];
  automation: string;
  resumeBullet: string;
};

export const PROJECTS: Project[] = [
  {
    id: "py-toolkit",
    name: "Python Automation Toolkit",
    days: "Day 1–14",
    goal: "Build coding confidence with Python + Git + small automations.",
    why: "Proves you can write scripts and use Git daily — first GitHub repo recruiters see.",
    skills: ["Python", "Git", "File I/O", "APIs", "OOP"],
    tools: ["Python", "VS Code", "Git", "GitHub"],
    features: ["CSV cleaner", "Log reader", "API fetcher", "OOP contact manager"],
    aiTools: ["ChatGPT", "Claude"],
    automation: "GitHub Actions to lint on push.",
    resumeBullet:
      "Built a Python automation toolkit (CSV cleaner, log reader, API fetcher) with modular OOP design and Git workflow.",
  },
  {
    id: "react-dash",
    name: "React Portfolio / API Dashboard",
    days: "Day 15–28",
    goal: "Ship a responsive React UI consuming live APIs.",
    why: "Portfolio + your first deployable frontend.",
    skills: ["HTML", "CSS", "JS", "React", "Tailwind", "Forms"],
    tools: ["React", "Tailwind", "Vite", "GitHub"],
    features: ["Multi-page portfolio", "API dashboard cards", "Loading/error states"],
    aiTools: ["Cursor", "Copilot"],
    automation: "Deploy preview via Vercel/Netlify webhook.",
    resumeBullet:
      "Built and deployed a responsive React/Tailwind portfolio + API dashboard with reusable components and error states.",
  },
  {
    id: "task-api",
    name: "Secure Task Manager API",
    days: "Day 29–35",
    goal: "REST API with auth, DB, and JWT-protected routes.",
    why: "Demonstrates backend + DB + auth knowledge.",
    skills: ["Node/FastAPI", "REST", "SQL", "bcrypt", "JWT"],
    tools: ["Express/FastAPI", "PostgreSQL", "Postman"],
    features: ["Register/login", "CRUD tasks", "JWT-protected routes"],
    aiTools: ["Claude", "Cursor"],
    automation: "Postman collection in repo.",
    resumeBullet:
      "Designed a REST task API with bcrypt + JWT auth, PostgreSQL persistence, and Postman-tested CRUD routes.",
  },
  {
    id: "fs-tracker",
    name: "Full-Stack Job Tracker",
    days: "Day 30–35 (parallel)",
    goal: "Connect React frontend with secured backend.",
    why: "End-to-end app on resume.",
    skills: ["React", "REST", "Auth", "DB"],
    tools: ["React", "Express/FastAPI", "PostgreSQL"],
    features: ["Add/edit/delete job applications", "Status filter", "Auth"],
    aiTools: ["Cursor", "Claude"],
    automation: "GitHub Action to run tests on PR.",
    resumeBullet:
      "Built a full-stack job tracker with JWT auth and PostgreSQL backend; documented setup + screenshots in README.",
  },
  {
    id: "aws-deploy",
    name: "AWS Full-Stack Deployment",
    days: "Day 36–49",
    goal: "Deploy a real app on AWS with EC2/S3/CloudWatch.",
    why: "Cloud experience is the #1 multiplier on resumes.",
    skills: ["Linux", "Networking", "IAM", "EC2", "S3", "CloudWatch"],
    tools: ["AWS CLI", "EC2", "S3", "IAM", "CloudWatch"],
    features: ["Static frontend on S3", "API on EC2", "Logging + billing alarm"],
    aiTools: ["Claude", "ChatGPT"],
    automation: "Daily EC2 stop reminder + billing alert.",
    resumeBullet:
      "Deployed a full-stack app on AWS (EC2, S3, CloudWatch, IAM) with billing alerts and least-privilege IAM roles.",
  },
  {
    id: "docker-app",
    name: "Dockerized Full-Stack App",
    days: "Day 50–56",
    goal: "Containerize app with Docker Compose + GitHub Actions CI.",
    why: "DevOps basics show production readiness.",
    skills: ["Docker", "Compose", "Env mgmt", "CI"],
    tools: ["Docker", "GitHub Actions"],
    features: ["Multi-service compose", ".env separation", "CI build + test"],
    aiTools: ["Claude", "Cursor"],
    automation: "GitHub Actions on push.",
    resumeBullet:
      "Containerized full-stack app with Docker Compose and CI pipeline (GitHub Actions) for build/test on each push.",
  },
  {
    id: "sec-report",
    name: "Secure API Hardening Report",
    days: "Day 57–63",
    goal: "Audit + fix OWASP Top 10 issues in your API.",
    why: "Shows security thinking — rare and recruiter-friendly.",
    skills: ["OWASP", "Validation", "Headers", "Rate limit"],
    tools: ["OWASP ZAP", "Burp Community"],
    features: ["Vuln matrix", "Before/after diff", "Mitigation notes"],
    aiTools: ["Claude"],
    automation: "Pre-commit lint for secrets (e.g. gitleaks).",
    resumeBullet:
      "Performed OWASP Top 10 hardening pass on REST API (SQLi, XSS, CSRF, rate limits, headers) and shipped a before/after security report.",
  },
  {
    id: "anomaly",
    name: "AI Log Anomaly Detector",
    days: "Day 64–70",
    goal: "ML model that flags suspicious log lines.",
    why: "Bridges ML + security on resume.",
    skills: ["NumPy", "Pandas", "Sklearn", "Eval metrics"],
    tools: ["Colab", "Kaggle", "Python"],
    features: ["Feature extraction", "Train/test split", "Anomaly scoring"],
    aiTools: ["Claude", "ChatGPT"],
    automation: "Run notebook from script + save report.",
    resumeBullet:
      "Built a log anomaly detector using Pandas + scikit-learn, with feature extraction and evaluation against real log samples.",
  },
  {
    id: "ai-api",
    name: "AI Incident Summary API",
    days: "Day 71–77",
    goal: "Backend endpoint that summarizes incidents with an LLM.",
    why: "Shows you can integrate AI APIs safely.",
    skills: ["LLM APIs", ".env safety", "Backend", "DB"],
    tools: ["OpenAI/Claude API", "Express/FastAPI"],
    features: ["Server-side LLM call", "DB persistence", "React result card"],
    aiTools: ["Claude", "Cursor"],
    automation: "Webhook to Discord on new summary.",
    resumeBullet:
      "Built an AI incident summary API using OpenAI/Claude with server-side key handling, DB persistence, and a React result UI.",
  },
  {
    id: "capstone",
    name: "AI-Powered Cloud Security Monitoring Dashboard",
    days: "Day 78–84",
    goal: "Capstone combining full-stack + cloud + security + AI + automation.",
    why: "Single resume project that proves the whole stack.",
    skills: ["Full-stack", "Auth", "AWS", "Docker", "AI APIs", "Automation"],
    tools: [
      "React",
      "Express/FastAPI",
      "PostgreSQL",
      "AWS",
      "Docker",
      "OpenAI/Claude",
      "n8n/Make/Zapier",
    ],
    features: [
      "Login/auth",
      "Log upload",
      "Failed login + suspicious IP detection",
      "AI incident summary",
      "Alert automation",
      "Cloud deployment notes",
    ],
    aiTools: ["Claude Code", "Claude", "Cursor"],
    automation: "Trigger → parse → detect → AI summary → alert → store → dashboard.",
    resumeBullet:
      "Built an AI-powered cloud security monitoring dashboard using React, Node.js/FastAPI, AWS CloudWatch, Docker, PostgreSQL/Firebase, and AI APIs to detect suspicious log patterns, summarize incidents, and automate alerting workflows.",
  },
];
