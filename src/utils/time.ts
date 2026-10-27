// "now", "5 minutes ago", ... and the date for anything older than 4 weeks
export function getTime(time: number): string {
  const seconds = (Date.now() - time) / 1000;
  const ago = (amount: number, unit: string) => {
    const n = Math.floor(amount);
    return `${n} ${unit}${n === 1 ? "" : "s"} ago`;
  };

  if (seconds < 60) return "now";
  if (seconds < 3600) return ago(seconds / 60, "minute");
  if (seconds < 86400) return ago(seconds / 3600, "hour");
  if (seconds < 2419200) return ago(seconds / 86400, "day");
  return new Date(time).toString().slice(3, 15);
}
