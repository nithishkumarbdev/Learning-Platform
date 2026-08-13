export type Track =
  | "Software"
  | "Full-Stack"
  | "Cloud"
  | "DevOps"
  | "Security"
  | "AI/ML"
  | "AI APIs"
  | "Automation"
  | "Capstone";

export type Day = {
  day: number;
  week: number;
  topic: string;
  track: Track;
  goal: string;
  why: string;
  time: string;
  prev: string;
  next: string;
  learn: { summary: string; subtopics: string[]; resource: string; backup: string; skip: string };
  watch: { channel: string; focus: string; mins: number };
  practice: { tool: string; steps: string[]; output: string; mistake: string };
  build: { project: string; feature: string; steps: string[]; files: string };
  dsa: { topic: string; problemType: string; resource: string; hintPrompt: string };
  ai: { tool: string; why: string; how: string; prompt: string; safety: string; verify: string };
  test: { platform: string; questions: string[] };
  github: { files: string; commitMsg: string; readme: string };
};

const DEF_AI = {
  tool: "ChatGPT",
  why: "Best for beginner-friendly explanations and quick quizzes.",
  how: "Paste your goal, ask for tiny example + one task + one mistake.",
  prompt:
    "Explain [TOPIC] like I am a beginner. One tiny example, one real project use case, one mistake to avoid, then one 10-minute task and quiz me with 3 questions.",
  safety: "Do not paste API keys or private credentials.",
  verify: "Run the code yourself; rephrase the concept in your own words.",
};

function d(
  day: number,
  week: number,
  track: Track,
  topic: string,
  goal: string,
  patch: Partial<Day> = {},
): Day {
  const base: Day = {
    day,
    week,
    topic,
    track,
    goal,
    why: "Foundational skill recruiters expect — supports later cloud, security, and AI work.",
    time: "3–4h (normal) · 1–2h (slow) · 8h (fast)",
    prev: day > 1 ? `Day ${day - 1} concepts feed directly into today.` : "Fresh start.",
    next:
      day < 84 ? `Day ${day + 1} builds on this directly.` : "Wrap up portfolio + interview prep.",
    learn: {
      summary: `Learn the core ideas of ${topic} with focused beginner depth.`,
      subtopics: ["Core concept", "Tiny example", "Real project use"],
      resource: "Official docs / freeCodeCamp",
      backup: "YouTube beginner walkthrough",
      skip: "Advanced edge cases until week 6+",
    },
    watch: { channel: "freeCodeCamp / Fireship", focus: `${topic} in 15 minutes`, mins: 20 },
    practice: {
      tool: "VS Code + terminal",
      steps: ["Recreate one example", "Tweak inputs", "Break it on purpose, then fix"],
      output: "Working snippet committed to GitHub",
      mistake: "Copy-pasting without typing it out yourself",
    },
    build: {
      project: "Today's track project",
      feature: `Add a small feature using ${topic}`,
      steps: ["Plan the file/folder", "Implement minimal version", "Manual test", "Commit"],
      files: "1 new/edited file with descriptive name",
    },
    dsa: {
      topic: "Arrays / Strings",
      problemType: "1 easy problem",
      resource: "NeetCode / LeetCode easy",
      hintPrompt:
        "Do not give me the final answer. Give hints step by step. Start with brute force, then guide me to optimize.",
    },
    ai: DEF_AI,
    test: {
      platform: "Self quiz + ChatGPT",
      questions: [
        `Explain ${topic} in 3 sentences.`,
        `Where in a real project would you use ${topic}?`,
        `What is one mistake beginners make with ${topic}?`,
      ],
    },
    github: {
      files: "Today's code + notes",
      commitMsg: `feat(day-${day}): ${topic.toLowerCase()}`,
      readme: `Add a "Day ${day}: ${topic}" bullet with 1-line summary.`,
    },
  };
  return { ...base, ...patch, learn: { ...base.learn, ...(patch.learn ?? {}) } };
}

// Custom AI tool per phase
const aiClaude = {
  ...DEF_AI,
  tool: "Claude",
  why: "Deeper reasoning for architecture, code review, security and long context.",
  prompt:
    "Review this [code/concept] deeply. Explain architecture, weak points, improvements, and what I should learn next.",
};
const aiCursor = {
  ...DEF_AI,
  tool: "Cursor",
  why: "Inline editing inside your codebase for components, routes, and refactors.",
  prompt:
    "Explain this selected code. Then suggest ONE small improvement without changing the whole structure.",
};
const aiCC = {
  ...DEF_AI,
  tool: "Claude Code",
  why: "Multi-file project review, refactors, tests and README.",
  prompt:
    "Analyze this codebase. First explain the architecture, then list issues, then suggest a safe step-by-step improvement plan. Do not change files until I approve.",
};

