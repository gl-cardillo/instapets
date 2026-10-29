import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getTime } from "./time";

const NOW = new Date("2026-06-15T12:00:00Z").getTime();
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe("getTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });
  afterEach(() => vi.useRealTimers());

  it.each([
    [30 * SECOND, "now"],
    [1 * MINUTE, "1 minute ago"],
    [5 * MINUTE + 30 * SECOND, "5 minutes ago"],
    [1 * HOUR, "1 hour ago"],
    [23 * HOUR, "23 hours ago"],
    [1 * DAY, "1 day ago"],
    [27 * DAY, "27 days ago"],
  ])("shows %i ms ago as %s", (ago, expected) => {
    expect(getTime(NOW - ago)).toBe(expected);
  });

  it("shows the date for anything older than 4 weeks", () => {
    expect(getTime(NOW - 40 * DAY)).toBe(
      new Date(NOW - 40 * DAY).toString().slice(3, 15),
    );
  });
});
