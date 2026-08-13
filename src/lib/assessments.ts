import { useLocalStorage } from "./storage";

export type MCQ = {
  id: string;
  q: string;
  options: string[];
  answer: number; // index
  explain: string;
};

export type Assessment = {
  week: number;
  title: string;
  topic: string;
  questions: MCQ[];
  practical: string[]; // checklist tasks
  projectTask: string;
  explainBack: string;
  githubTask: string;
};

export const ASSESSMENTS: Assessment[] = [
  {
    week: 1,
    title: "Python + Git Fundamentals",
    topic: "Variables, loops, functions, files, Git basics",
    questions: [
      {
        id: "w1q1",
        q: "Which is a mutable Python type?",
        options: ["tuple", "str", "list", "int"],
        answer: 2,
        explain: "Lists can be modified after creation; tuples and strings are immutable.",
      },
      {
        id: "w1q2",
        q: "What does `git add .` do?",
        options: [
          "Commits changes",
          "Stages all changes in the directory",
          "Pushes to remote",
          "Creates a new repo",
        ],
        answer: 1,
        explain: "It stages files for the next commit but does not commit or push.",
      },
      {
        id: "w1q3",
        q: "Best way to read a CSV in Python?",
        options: ["open() and parse manually", "csv module or pandas", "json.load", "requests.get"],
        answer: 1,
        explain: "Use the csv module for small files or pandas for analysis.",
      },
      {
        id: "w1q4",
        q: 'What does `if __name__ == "__main__":` do?',
        options: [
          "Defines a class",
          "Runs code only when file is executed directly",
          "Imports a module",
          "Defines main function",
        ],
        answer: 1,
        explain: "It prevents the block from running when the file is imported as a module.",
      },
      {
        id: "w1q5",
        q: "Which command creates a new branch?",
        options: ["git branch new", "git checkout new", "git switch -c new", "Both A and C"],
        answer: 3,
        explain:
          "`git branch new` creates it; `git switch -c new` creates and switches in one step.",
      },
    ],
    practical: [
      "Write a function that reads a CSV and returns row count",
      "Push a commit with a clear message",
    ],
    projectTask: "Add one new feature to Python Automation Toolkit",
    explainBack: "Explain how Git tracks changes from working dir → staging → commit → push.",
    githubTask: "Push commit with message: 'feat: weekly review checkpoint'",
  },
  {
    week: 2,
    title: "OOP + APIs + Modules",
    topic: "Classes, error handling, modules, HTTP APIs",
    questions: [
      {
        id: "w2q1",
        q: "What is `self` in a Python class?",
        options: [
          "A keyword",
          "A reference to the instance",
          "A static method",
          "A built-in function",
        ],
        answer: 1,
        explain: "`self` refers to the current instance of the class.",
      },
      {
        id: "w2q2",
        q: "Which HTTP method should fetch data without side effects?",
        options: ["POST", "PUT", "GET", "DELETE"],
        answer: 2,
        explain: "GET is for retrieving resources, idempotent and safe.",
      },
      {
        id: "w2q3",
        q: "What does `try/except` do?",
        options: ["Loops", "Catches exceptions", "Defines a function", "Imports modules"],
        answer: 1,
        explain: "It handles runtime errors gracefully.",
      },
      {
        id: "w2q4",
        q: "Which status code means 'created'?",
        options: ["200", "201", "204", "301"],
        answer: 1,
        explain: "201 Created is returned after a successful POST.",
      },
      {
        id: "w2q5",
        q: "Best practice for API keys?",
        options: [
          "Hardcode in source",
          "Put in .env, ignore via .gitignore",
          "Commit to repo",
          "Send in URL",
        ],
        answer: 1,
        explain: "Keys must never be committed; use environment variables.",
      },
    ],
    practical: ["Refactor toolkit into modules", "Add try/except to one risky function"],
    projectTask: "Add API fetcher class with error handling",
    explainBack: "Explain the difference between a function and a method.",
    githubTask: "Commit: 'refactor: split into modules'",
  },
  {
    week: 3,
    title: "Frontend Basics",
    topic: "HTML, CSS, JS, DOM, Fetch",
    questions: [
      {
        id: "w3q1",
        q: "Which tag wraps page navigation?",
        options: ["<div>", "<nav>", "<section>", "<header>"],
        answer: 1,
        explain: "<nav> is the semantic element for navigation.",
      },
      {
        id: "w3q2",
        q: "Which CSS unit scales with viewport width?",
        options: ["px", "em", "vw", "pt"],
        answer: 2,
        explain: "1vw = 1% of viewport width.",
      },
      {
        id: "w3q3",
        q: "What does `===` check in JS?",
        options: ["Value only", "Value and type", "Reference only", "Truthiness"],
        answer: 1,
        explain: "Strict equality checks both value and type.",
      },
      {
        id: "w3q4",
        q: "Best place to do `fetch()` in React?",
        options: ["render body", "useEffect", "constructor", "JSX directly"],
        answer: 1,
        explain: "`useEffect` is for side effects like data fetching.",
      },
      {
        id: "w3q5",
        q: "How do you handle loading state?",
        options: ["Block render", "Show fallback UI based on state", "Reload page", "Throw error"],
        answer: 1,
        explain: "Always render a loading indicator from a useState flag.",
      },
    ],
    practical: ["Build a responsive layout with flex/grid", "Fetch and render an API list"],
    projectTask: "Ship portfolio HTML skeleton",
    explainBack: "Explain the request/response cycle for a fetch call.",
    githubTask: "Commit: 'feat: responsive portfolio skeleton'",
  },
  {
    week: 4,
    title: "React + Tailwind",
    topic: "Components, props, state, routing, forms",
    questions: [
      {
        id: "w4q1",
        q: "How do you pass data parent→child?",
        options: ["context only", "props", "state", "global var"],
        answer: 1,
        explain: "Props are React's primary data flow mechanism.",
      },
      {
        id: "w4q2",
        q: "Which hook stores local state?",
        options: ["useEffect", "useState", "useRef", "useMemo"],
        answer: 1,
        explain: "useState manages component-local state.",
      },
      {
        id: "w4q3",
        q: "Tailwind class for medium screens?",
        options: ["sm:", "md:", "lg:", "xl:"],
        answer: 1,
        explain: "md: applies styles at 768px and up.",
      },
      {
        id: "w4q4",
        q: "When should you use a key prop?",
        options: ["On every div", "When rendering lists", "Only forms", "Never"],
        answer: 1,
        explain: "React needs keys to track list items efficiently.",
      },
      {
        id: "w4q5",
        q: "Best way to validate forms?",
        options: ["No validation", "Client + server validation", "Server only", "Client only"],
        answer: 1,
        explain: "Always validate on both sides — client for UX, server for safety.",
      },
    ],
    practical: ["Build a reusable Card component", "Add form with validation"],
    projectTask: "Finish portfolio with project cards",
    explainBack: "Explain how state updates trigger re-renders in React.",
    githubTask: "Commit: 'feat: deploy React portfolio'",
  },
  {
    week: 5,
    title: "Backend + Database + Auth",
    topic: "REST, SQL, bcrypt, JWT",
    questions: [
      {
        id: "w5q1",
        q: "What does REST stand for?",
        options: [
          "Real Easy State Transfer",
          "Representational State Transfer",
          "Remote Execution Service Transport",
          "Routed Endpoint State",
        ],
        answer: 1,
        explain: "REST = Representational State Transfer.",
      },
      {
        id: "w5q2",
        q: "Why hash passwords with bcrypt?",
        options: [
          "Faster login",
          "Slow + salted to resist brute force",
          "Reversible storage",
          "Saves DB space",
        ],
        answer: 1,
        explain: "bcrypt is intentionally slow and salted, making cracking expensive.",
      },
      {
        id: "w5q3",
        q: "Which SQL clause filters rows?",
        options: ["SELECT", "WHERE", "GROUP BY", "ORDER BY"],
        answer: 1,
        explain: "WHERE filters rows before grouping.",
      },
      {
        id: "w5q4",
        q: "What is a JWT?",
        options: [
          "A database",
          "A signed token used for stateless auth",
          "An ORM",
          "A logging format",
        ],
        answer: 1,
        explain: "JWTs encode claims and are signed so the server can verify trust.",
      },
      {
        id: "w5q5",
        q: "Foreign key purpose?",
        options: [
          "Encrypt data",
          "Enforce referential integrity",
          "Speed up queries",
          "Generate IDs",
        ],
        answer: 1,
        explain: "Foreign keys link tables and prevent orphaned rows.",
      },
    ],
    practical: ["Add JWT middleware to one protected route", "Write a SQL JOIN query"],
    projectTask: "Finish Secure Task Manager API",
    explainBack: "Explain how a JWT survives across requests without server-side sessions.",
    githubTask: "Commit: 'feat: JWT-protected CRUD'",
  },
  {
    week: 6,
    title: "Linux + Networking",
    topic: "Files, permissions, ports, DNS, SSH",
    questions: [
      {
        id: "w6q1",
        q: "What does `chmod 755` mean?",
        options: [
          "Read/write/execute for owner; r/x for others",
          "Full access for everyone",
          "No access",
          "Read only",
        ],
        answer: 0,
        explain: "7=rwx for owner, 5=rx for group and others.",
      },
      {
        id: "w6q2",
        q: "Default HTTPS port?",
        options: ["80", "443", "22", "21"],
        answer: 1,
        explain: "443 is HTTPS; 80 is HTTP.",
      },
      {
        id: "w6q3",
        q: "What does DNS do?",
        options: [
          "Encrypts traffic",
          "Resolves hostnames to IPs",
          "Routes packets",
          "Stores files",
        ],
        answer: 1,
        explain: "DNS translates domain names to IP addresses.",
      },
      {
        id: "w6q4",
        q: "SSH default port?",
        options: ["22", "23", "443", "21"],
        answer: 0,
        explain: "SSH listens on port 22 by default.",
      },
      {
        id: "w6q5",
        q: "Command to view running processes?",
        options: ["ls", "ps aux", "cd", "rm"],
        answer: 1,
        explain: "`ps aux` shows all running processes.",
      },
    ],
    practical: ["SSH into a server (or local sandbox)", "Use `curl` to call an API"],
    projectTask: "Write a 1-page networking cheat sheet",
    explainBack: "Explain what happens between typing a URL and seeing the page.",
    githubTask: "Commit: 'docs: linux + networking notes'",
  },
  {
    week: 7,
    title: "AWS Basics",
    topic: "IAM, EC2, S3, CloudWatch",
    questions: [
      {
        id: "w7q1",
        q: "Best practice for IAM?",
        options: [
          "Use root user",
          "Least privilege per user/role",
          "Share keys",
          "One admin for all",
        ],
        answer: 1,
        explain: "Least privilege limits blast radius if creds leak.",
      },
      {
        id: "w7q2",
        q: "S3 is best for?",
        options: [
          "Running servers",
          "Object storage / static hosting",
          "SQL queries",
          "Container orchestration",
        ],
        answer: 1,
        explain: "S3 stores objects and can host static sites.",
      },
      {
        id: "w7q3",
        q: "Security Groups control?",
        options: ["Encryption", "Inbound/outbound traffic", "IAM roles", "Billing"],
        answer: 1,
        explain: "Security groups are stateful firewalls for EC2.",
      },
      {
        id: "w7q4",
        q: "Best way to avoid surprise bills?",
        options: [
          "Don't login",
          "Billing alarms + Free Tier check + stop unused",
          "Pay upfront",
          "Use largest instances",
        ],
        answer: 1,
        explain: "Always set billing alarms and stop unused resources.",
      },
      {
        id: "w7q5",
        q: "CloudWatch is for?",
        options: ["Storage", "Logs + metrics + alarms", "Compute", "DNS"],
        answer: 1,
        explain: "CloudWatch aggregates logs and metrics, and triggers alarms.",
      },
    ],
    practical: ["Create an IAM user with least privilege", "Set a billing alarm"],
    projectTask: "Deploy static site to S3",
    explainBack: "Explain why IAM least privilege matters.",
    githubTask: "Commit: 'docs: aws deployment notes'",
  },
  {
    week: 8,
    title: "Docker + CI",
    topic: "Images, containers, compose, GitHub Actions",
    questions: [
      {
        id: "w8q1",
        q: "Difference between image and container?",
        options: [
          "Same thing",
          "Image is a blueprint; container is a running instance",
          "Container is bigger",
          "Image runs code",
        ],
        answer: 1,
        explain: "Images are immutable templates; containers are running processes.",
      },
      {
        id: "w8q2",
        q: "Which file defines a Docker image?",
        options: ["docker.yml", "Dockerfile", "compose.yml", "image.txt"],
        answer: 1,
        explain: "A `Dockerfile` describes how to build an image.",
      },
      {
        id: "w8q3",
        q: "Where do you store secrets?",
        options: [
          "In the Dockerfile",
          "In .env (not committed) or secret manager",
          "In a public README",
          "In source code",
        ],
        answer: 1,
        explain: "Never bake secrets into images; use env vars or secret managers.",
      },
      {
        id: "w8q4",
        q: "What does docker-compose do?",
        options: [
          "Builds images only",
          "Defines + runs multi-container apps",
          "Pushes to a registry",
          "Replaces Kubernetes",
        ],
        answer: 1,
        explain: "Compose orchestrates multiple services from one YAML file.",
      },
      {
        id: "w8q5",
        q: "Where do GitHub Actions live?",
        options: [".gh/", ".github/workflows/", "ci/", "actions/"],
        answer: 1,
        explain: "Workflows live in `.github/workflows/*.yml`.",
      },
    ],
    practical: ["Write a multi-stage Dockerfile", "Add a CI workflow that runs tests"],
    projectTask: "Dockerize full-stack app with compose",
    explainBack: "Explain why containers are reproducible across machines.",
    githubTask: "Commit: 'ci: add GitHub Actions test workflow'",
  },
  {
    week: 9,
    title: "Cybersecurity Basics",
    topic: "OWASP Top 10, validation, headers, rate limiting",
    questions: [
      {
        id: "w9q1",
        q: "Best defense against SQL injection?",
        options: [
          "Escape with string replace",
          "Parameterized queries",
          "Block suspicious words",
          "Hide errors",
        ],
        answer: 1,
        explain: "Parameterized queries separate code from data.",
      },
      {
        id: "w9q2",
        q: "XSS is mitigated by?",
        options: [
          "No validation needed",
          "Output encoding + CSP",
          "Disabling JS globally",
          "Long passwords",
        ],
        answer: 1,
        explain: "Encode output and use Content Security Policy headers.",
      },
      {
        id: "w9q3",
        q: "Why rate-limit endpoints?",
        options: [
          "Reduce server cost only",
          "Prevent brute force + abuse",
          "Speed up DB",
          "Compress responses",
        ],
        answer: 1,
        explain: "Rate limits stop credential stuffing and abuse.",
      },
      {
        id: "w9q4",
        q: "CSRF protection?",
        options: [
          "Disable cookies",
          "CSRF tokens + SameSite cookies",
          "Use HTTP",
          "Block all POSTs",
        ],
        answer: 1,
        explain: "Anti-CSRF tokens and SameSite cookies stop forged requests.",
      },
      {
        id: "w9q5",
        q: "Sensitive data in errors?",
        options: [
          "Include full stack to user",
          "Log server-side; show generic message",
          "Return DB query",
          "Email it",
        ],
        answer: 1,
        explain: "Never leak internals; log them, show generic messages.",
      },
    ],
    practical: ["Add input validation to one route", "Add a rate limiter middleware"],
    projectTask: "Write the API Hardening Report (before/after)",
    explainBack: "Explain 3 OWASP risks and how you mitigated them.",
    githubTask: "Commit: 'security: validation + rate limiting'",
  },
  {
    week: 10,
    title: "AI / ML Basics",
    topic: "Pandas, features, train/test, anomaly detection",
    questions: [
      {
        id: "w10q1",
        q: "Train/test split prevents?",
        options: [
          "Slow training",
          "Data leakage / overfitting evaluation",
          "Saving the model",
          "Importing libraries",
        ],
        answer: 1,
        explain: "You evaluate on data the model never saw.",
      },
      {
        id: "w10q2",
        q: "Pandas DataFrame is?",
        options: ["A model", "A 2D labeled table", "An HTTP client", "A neural net"],
        answer: 1,
        explain: "DataFrames are rows × labeled columns.",
      },
      {
        id: "w10q3",
        q: "Anomaly detection finds?",
        options: [
          "Average values",
          "Unusual patterns / outliers",
          "Sorted rows",
          "Duplicates only",
        ],
        answer: 1,
        explain: "Anomaly detection flags rare or unusual patterns.",
      },
      {
        id: "w10q4",
        q: "Best classification metric for imbalanced data?",
        options: ["Accuracy", "F1 / precision-recall", "Loss", "MSE"],
        answer: 1,
        explain: "Accuracy hides class imbalance; F1 balances precision & recall.",
      },
      {
        id: "w10q5",
        q: "Feature engineering means?",
        options: [
          "Random transforms",
          "Crafting useful inputs from raw data",
          "Picking a library",
          "Sorting features",
        ],
        answer: 1,
        explain: "Good features outperform fancy models.",
      },
    ],
    practical: ["Load a CSV with pandas", "Train a simple classifier and print accuracy"],
    projectTask: "Finish AI Log Anomaly Detector",
    explainBack: "Explain what train/test split protects you from.",
    githubTask: "Commit: 'feat: anomaly detector + report'",
  },
  {
    week: 11,
    title: "AI APIs + Integration",
    topic: "LLM calls, prompts, .env safety, DB save",
    questions: [
      {
        id: "w11q1",
        q: "Where do you call the LLM API from?",
        options: ["Frontend with API key", "Backend route", "Public HTML", "Git hooks"],
        answer: 1,
        explain: "Backend protects the key and applies validation.",
      },
      {
        id: "w11q2",
        q: "Prompt engineering best practice?",
        options: [
          "Vague prompts",
          "Clear role + task + format + examples",
          "One word prompts",
          "Random text",
        ],
        answer: 1,
        explain: "Structured prompts produce more predictable results.",
      },
      {
        id: "w11q3",
        q: "Where do API keys go?",
        options: [
          "Source code",
          ".env (gitignored) + secret manager",
          "Public Notion",
          "Frontend env",
        ],
        answer: 1,
        explain: "Server-side env vars only; never ship to client.",
      },
      {
        id: "w11q4",
        q: "Why save AI outputs to DB?",
        options: [
          "For random reasons",
          "Audit, reuse, evaluation, cost control",
          "To slow the app",
          "Required by AI",
        ],
        answer: 1,
        explain: "Persistence enables audit and reduces re-calls.",
      },
      {
        id: "w11q5",
        q: "What if the model returns invalid JSON?",
        options: ["Crash", "Validate with a schema + retry/repair", "Ignore", "Display raw"],
        answer: 1,
        explain: "Always validate model output and handle errors.",
      },
    ],
    practical: [
      "Wrap an LLM call with a backend route",
      "Save the response to a `summaries` table",
    ],
    projectTask: "Finish AI Incident Summary API",
    explainBack: "Explain why an LLM call should never happen from the frontend.",
    githubTask: "Commit: 'feat: incident summary endpoint'",
  },
  {
    week: 12,
    title: "Capstone + Automation",
    topic: "Architecture, detection, AI summary, alerts",
    questions: [
      {
        id: "w12q1",
        q: "Why draw an architecture diagram first?",
        options: [
          "For pretty README",
          "Clarifies data flow + boundaries",
          "Required by Git",
          "Speeds up DB",
        ],
        answer: 1,
        explain: "Diagrams make tradeoffs visible early.",
      },
      {
        id: "w12q2",
        q: "Failed-login detection rule example?",
        options: [
          "Allow infinite tries",
          "5+ failures from same IP in 5 min → flag",
          "Block all logins",
          "Ignore logs",
        ],
        answer: 1,
        explain: "Threshold-based rules are a great first line.",
      },
      {
        id: "w12q3",
        q: "Best place to trigger an alert?",
        options: [
          "Frontend timer",
          "Backend on detection or via webhook → automation",
          "Manual review only",
          "Once per day cron",
        ],
        answer: 1,
        explain: "Detect server-side, push via webhook/automation tool.",
      },
      {
        id: "w12q4",
        q: "Automation tool example?",
        options: ["Wireshark", "n8n / Make / Zapier", "Photoshop", "Docker"],
        answer: 1,
        explain: "These platforms compose triggers + actions visually.",
      },
      {
        id: "w12q5",
        q: "Resume-ready capstone needs?",
        options: [
          "Just code",
          "README + screenshots + deployment + interview story",
          "Only a demo video",
          "Diagram only",
        ],
        answer: 1,
        explain: "Recruiters need a story they can verify quickly.",
      },
    ],
    practical: ["Wire AI summary into capstone dashboard", "Test one automation alert end-to-end"],
    projectTask: "Final polish: README, screenshots, deploy",
    explainBack: "Explain the full capstone flow: upload → parse → detect → summarize → alert.",
    githubTask: "Commit: 'feat: capstone v1 ready for portfolio'",
  },
];

