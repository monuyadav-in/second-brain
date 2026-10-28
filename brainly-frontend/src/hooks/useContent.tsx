import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";

export type ContentType = "YouTube" | "Twitter" | "Document" | "Link";

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  link: string;
  tags?: string[];
}

export interface NewContentPayload {
  title: string;
  link: string;
  type?: ContentType;
  tags?: string[];
}

export function inferContentType(link: string): ContentType {
  if (link.includes("youtu.be") || link.includes("youtube.com")) return "YouTube";
  if (link.includes("twitter.com") || link.includes("x.com")) return "Twitter";
  if (link.endsWith(".pdf") || link.endsWith(".doc") || link.endsWith(".md")) return "Document";
  return "Link";
}

export function useContent() {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setContents([]);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${BACKEND_URL}/api/v1/content`, {
        headers: {
          Authorization: token,
        },
      });

      const rawList = response.data?.content;
      if (Array.isArray(rawList)) {
        const mapped: ContentItem[] = rawList.map((item: any) => ({
          id: item._id || item.id,
          title: item.title,
          link: item.link,
          type: (item.type as ContentType) || inferContentType(item.link),
          tags: Array.isArray(item.tags) ? item.tags : [],
        }));
        setContents(mapped);
      }
      setError(null);
    } catch (err: any) {
      console.warn("Error refreshing content:", err);
      setError(err?.response?.data?.message || "Failed to fetch content");
    } finally {
      setLoading(false);
    }
  }, []);

  // Add content to DB and update UI in real time
  const addContent = useCallback(
    async (payload: NewContentPayload): Promise<boolean> => {
      const token = localStorage.getItem("token");
      if (!token) return false;

      const detectedType = payload.type || inferContentType(payload.link);

      try {
        const response = await axios.post(
          `${BACKEND_URL}/api/v1/content`,
          {
            title: payload.title,
            link: payload.link,
            type: detectedType,
            tags: payload.tags || [],
          },
          {
            headers: {
              Authorization: token,
            },
          }
        );

        const createdItem = response.data?.content;
        if (createdItem && (createdItem._id || createdItem.id)) {
          const newItem: ContentItem = {
            id: createdItem._id || createdItem.id,
            title: createdItem.title,
            link: createdItem.link,
            type: (createdItem.type as ContentType) || detectedType,
            tags: createdItem.tags || payload.tags || [],
          };
          setContents((prev) => [newItem, ...prev.filter((c) => c.id !== newItem.id)]);
        } else {
          // If server didn't return full object, trigger immediate refresh
          await refresh();
        }

        return true;
      } catch (err: any) {
        console.error("Error creating content:", err);
        setError(err?.response?.data?.message || "Failed to add content");
        throw err;
      }
    },
    [refresh]
  );

  // Update content in DB and update UI in real time
  const updateContent = useCallback(
    async (contentId: string, payload: NewContentPayload): Promise<boolean> => {
      const token = localStorage.getItem("token");
      if (!token || !contentId) return false;

      const detectedType = payload.type || inferContentType(payload.link);

      // Optimistically update local state
      setContents((prev) =>
        prev.map((item) =>
          item.id === contentId
            ? {
                ...item,
                title: payload.title,
                link: payload.link,
                type: detectedType,
                tags: payload.tags || [],
              }
            : item
        )
      );

      try {
        await axios.put(
          `${BACKEND_URL}/api/v1/content`,
          {
            contentId,
            title: payload.title,
            link: payload.link,
            type: detectedType,
            tags: payload.tags || [],
          },
          {
            headers: {
              Authorization: token,
            },
          }
        );
        return true;
      } catch (err: any) {
        console.error("Error updating content:", err);
        await refresh();
        setError(err?.response?.data?.message || "Failed to update content");
        throw err;
      }
    },
    [refresh]
  );

  // Delete content from DB and remove from UI in real time
  const deleteContent = useCallback(
    async (contentId: string): Promise<boolean> => {
      const token = localStorage.getItem("token");
      if (!token || !contentId) return false;

      // Optimistically remove from state immediately
      setContents((prev) => prev.filter((item) => item.id !== contentId));

      try {
        await axios.delete(`${BACKEND_URL}/api/v1/content`, {
          headers: {
            Authorization: token,
          },
          data: {
            contentId: contentId,
          },
        });
        return true;
      } catch (err: any) {
        console.error("Error deleting content from backend:", err);
        // On error, refresh to restore accurate state
        await refresh();
        setError(err?.response?.data?.message || "Failed to delete content");
        return false;
      }
    },
    [refresh]
  );

  // Initial fetch + real-time interval polling & window focus sync
  useEffect(() => {
    refresh();

    // Poll every 5 seconds to keep data synced in real-time across tabs/sessions
    const interval = setInterval(() => {
      refresh();
    }, 5000);

    // Refresh immediately when tab gains focus
    const handleFocus = () => {
      refresh();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [refresh]);

  return {
    contents,
    setContents,
    refresh,
    loading,
    error,
    addContent,
    updateContent,
    deleteContent,
  };
}