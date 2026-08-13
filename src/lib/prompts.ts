export type Prompt = {
  id: string;
  title: string;
  category:
    | "Learn"
    | "Debug"
    | "Review"
    | "DSA"
    | "API"
    | "Cloud"
    | "Security"
    | "Automation"
    | "README"
    | "Interview";
  bestTool: string;
  body: string;
  notFor: string;
};

export const PROMPTS: Prompt[] = [
  {
    id: "learn",
    title: "Learn a new concept",
    category: "Learn",
    bestTool: "ChatGPT / Claude",
    body: `Teach me [TOPIC] like I am a beginner. Explain what it is, why it matters, how it connects to software/cloud/security/AI, show a tiny example, give me one practice task, and quiz me with 3 questions.`,
    notFor: "Do not ask AI to do the practice task for you.",
  },
  {
    id: "debug",
    title: "Debug an error",
    category: "Debug",
    bestTool: "ChatGPT / Cursor",
    body: `I got this error: [PASTE ERROR + minimal code].\nExplain it simply. Identify the root cause. Suggest the smallest safe fix. Do NOT rewrite my whole file.`,
    notFor: "Do not paste API keys, .env files, or full secrets.",
  },
  {
    id: "review",
    title: "Code review",
    category: "Review",
    bestTool: "Claude / Claude Code",
    body: `Review this code for readability, bugs, security, and maintainability:\n[PASTE CODE]\nFor each suggestion, explain WHY and rate severity (low/med/high).`,
    notFor: "Don't accept refactors you can't explain in your own words.",
  },
  {
    id: "dsa",
    title: "DSA hint (no solution)",
    category: "DSA",
    bestTool: "ChatGPT",
    body: `Problem: [PASTE PROBLEM].\nDo NOT give me the final answer. Give hints step by step. Start with brute force, then guide me to optimize. Ask before showing code.`,
    notFor: "Don't ask AI to solve DSA directly when practicing.",
  },
  {
    id: "api",
    title: "API integration",
    category: "API",
    bestTool: "Cursor / Claude",
    body: `Help me integrate [API NAME] safely into my [STACK] app. Backend route, .env handling, error handling, frontend loading + error state, and a DB save step. Explain each part.`,
    notFor: "Never call paid APIs directly from the browser with secret keys.",
  },
  {
    id: "cloud",
    title: "Cloud concept",
    category: "Cloud",
    bestTool: "Claude",
    body: `Explain this AWS service: [SERVICE]. Tell me why I need it, how it fits my project [PROJECT NAME], the security risks, and one beginner task I can do today.`,
    notFor: "Do not run cost-heavy resources before billing alerts are on.",
  },
  {
    id: "security",
    title: "Security review",
    category: "Security",
    bestTool: "Claude",
    body: `Review this backend route for auth, authorization, input validation, SQL injection, XSS, rate limiting, error leakage, and secret exposure:\n[PASTE ROUTE]`,
    notFor: "Don't trust generated security code without testing.",
  },
  {
    id: "automation",
    title: "Automation workflow",
    category: "Automation",
    bestTool: "ChatGPT / Claude",
    body: `Design an automation workflow for: [GOAL]. Include trigger, input, AI processing step, decision, action, notification, error handling, and a test plan.`,
    notFor: "Don't wire webhooks without verifying signatures.",
  },
  {
    id: "readme",
    title: "Project README",
    category: "README",
    bestTool: "Claude",
    body: `Create a professional GitHub README for [PROJECT]. Sections: Features, Tech Stack, Setup, Screenshots (placeholder), Architecture, Lessons Learned, Future Improvements. Keep it concise and recruiter-friendly.`,
    notFor: "Don't fake features you didn't build.",
  },
  {
    id: "interview",
    title: "Interview practice",
    category: "Interview",
    bestTool: "ChatGPT",
    body: `Act as a recruiter. Ask me interview questions about [PROJECT]. Rate my answers like a hiring manager and tell me how to improve each.`,
    notFor: "Don't memorize answers — practice explaining in your own words.",
  },
];