export type AssessmentScore = {
  week: number;
  correct: number;
  total: number;
  answers: Record<string, number>;
  takenAt: number;
};

export function useAssessmentScores() {
  return useLocalStorage<Record<number, AssessmentScore>>("los_assessments_v1", {});
}

// ===== Build-Without-Tutorial =====
export type Challenge = {
  id: string;
  week: number;
  title: string;
  prompt: string;
  successCriteria: string[];
  hint: string;
};

export const CHALLENGES: Challenge[] = [
  {
    id: "c1",
    week: 1,
    title: "Build a calculator from memory",
    prompt: "Implement a CLI calculator supporting +, -, *, / with input validation. No tutorial.",
    successCriteria: ["Handles divide-by-zero", "Loops until user quits", "Uses functions"],
    hint: "Start with a loop, then add operations one by one.",
  },
  {
    id: "c2",
    week: 2,
    title: "File organizer script",
    prompt: "Move files in a folder into subfolders by extension.",
    successCriteria: ["Reads dir contents", "Creates folders if missing", "Logs each move"],
    hint: "Use os.listdir + os.path.splitext + shutil.move.",
  },
  {
    id: "c3",
    week: 3,
    title: "Responsive card grid",
    prompt: "Build a 3-column → 1-column responsive card grid in pure HTML/CSS.",
    successCriteria: ["Uses grid or flex", "Mobile breakpoint", "Accessible markup"],
    hint: "Try `display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));`.",
  },
  {
    id: "c4",
    week: 4,
    title: "React form with validation",
    prompt: "Build a signup form with email + password validation, no library help.",
    successCriteria: ["Inline errors", "Submit disabled until valid", "useState only"],
    hint: "Track touched + error state per field.",
  },
  {
    id: "c5",
    week: 5,
    title: "One CRUD route without tutorial",
    prompt: "Implement POST /tasks with validation, DB insert, and JSON response.",
    successCriteria: ["Validates input", "Returns 201 on success", "Returns 400 on bad data"],
    hint: "Start with the happy path, then add validation.",
  },
  {
    id: "c6",
    week: 7,
    title: "Explain EC2/S3/IAM without notes",
    prompt: "Record yourself explaining each service in 60s. Write transcript.",
    successCriteria: ["Explains 'what'", "Explains 'when'", "Explains 'risk'"],
    hint: "Use this structure: what, why, when, risk, example.",
  },
  {
    id: "c7",
    week: 8,
    title: "Write a Dockerfile from memory",
    prompt: "Dockerize a Node or Python app without copying snippets.",
    successCriteria: ["FROM + WORKDIR + COPY + CMD", "Uses .dockerignore", "Builds successfully"],
    hint: "Multi-stage builds save image size.",
  },
  {
    id: "c8",
    week: 9,
    title: "Add input validation from memory",
    prompt: "Add Zod/Joi/Yup validation to one POST route end-to-end.",
    successCriteria: ["Schema defined", "Middleware enforces it", "Returns 400 with field errors"],
    hint: "Validate at the boundary; trust internals.",
  },
  {
    id: "c9",
    week: 11,
    title: "One AI API call from memory",
    prompt: "Call an LLM, parse response, and return result via a backend route.",
    successCriteria: ["Key from env", "Handles 4xx errors", "JSON-safe output"],
    hint: "Wrap fetch in try/catch and validate JSON shape.",
  },
];

export type ChallengeStatus = "not_started" | "tried" | "completed" | "need_revision";
export function useChallengeStatus() {
  return useLocalStorage<Record<string, ChallengeStatus>>("los_challenges_v1", {});
}
