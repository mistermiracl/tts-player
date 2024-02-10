import { useEffect, useState } from 'react';
import { FetchType, usePost } from './fetch';

const url = 'http://localhost:8080/tts';

export function useTTS(ssml?: string): [string | undefined, boolean, Error | undefined] {
  const [data, loading, poster, error] = usePost<string, Blob>(url, FetchType.BLOB);
  const [blobUrl, setBlobUrl] = useState<string>();

  useEffect(() => {
    if (ssml) {
      poster(ssml);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ssml]);

  useEffect(() => {
    setBlobUrl(undefined);
    if (data) {
      const newBlobUrl = URL.createObjectURL(data);
      setBlobUrl(newBlobUrl);
    }
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  return [blobUrl, loading, error];
}