// Build all 84 days with track-aware topics & projects.
const W1_2: [number, Track, string][] = [
  [1, "Software", "Setup + What is Programming"],
  [2, "Software", "Variables + Data Types"],
  [3, "Software", "Conditions + Loops"],
  [4, "Software", "Functions"],
  [5, "Software", "Lists + Dictionaries"],
  [6, "Software", "Files + JSON/CSV"],
  [7, "Software", "Review + Mini Project Finish"],
  [8, "Software", "OOP Basics"],
  [9, "Software", "Error Handling + Debugging"],
  [10, "Software", "Modules + Project Structure"],
  [11, "Software", "API Calls with Python"],
  [12, "Software", "CSV/Log Automation"],
  [13, "Software", "Git/GitHub Workflow + README"],
  [14, "Software", "Finish Python Automation Toolkit"],
];

const W3_5: [number, Track, string][] = [
  [15, "Full-Stack", "HTML Structure"],
  [16, "Full-Stack", "CSS + Responsive Design"],
  [17, "Full-Stack", "JavaScript Basics"],
  [18, "Full-Stack", "DOM + Events"],
  [19, "Full-Stack", "Fetch API + JSON"],
  [20, "Full-Stack", "React Setup + Components"],
  [21, "Full-Stack", "React Props/State + Mini UI"],
  [22, "Full-Stack", "React Router"],
  [23, "Full-Stack", "Tailwind CSS"],
  [24, "Full-Stack", "Forms + Validation"],
  [25, "Full-Stack", "API Cards + Loading/Error States"],
  [26, "Full-Stack", "Dashboard Layout"],
  [27, "Full-Stack", "Portfolio + Project Cards"],
  [28, "Full-Stack", "Finish React Portfolio / API Dashboard"],
  [29, "Full-Stack", "Backend Setup (Node/Express or FastAPI)"],
  [30, "Full-Stack", "REST APIs + CRUD"],
  [31, "Full-Stack", "SQL / PostgreSQL Basics"],
  [32, "Full-Stack", "Database Connection"],
  [33, "Full-Stack", "Register/Login + bcrypt"],
  [34, "Full-Stack", "JWT + Protected Routes"],
  [35, "Full-Stack", "Finish Secure Task Manager API"],
];

const W6_7: [number, Track, string][] = [
  [36, "Cloud", "Linux Terminal Basics"],
  [37, "Cloud", "Files, Permissions, Users"],
  [38, "Cloud", "Processes, Services, Logs"],
  [39, "Cloud", "Networking: IP, DNS, Ports"],
  [40, "Cloud", "HTTP/HTTPS + curl"],
  [41, "Cloud", "SSH + Server Basics"],
  [42, "Cloud", "Linux/Network Review + Mini Diagnostic Tool"],
  [43, "Cloud", "Cloud Basics + AWS Account Safety"],
  [44, "Cloud", "IAM Users, Roles, Policies"],
  [45, "Cloud", "EC2 + SSH + Security Groups"],
  [46, "Cloud", "S3 Static Hosting"],
  [47, "Cloud", "CloudWatch Logs + Alarms"],
  [48, "Cloud", "RDS / Lambda Basics"],
  [49, "Cloud", "Finish AWS Full-Stack Deployment"],
];

const W8: [number, Track, string][] = [
  [50, "DevOps", "Docker Basics: Image/Container"],
  [51, "DevOps", "Dockerfile"],
  [52, "DevOps", "Docker Compose"],
  [53, "DevOps", "Environment Variables + Secrets"],
  [54, "DevOps", "GitHub Actions Basics"],
  [55, "DevOps", "Basic Testing / Checklist"],
  [56, "DevOps", "Finish Dockerized Full-Stack App"],
];

const W9: [number, Track, string][] = [
  [57, "Security", "Security Basics: CIA + Auth vs Authz"],
  [58, "Security", "OWASP Top 10 Overview"],
  [59, "Security", "SQL Injection Prevention"],
  [60, "Security", "XSS + Input Validation"],
  [61, "Security", "CSRF + Security Headers"],
  [62, "Security", "Rate Limiting + Error Leakage"],
  [63, "Security", "Finish Secure API Hardening Report"],
];

const W10_11: [number, Track, string][] = [
  [64, "AI/ML", "What is AI/ML? Datasets, Features, Labels"],
  [65, "AI/ML", "NumPy + Pandas"],
  [66, "AI/ML", "Data Cleaning + Feature Extraction"],
  [67, "AI/ML", "Train/Test Split + Model Evaluation"],
  [68, "AI/ML", "Classification Basics"],
  [69, "AI/ML", "Anomaly Detection"],
  [70, "AI/ML", "Finish AI Log Anomaly Detector"],
  [71, "AI APIs", "LLM Basics + Prompt Engineering"],
  [72, "AI APIs", "OpenAI / Claude / Hugging Face API Basics"],
  [73, "AI APIs", "Backend AI Route + .env Safety"],
  [74, "AI APIs", "React AI Result Card"],
  [75, "AI APIs", "Save AI Output to Database"],
  [76, "AI APIs", "AI Incident Summary Endpoint"],
  [77, "AI APIs", "Finish AI Incident Summary API"],
];

