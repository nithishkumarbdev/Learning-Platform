import { Link } from "@tanstack/react-router";
import { Compass, ArrowRight } from "lucide-react";
import { DAYS } from "@/lib/days";
import { useProgress } from "@/lib/storage";
import { useRevisions, useBugs } from "@/lib/extra";

export function NextBestAction() {
  const { progress } = useProgress();
  const [revs] = useRevisions();
  const [bugs] = useBugs();

  // find current day
  const current = (() => {
    for (const d of DAYS) if (!progress[`d${d.day}.build`]) return d;
    return DAYS[DAYS.length - 1];
  })();

  const dueRevs = revs.filter((r) => !r.done && r.nextDue <= Date.now()).length;
  const unfixedBugs = bugs.filter((b) => !b.fixed).length;

  let action = {
    title: "Continue today's mission",
    sub: `Day ${current.day} — ${current.topic}. Build at least one feature and push to GitHub.`,
    href: "/today",
  };
  if (dueRevs >= 3) {
    action = {
      title: `${dueRevs} topics due for revision`,
      sub: "Spaced repetition keeps knowledge from leaking. Revise weak topics first today.",
      href: "/revision",
    };
  } else if (unfixedBugs >= 3) {
    action = {
      title: `${unfixedBugs} open bugs in your journal`,
      sub: "Resolve and document the fix before adding more features.",
      href: "/bugs",
    };
  } else if (!progress[`d${current.day}.github`]) {
    action = {
      title: "Push something to GitHub today",
      sub: "If you didn't commit, you didn't build. Even a README update counts.",
      href: "/today",
    };
  } else if (!progress[`d${current.day}.dsa`] && current.day >= 3) {
    action = {
      title: "Solve 1 easy DSA problem",
      sub: "30–45 min, NeetCode/LeetCode easy. Hints from AI only — no full solutions.",
      href: "/today",
    };
  }

  return (
    <Link
      to={action.href}
      className="block rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-5 shadow-card transition-transform hover:-translate-y-0.5"
    >
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary">
          <Compass className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-widest text-primary">Next Best Action</div>
          <div className="mt-0.5 text-lg font-semibold">{action.title}</div>
          <p className="mt-1 text-sm text-muted-foreground">{action.sub}</p>
        </div>
        <ArrowRight className="h-5 w-5 text-primary" />
      </div>
    </Link>
  );
}
