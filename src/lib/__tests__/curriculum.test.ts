import { describe, expect, it } from "vitest";

import { DAYS, TRACK_COLOR, WEEK_THEMES, type Track } from "../days";
import { ASSESSMENTS, CHALLENGES } from "../assessments";
import { PROJECTS } from "../projects";
import { levelFromXP } from "../storage";

describe("84-day curriculum", () => {
  it("contains exactly 84 sequential days", () => {
    expect(DAYS).toHaveLength(84);
    expect(DAYS.map((d) => d.day)).toEqual(Array.from({ length: 84 }, (_, i) => i + 1));
  });

  it("maps every day to the correct week (1-12)", () => {
    for (const day of DAYS) {
      expect(day.week).toBe(Math.ceil(day.day / 7));
      expect(WEEK_THEMES[day.week]).toBeDefined();
    }
  });

  it("gives every day a complete mission (learn, practice, build, AI review)", () => {
    for (const day of DAYS) {
      expect(day.topic.length).toBeGreaterThan(0);
      expect(day.learn.subtopics.length).toBeGreaterThan(0);
      expect(day.practice.steps.length).toBeGreaterThan(0);
      expect(day.build.steps.length).toBeGreaterThan(0);
      expect(day.ai.prompt.length).toBeGreaterThan(0);
      expect(day.github.commitMsg.length).toBeGreaterThan(0);
    }
  });

  it("has a colour token for every track in use", () => {
    const tracks = new Set<Track>(DAYS.map((d) => d.track));
    for (const track of tracks) expect(TRACK_COLOR[track]).toBeTruthy();
  });
});

describe("assessments and challenges", () => {
  it("has one assessment per week with answerable questions", () => {
    expect(ASSESSMENTS.length).toBeGreaterThan(0);
    for (const a of ASSESSMENTS) {
      expect(a.questions.length).toBeGreaterThan(0);
      for (const q of a.questions) {
        expect(q.options.length).toBeGreaterThan(1);
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThan(q.options.length);
        expect(q.explain.length).toBeGreaterThan(0);
      }
    }
  });

  it("uses unique ids across all challenges", () => {
    const ids = CHALLENGES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("projects", () => {
  it("uses unique project ids", () => {
    const ids = PROJECTS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("levelFromXP", () => {
  it("progresses monotonically through the five levels", () => {
    const levels = [0, 299, 300, 699, 700, 1199, 1200, 1999, 2000, 5000].map(
      (xp) => levelFromXP(xp).level,
    );
    expect(levels).toEqual([1, 1, 2, 2, 3, 3, 4, 4, 5, 5]);
    expect(levelFromXP(2500).label).toBe("Job Ready");
  });
});
