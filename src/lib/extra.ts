import { useLocalStorage } from "./storage";

// ===== Study Timer =====
export type TimerSession = {
  id: string;
  kind: "Pomodoro" | "Deep Work" | "Build" | "Custom" | "DSA" | "AI Review" | "Review";
  startedAt: number;
  durationSec: number;
  completed: boolean;
};
export function useTimerSessions() {
  return useLocalStorage<TimerSession[]>("los_timer_sessions_v1", []);
}

// ===== Focus Mode =====
export type FocusState = {
  enabled: boolean;
  mode: "deep" | "sprint" | "review" | "build" | "dsa" | "ai";
};
export const FOCUS_MODES = {
  deep: { label: "Deep Work", mins: 90 },
  sprint: { label: "Quick Sprint", mins: 45 },
  review: { label: "Review", mins: 25 },
  build: { label: "Build Session", mins: 120 },
  dsa: { label: "DSA Sprint", mins: 45 },
  ai: { label: "AI Review", mins: 30 },
} as const;
export function useFocus() {
  return useLocalStorage<FocusState>("los_focus_v1", { enabled: false, mode: "deep" });
}

// ===== Bug Journal =====
export type Bug = {
  id: string;
  createdAt: number;
  error: string;
  where: string;
  project: string;
  tried: string;
  cause: string;
  fix: string;
  aiPrompt: string;
  learned: string;
  revisitDate: string;
  category: string;
  fixed: boolean;
};
export const BUG_CATEGORIES = [
  "Python",
  "JavaScript",
  "React",
  "API",
  "Database",
  "Git",
  "Linux",
  "AWS",
  "Docker",
  "Security",
  "AI API",
  "Deployment",
];
export function useBugs() {
  return useLocalStorage<Bug[]>("los_bugs_v1", []);
}

// ===== Mistake Tracker =====
export type Mistake = {
  id: string;
  createdAt: number;
  category: string;
  mistake: string;
  why: string;
  correct: string;
  prevention: string;
  related: string;
  revisitDate: string;
  fixed: boolean;
};
export const MISTAKE_CATEGORIES = [
  "Syntax",
  "Logic",
  "Git",
  "API",
  "Database",
  "React",
  "Cloud",
  "Docker",
  "Security",
  "AI API",
  "Deployment",
  "DSA",
];
export function useMistakes() {
  return useLocalStorage<Mistake[]>("los_mistakes_v1", []);
}

// ===== Revision Queue (spaced repetition) =====
export type RevisionItem = {
  id: string;
  topic: string;
  fromDay: number;
  note: string;
  createdAt: number;
  nextDue: number; // timestamp
  stage: 0 | 1 | 2 | 3 | 4; // schedule: +1d, +3d, +7d, +14d, done
  done: boolean;
};
export const STAGE_DAYS = [1, 3, 7, 14];
export function useRevisions() {
  return useLocalStorage<RevisionItem[]>("los_revisions_v1", []);
}
export function nextDueFromStage(stage: number): number {
  const days = STAGE_DAYS[stage] ?? 14;
  return Date.now() + days * 24 * 60 * 60 * 1000;
}

// ===== Job Tracker =====
export type JobApp = {
  id: string;
  company: string;
  role: string;
  link: string;
  status: "Saved" | "Applied" | "Phone Screen" | "Interview" | "Offer" | "Rejected";
  resumeVersion: string;
  projectsUsed: string;
  notes: string;
  followUpDate: string;
  interviewDate: string;
  result: string;
  createdAt: number;
};
export function useJobApps() {
  return useLocalStorage<JobApp[]>("los_jobs_v1", []);
}

// ===== Branding checklist =====
export function useBranding() {
  return useLocalStorage<Record<string, boolean>>("los_branding_v1", {});
}

// ===== Final Job-Ready Checklist =====
export function useFinalChecklist() {
  return useLocalStorage<Record<string, boolean>>("los_final_v1", {});
}

