import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useLoader } from "./useLoader";

vi.mock("../utils/alerts", () => ({ reportError: vi.fn() }));

// a promise resolved from the outside
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

describe("useLoader", () => {
  it("is undefined until loaded, then holds the data", async () => {
    const load = deferred<string>();
    const fn = () => load.promise;
    const { result } = renderHook(() => useLoader(fn));
    expect(result.current.data).toBeUndefined();
    await act(async () => load.resolve("hello"));
    expect(result.current.data).toBe("hello");
  });

  it("ignores a load that finishes after a newer one started", async () => {
    const first = deferred<string>();
    const second = deferred<string>();
    const loaders = { first: () => first.promise, second: () => second.promise };
    const { result, rerender } = renderHook(
      ({ load }) => useLoader(load),
      { initialProps: { load: loaders.first } },
    );
    rerender({ load: loaders.second });
    await act(async () => second.resolve("new"));
    await act(async () => first.resolve("stale"));
    expect(result.current.data).toBe("new");
  });

  it("reload runs the loader again", async () => {
    let count = 0;
    const fn = async () => ++count;
    const { result } = renderHook(() => useLoader(fn));
    await waitFor(() => expect(result.current.data).toBe(1));
    await act(() => result.current.reload());
    expect(result.current.data).toBe(2);
  });
});
