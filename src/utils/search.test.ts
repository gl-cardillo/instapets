import { describe, expect, it } from "vitest";
import type { UserProfile } from "../types";
import { rankResults, searchTermsFor } from "./search";
import { rankSuggestions } from "./suggest";

const user = (username: string, following: string[] = []) =>
  ({ username, following }) as UserProfile;

describe("searchTermsFor", () => {
  it("lists every lowercase fragment of 2+ letters", () => {
    expect(searchTermsFor("Abc").sort()).toEqual(["ab", "abc", "bc"]);
    expect(searchTermsFor("Amleto")).toContain("leto");
  });

  it("stays within the rules' limit of 105 for the longest names", () => {
    expect(searchTermsFor("abcdefghijklmno")).toHaveLength(105);
    expect(searchTermsFor("aaaaaaaaaaaaaaa").length).toBeLessThan(105);
  });
});

describe("rankResults", () => {
  it("puts names starting with the text first, without duplicates", () => {
    const found = [user("Amleto"), user("Leto"), user("Amleto"), user("Cleto")];
    expect(rankResults(found, "le", 10).map((u) => u.username)).toEqual([
      "Leto",
      "Amleto",
      "Cleto",
    ]);
    expect(rankResults(found, "le", 2)).toHaveLength(2);
  });
});

describe("rankSuggestions", () => {
  const follows = [
    user("bob", ["carol", "dave", "alice"]),
    user("eve", ["dave", "frank"]),
  ];

  it("ranks friends of friends by how many follow them", () => {
    expect(rankSuggestions("alice", ["bob", "eve"], follows, [], 5)).toEqual([
      "dave",
      "carol",
      "frank",
    ]);
  });

  it("fills up with recent posters, never you or who you follow", () => {
    expect(
      rankSuggestions(
        "alice",
        ["bob", "eve"],
        follows,
        ["alice", "bob", "gina", "dave"],
        5,
      ),
    ).toEqual(["dave", "carol", "frank", "gina"]);
    expect(rankSuggestions("alice", [], [], ["bob"], 1)).toEqual(["bob"]);
  });
});