// ===== Safety panels =====
export function useSafety() {
  return useLocalStorage<Record<string, boolean>>("los_safety_v1", {});
}

// ===== Explain-Back ratings =====
export type ExplainBack = {
  dayId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  answers: string[];
  updatedAt: number;
};
export function useExplainBack() {
  return useLocalStorage<Record<string, ExplainBack>>("los_explain_v1", {});
}

// ===== Skill Gap roles =====
export const ROLES: Record<string, { label: string; skills: { name: string; days: number[] }[] }> =
  {
    swe: {
      label: "Software Engineer",
      skills: [
        { name: "Python fluency", days: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
        { name: "Git/GitHub workflow", days: [1, 13, 14] },
        { name: "OOP + Modules", days: [8, 9, 10] },
        { name: "DSA basics", days: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] },
        { name: "Debugging + Testing", days: [9, 55] },
        { name: "Clean READMEs", days: [13, 14, 28, 49, 56, 77, 84] },
      ],
    },
    fullstack: {
      label: "Full-Stack Developer",
      skills: [
        { name: "HTML/CSS/JS", days: [15, 16, 17, 18] },
        { name: "React + Router + Tailwind", days: [20, 21, 22, 23, 24, 25, 26] },
        { name: "REST APIs + Express/FastAPI", days: [29, 30] },
        { name: "PostgreSQL + Schema", days: [31, 32] },
        { name: "Auth + JWT", days: [33, 34, 35] },
        { name: "Dockerized deploy", days: [50, 51, 52, 56] },
      ],
    },
    backend: {
      label: "Backend Developer",
      skills: [
        { name: "REST + CRUD", days: [29, 30] },
        { name: "SQL + DB design", days: [31, 32] },
        { name: "Auth + bcrypt + JWT", days: [33, 34, 35] },
        { name: "Validation + Rate limiting", days: [60, 62] },
        { name: "Logging + Error handling", days: [38, 62] },
        { name: "Dockerfile + .env", days: [51, 52, 53] },
      ],
    },
    cloud: {
      label: "Cloud Engineer",
      skills: [
        { name: "Linux + SSH + Networking", days: [36, 37, 38, 39, 40, 41, 42] },
        { name: "IAM least privilege", days: [44] },
        { name: "EC2 + Security Groups", days: [45] },
        { name: "S3 hosting", days: [46] },
        { name: "CloudWatch + Alarms", days: [47] },
        { name: "Docker + CI basics", days: [50, 51, 52, 54, 56] },
      ],
    },
    ai_intern: {
      label: "AI Engineer Intern",
      skills: [
        { name: "NumPy + Pandas", days: [65, 66] },
        { name: "Model evaluation", days: [67, 68] },
        { name: "Classification + Anomaly", days: [68, 69, 70] },
        { name: "LLM + Prompt engineering", days: [71] },
        { name: "AI API integration", days: [72, 73, 74, 75, 76, 77] },
        { name: "AI safety + .env", days: [73] },
      ],
    },
    ai_automation: {
      label: "AI Automation Engineer",
      skills: [
        { name: "Python automation", days: [11, 12, 14] },
        { name: "AI API calls", days: [72, 73] },
        { name: "Webhook + Trigger thinking", days: [83] },
        { name: "n8n/Make/Zapier workflow", days: [83] },
        { name: "Saving outputs to DB", days: [75] },
        { name: "Capstone integration", days: [82, 83, 84] },
      ],
    },
    sec_swe: {
      label: "Security Software Engineer",
      skills: [
        { name: "OWASP Top 10", days: [58] },
        { name: "Input validation + XSS", days: [60] },
        { name: "SQL Injection prevention", days: [59] },
        { name: "CSRF + Headers", days: [61] },
        { name: "Rate limiting", days: [62] },
        { name: "Auth + JWT + secrets", days: [33, 34, 53] },
      ],
    },
  };