const W12: [number, Track, string][] = [
  [78, "Capstone", "Capstone Architecture + Repo Setup"],
  [79, "Capstone", "Log Upload + Backend Parser"],
  [80, "Capstone", "Failed Login Detection"],
  [81, "Capstone", "Suspicious IP Detection"],
  [82, "Capstone", "AI Incident Summary Integration"],
  [83, "Automation", "Automation Alert with n8n/Make/Zapier Concept"],
  [84, "Capstone", "Final Polish: README, Resume, Screenshots, Interview"],
];

const ALL = [...W1_2, ...W3_5, ...W6_7, ...W8, ...W9, ...W10_11, ...W12];

const projectByDay = (day: number): string => {
  if (day <= 14) return "Python Automation Toolkit";
  if (day <= 28) return "React Portfolio / API Dashboard";
  if (day <= 35) return "Secure Task Manager API";
  if (day <= 49) return "AWS Full-Stack Deployment";
  if (day <= 56) return "Dockerized Full-Stack App";
  if (day <= 63) return "Secure API Hardening Report";
  if (day <= 70) return "AI Log Anomaly Detector";
  if (day <= 77) return "AI Incident Summary API";
  return "AI-Powered Cloud Security Monitoring Dashboard";
};

const aiByTrack = (t: Track) => {
  if (t === "Software") return DEF_AI;
  if (t === "Full-Stack") return aiCursor;
  if (t === "Cloud" || t === "Security" || t === "DevOps") return aiClaude;
  if (t === "AI/ML" || t === "AI APIs") return aiClaude;
  if (t === "Capstone") return aiCC;
  return DEF_AI;
};

export const DAYS: Day[] = ALL.map(([day, track, topic]) => {
  const week = Math.ceil(day / 7);
  const goal = `Make real progress on "${topic}" and ship one commit.`;
  return d(day, week, track, topic, goal, {
    ai: aiByTrack(track),
    build: {
      project: projectByDay(day),
      feature: `Add a feature in "${projectByDay(day)}" that uses ${topic}.`,
      steps: [
        "Sketch the change in a comment",
        "Implement minimal version",
        "Manual test (and add a tiny test if relevant)",
        "Commit with a clear message",
      ],
      files: "1–3 files edited/added",
    },
  });
});

export const WEEK_THEMES: Record<number, { title: string; project: string }> = {
  1: { title: "Python + Git + AI Tutor Setup", project: "Python Automation Toolkit" },
  2: { title: "OOP + APIs + Beginner DSA + Automation", project: "Python Automation Toolkit" },
  3: { title: "Frontend Basics", project: "React Portfolio / API Dashboard" },
  4: { title: "React Dashboard + API Consumption", project: "React Portfolio / API Dashboard" },
  5: { title: "Backend + Database", project: "Secure Task Manager API" },
  6: { title: "Linux + Networking for Cloud", project: "AWS Full-Stack Deployment" },
  7: { title: "AWS Basics", project: "AWS Full-Stack Deployment" },
  8: { title: "Docker + DevOps Basics", project: "Dockerized Full-Stack App" },
  9: { title: "Cybersecurity Basics", project: "Secure API Hardening Report" },
  10: { title: "AI/ML Basics", project: "AI Log Anomaly Detector" },
  11: { title: "AI APIs + AI App Integration", project: "AI Incident Summary API" },
  12: {
    title: "Final Capstone + AI Automation",
    project: "AI-Powered Cloud Security Monitoring Dashboard",
  },
};

export const TRACK_COLOR: Record<Track, string> = {
  Software: "bg-track-software/15 text-track-software border-track-software/30",
  "Full-Stack": "bg-track-fullstack/15 text-track-fullstack border-track-fullstack/30",
  Cloud: "bg-track-cloud/15 text-track-cloud border-track-cloud/30",
  DevOps: "bg-track-cloud/15 text-track-cloud border-track-cloud/30",
  Security: "bg-track-security/15 text-track-security border-track-security/30",
  "AI/ML": "bg-track-ai/15 text-track-ai border-track-ai/30",
  "AI APIs": "bg-track-ai/15 text-track-ai border-track-ai/30",
  Automation: "bg-track-automation/15 text-track-automation border-track-automation/30",
  Capstone: "bg-primary/15 text-primary border-primary/30",
};
