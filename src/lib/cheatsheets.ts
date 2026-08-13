export type CheatCmd = {
  cmd: string;
  what: string;
  example: string;
  when: string;
  mistake?: string;
};
export type CheatSheet = { name: string; icon: string; cmds: CheatCmd[] };

export const CHEATSHEETS: CheatSheet[] = [
  {
    name: "Git",
    icon: "🔧",
    cmds: [
      {
        cmd: "git init",
        what: "Start a new repo",
        example: "git init",
        when: "First time in a folder",
        mistake: "Running it inside an existing repo",
      },
      {
        cmd: "git status",
        what: "See changed files",
        example: "git status",
        when: "Before commits",
      },
      {
        cmd: "git add .",
        what: "Stage all changes",
        example: "git add .",
        when: "Before commit",
        mistake: "Adding secrets/.env",
      },
      {
        cmd: "git commit -m",
        what: "Save a snapshot",
        example: 'git commit -m "feat: login"',
        when: "Working chunk done",
      },
      {
        cmd: "git push",
        what: "Upload to remote",
        example: "git push origin main",
        when: "End of work session",
      },
      {
        cmd: "git pull",
        what: "Sync from remote",
        example: "git pull origin main",
        when: "Start of work session",
      },
      {
        cmd: "git checkout -b",
        what: "New branch",
        example: "git checkout -b feat/auth",
        when: "Starting a feature",
      },
      {
        cmd: "git log --oneline",
        what: "Compact history",
        example: "git log --oneline -10",
        when: "Reviewing recent work",
      },
    ],
  },
  {
    name: "Linux",
    icon: "🐧",
    cmds: [
      { cmd: "ls -la", what: "List files w/ hidden", example: "ls -la", when: "Inspecting folder" },
      { cmd: "cd", what: "Change directory", example: "cd projects/app", when: "Navigation" },
      { cmd: "pwd", what: "Print current path", example: "pwd", when: "Lost in terminal" },
      { cmd: "cat", what: "Read file", example: "cat README.md", when: "Quick view" },
      {
        cmd: "grep -r",
        what: "Search in files",
        example: 'grep -r "TODO" .',
        when: "Find code/text",
      },
      { cmd: "chmod +x", what: "Make executable", example: "chmod +x deploy.sh", when: "Scripts" },
      {
        cmd: "ssh user@host",
        what: "Remote login",
        example: "ssh ec2-user@1.2.3.4",
        when: "EC2/server access",
      },
      {
        cmd: "tail -f",
        what: "Follow log file",
        example: "tail -f /var/log/app.log",
        when: "Live debugging",
      },
    ],
  },
  {
    name: "Docker",
    icon: "🐳",
    cmds: [
      {
        cmd: "docker build -t",
        what: "Build image",
        example: "docker build -t myapp .",
        when: "After Dockerfile change",
      },
      {
        cmd: "docker run",
        what: "Start container",
        example: "docker run -p 3000:3000 myapp",
        when: "Local test",
      },
      { cmd: "docker ps", what: "List running", example: "docker ps", when: "Anytime" },
      { cmd: "docker logs", what: "View logs", example: "docker logs <id>", when: "Debugging" },
      {
        cmd: "docker compose up",
        what: "Start stack",
        example: "docker compose up -d",
        when: "Multi-service",
      },
      {
        cmd: "docker exec -it",
        what: "Shell in container",
        example: "docker exec -it app bash",
        when: "Inspect inside",
      },
    ],
  },
  {
    name: "AWS CLI",
    icon: "☁️",
    cmds: [
      {
        cmd: "aws configure",
        what: "Set credentials",
        example: "aws configure",
        when: "First setup",
        mistake: "Committing ~/.aws creds",
      },
      { cmd: "aws s3 ls", what: "List buckets", example: "aws s3 ls", when: "Check buckets" },
      {
        cmd: "aws s3 sync",
        what: "Upload folder",
        example: "aws s3 sync ./dist s3://my-site",
        when: "Static deploy",
      },
      {
        cmd: "aws ec2 describe-instances",
        what: "List EC2",
        example: "aws ec2 describe-instances",
        when: "See servers",
      },
      {
        cmd: "aws ec2 stop-instances",
        what: "Stop EC2 to save cost",
        example: "aws ec2 stop-instances --instance-ids i-123",
        when: "End of day",
      },
      {
        cmd: "aws logs tail",
        what: "Stream CloudWatch",
        example: "aws logs tail /aws/lambda/fn --follow",
        when: "Debug Lambda",
      },
    ],
  },
  {
    name: "SQL",
    icon: "🗃️",
    cmds: [
      {
        cmd: "SELECT",
        what: "Read rows",
        example: "SELECT * FROM users WHERE id=1;",
        when: "Querying",
      },
      {
        cmd: "INSERT",
        what: "Add row",
        example: "INSERT INTO tasks(title) VALUES ('study');",
        when: "Creating",
      },
      {
        cmd: "UPDATE",
        what: "Change rows",
        example: "UPDATE tasks SET done=true WHERE id=2;",
        when: "Editing",
        mistake: "Forgetting WHERE clause",
      },
      {
        cmd: "DELETE",
        what: "Remove rows",
        example: "DELETE FROM tasks WHERE id=2;",
        when: "Cleanup",
        mistake: "Forgetting WHERE",
      },
      {
        cmd: "JOIN",
        what: "Combine tables",
        example: "SELECT u.name, t.title FROM users u JOIN tasks t ON t.user_id=u.id;",
        when: "Relational query",
      },
      {
        cmd: "CREATE TABLE",
        what: "Define schema",
        example: "CREATE TABLE users(id SERIAL PK, email TEXT UNIQUE);",
        when: "Migration",
      },
    ],
  },
  {
    name: "npm",
    icon: "📦",
    cmds: [
      {
        cmd: "npm init -y",
        what: "New package.json",
        example: "npm init -y",
        when: "Fresh project",
      },
      { cmd: "npm install", what: "Add deps", example: "npm install express", when: "New library" },
      { cmd: "npm run dev", what: "Run dev script", example: "npm run dev", when: "Local server" },
      {
        cmd: "npm audit fix",
        what: "Fix vuln",
        example: "npm audit fix",
        when: "After audit warning",
      },
    ],
  },
  {
    name: "Python",
    icon: "🐍",
    cmds: [
      {
        cmd: "python -m venv",
        what: "Virtualenv",
        example: "python -m venv .venv",
        when: "New project",
        mistake: "Forgetting to activate",
      },
      {
        cmd: "pip install -r",
        what: "Install deps",
        example: "pip install -r requirements.txt",
        when: "Project setup",
      },
      {
        cmd: "python -m pytest",
        what: "Run tests",
        example: "python -m pytest -q",
        when: "After changes",
      },
      {
        cmd: "uvicorn app:app",
        what: "Run FastAPI",
        example: "uvicorn app:app --reload",
        when: "Local dev",
      },
    ],
  },
  {
    name: "API Testing",
    icon: "🛰️",
    cmds: [
      {
        cmd: "curl -X GET",
        what: "GET request",
        example: "curl -X GET http://localhost:3000/tasks",
        when: "Smoke test",
      },
      {
        cmd: "curl -X POST",
        what: "POST JSON",
        example: `curl -X POST -H "Content-Type: application/json" -d '{"title":"x"}' http://localhost:3000/tasks`,
        when: "Create",
      },
      {
        cmd: "curl -H Authorization",
        what: "Auth header",
        example: 'curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/me',
        when: "JWT routes",
      },
      {
        cmd: "httpie http",
        what: "Nicer client",
        example: "http POST :3000/tasks title=x",
        when: "Quick prototyping",
      },
    ],
  },
  {
    name: "Security Checklist",
    icon: "🛡️",
    cmds: [
      {
        cmd: ".env in .gitignore",
        what: "Hide secrets",
        example: 'echo ".env" >> .gitignore',
        when: "Always",
      },
      {
        cmd: "bcrypt password",
        what: "Hash before save",
        example: "bcrypt.hash(password, 10)",
        when: "Register",
      },
      {
        cmd: "validate input",
        what: "Reject bad data",
        example: "zod.parse(body)",
        when: "Every route",
      },
      {
        cmd: "rate limit",
        what: "Throttle abuse",
        example: "express-rate-limit on /login",
        when: "Auth/AI endpoints",
      },
      {
        cmd: "helmet()",
        what: "Security headers",
        example: "app.use(helmet())",
        when: "Express boot",
      },
      { cmd: "parameterized SQL", what: "Stop SQLi", example: "WHERE id=$1", when: "All queries" },
    ],
  },
];
