import type { UserProfile } from "../types";

// every lowercase fragment of 2+ letters, so search can match inside names
export function searchTermsFor(username: string): string[] {
  const name = username.toLowerCase();
  const terms = new Set<string>();
  for (let start = 0; start < name.length; start++) {
    for (let end = start + 2; end <= name.length; end++) {
      terms.add(name.slice(start, end));
    }
  }
  return [...terms];
}

// names starting with the text first, then the rest, each alphabetical
export function rankResults(
  users: UserProfile[],
  text: string,
  max: number,
): UserProfile[] {
  const query = text.toLowerCase().trim();
  const unique = [...new Map(users.map((u) => [u.username, u])).values()];
  const name = (u: UserProfile) => u.username.toLowerCase();
  return unique
    .sort(
      (a, b) =>
        Number(name(b).startsWith(query)) - Number(name(a).startsWith(query)) ||
        name(a).localeCompare(name(b)),
    )
    .slice(0, max);
}
