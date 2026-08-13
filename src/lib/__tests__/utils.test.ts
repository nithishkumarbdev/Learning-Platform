import { describe, expect, it } from "vitest";

import { cn } from "../utils";

describe("cn", () => {
  it("merges conditional classes", () => {
    const hidden = false;
    expect(cn("p-2", hidden && "hidden", "text-sm")).toBe("p-2 text-sm");
  });

  it("lets later tailwind utilities win", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});
