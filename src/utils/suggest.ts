import type { UserProfile } from "../types";

// pets followed by the pets you follow, most shared first, then recent
// posters; never you or anyone you already follow
export function rankSuggestions(
  me: UserProfile,
  follows: UserProfile[],
  recentAuthors: string[],
  max: number,
): string[] {
  const skip = new Set([me.username, ...me.following]);
  const counts = new Map<string, number>();
  for (const follow of follows) {
    for (const name of follow.following) {
      if (!skip.has(name)) counts.set(name, (counts.get(name) ?? 0) + 1);
    }
  }
  const ranked = [...counts.entries()]
    .sort(([a, x], [b, y]) => y - x || a.localeCompare(b))
    .map(([name]) => name);
  const recent = recentAuthors.filter((name) => !skip.has(name));
  return [...new Set([...ranked, ...recent])].slice(0, max);
}
