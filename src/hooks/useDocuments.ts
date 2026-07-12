import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchRecentDocuments,
  saveDocument as saveDocumentRequest,
  type DocumentRecord,
  type SaveDocumentInput,
} from "@/lib/documents";

export function useDocuments() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setDocuments([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);
    try {
      const docs = await fetchRecentDocuments(user.id);
      setDocuments(docs);
    } catch (err) {
      console.error(err);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveDocument = useCallback(
    async (input: Omit<SaveDocumentInput, "userId">) => {
      if (!user) throw new Error("No hay sesión activa.");
      const saved = await saveDocumentRequest({ ...input, userId: user.id });
      setDocuments((prev) => [saved, ...prev].slice(0, 5));
      return saved;
    },
    [user]
  );

  return { documents, isLoading, hasError, saveDocument, refresh };
}
