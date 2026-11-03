import { useCallback, useEffect, useState } from "react";
import { reportError } from "../utils/alerts";

// loads when `load` changes (use useCallback) and ignores stale results
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
