import { useCallback, useEffect, useState } from "react";
import { reportError } from "../utils/alerts";

// Runs `load` on mount and whenever it changes (wrap it in useCallback).
// `data` is undefined until the first load finishes; `reload` re-runs it,
// e.g. after a change. Results from a superseded load are dropped.
export function useLoader<T>(load: () => Promise<T>) {
  const [data, setData] = useState<T>();

  useEffect(() => {
    let current = true;
    load()
      .then((result) => {
        if (current) setData(result);
      })
      .catch(reportError);
    return () => {
      current = false;
    };
  }, [load]);

  const reload = useCallback(async () => setData(await load()), [load]);

  return { data, setData, reload };
}
