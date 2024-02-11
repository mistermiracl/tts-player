import { useEffect, useRef, useState } from 'react';

export enum FetchType {
  JSON,
  TEXT,
  BLOB
}

export function useGet<T>(url?: string, responseType: FetchType = FetchType.JSON): [T | undefined, boolean, Error | undefined] {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    setData(undefined);
    setError(undefined);
    if (!url) return;

    const abortCtrl = new AbortController();
    const get = async () => {
      setLoading(true);
      try {
        const res = await fetch(url, {
          signal: abortCtrl.signal
        });
        let data: T
        switch (responseType) {
          case FetchType.JSON:
            data = (await res.json()) as T;
            break;
          case FetchType.TEXT:
            data = (await res.text()) as T;
            break;
          case FetchType.BLOB:
            data = (await res.blob()) as T;
            break;
        }
        setData(data);
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    }
    get();
    return () => abortCtrl.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return [data, loading, error];
}

type usePostReturnType<TBody, TResBody> = [TResBody | undefined, boolean, (reqBody: TBody) => void, Error | undefined];

export function usePost<TBody extends string, TResBody>(url?: string, responseType: FetchType = FetchType.JSON): usePostReturnType<TBody, TResBody> {
  const [data, setData] = useState<TResBody>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error>();
  const abortCtrl = useRef<AbortController>();

  async function poster(reqBody: TBody) {
    setData(undefined);
    setError(undefined);
    if (!url) return;

    setLoading(true);
    try {
      const res = await fetch(url, {
        method: 'POST',
        body: reqBody,
        // NOTE: still doesn't make sense since refs are supposed to keep that intiial value among re render and abort is never called
        // must be react's use strict mode
        signal: abortCtrl.current!.signal
      });
      let data: TResBody;
      switch (responseType) {
        case FetchType.JSON:
          data = (await res.json()) as TResBody;
          break;
        case FetchType.TEXT:
          data = (await res.text()) as TResBody;
          break;
        case FetchType.BLOB:
          data = (await res.blob()) as TResBody;
          break;
      }
      setData(data);
    } catch (e) {
      console.log(e);
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    abortCtrl.current = new AbortController();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => abortCtrl.current!.abort();
  }, []);

  return [data, loading, poster, error];
}
