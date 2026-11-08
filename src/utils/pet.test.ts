import { describe, expect, it } from "vitest";
import { petAge, petTags } from "./pet";

const now = new Date("2026-06-15T12:00:00Z");

describe("petAge", () => {
  it.each([
    [2026, "under 1 year"],
    [2025, "1 year"],
    [2020, "6 years"],
  ])("born in %i is %s", (year, age) => {
    expect(petAge(year, now)).toBe(age);
  });
});

describe("petTags", () => {
  it("lists the details that are set, in order", () => {
    expect(
      petTags(
        { city: "Rome", species: "dog", birthYear: 2023, breed: "Labrador" },
        now,
      ),
    ).toEqual(["Dog", "Labrador", "3 years", "Rome"]);
    expect(petTags({ city: "Rome" }, now)).toEqual(["Rome"]);
  });

  it("has nothing for older users without details", () => {
    expect(petTags(undefined, now)).toEqual([]);
    expect(petTags({}, now)).toEqual([]);
  });
});
