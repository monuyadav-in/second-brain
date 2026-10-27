import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { CreateContentModal } from "../components/ui/CreateContentModel";
import { PlusIcon } from "../icons/plusIcons";
import { ShareIcon } from "../icons/shareIcons";
import { Sidebar } from "../components/ui/Sidebar";

interface ContentItem {
  id: string;
  type: "YouTube" | "Twitter" | "Document" | "Link";
  title: string;
  link: string;
  tags?: string[];
}

const INITIAL_CONTENTS: ContentItem[] = [
  {
    id: "demo-1",
    type: "YouTube",
    link: "https://youtu.be/KEQUpK_A9sM?si=yONRj_Dq6tvXQfV-",
    title: "100 Days Challenges",
    tags: ["learning", "coding"],
  },
  {
    id: "demo-2",
    type: "Twitter",
    link: "https://x.com/yadavakhilesh/status/2114365796747272347?s=20",
    title: "First twitt",
    tags: ["social", "updates"],
  },
];

function inferContentType(link: string): "YouTube" | "Twitter" | "Document" | "Link" {
  if (link.includes("youtu.be") || link.includes("youtube.com")) return "YouTube";
  if (link.includes("twitter.com") || link.includes("x.com")) return "Twitter";
  if (link.endsWith(".pdf") || link.endsWith(".doc") || link.endsWith(".md")) return "Document";
  return "Link";
}

export function Dashboard() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("All Notes");
  const [contents, setContents] = useState<ContentItem[]>(INITIAL_CONTENTS);
  const [loading, setLoading] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);

  const username = localStorage.getItem("username") || "My Workspace";
  const token = localStorage.getItem("token");

  // Fetch user content from backend on load
  useEffect(() => {
    async function fetchContents() {
      if (!token) return;
      setLoading(true);
      try {
        const response = await axios.get(`${BACKEND_URL}/api/v1/content`, {
          headers: {
            Authorization: token,
          },
        });

        const rawList = response.data?.content;
        if (Array.isArray(rawList)) {
          setBackendConnected(true);
          const mapped: ContentItem[] = rawList.map((item: any) => ({
            id: item._id || item.id,
            title: item.title,
            link: item.link,
            type: inferContentType(item.link),
            tags: item.tags || [],
          }));
          // If user has saved contents in db, show them; otherwise keep initial demo items
          if (mapped.length > 0) {
            setContents(mapped);
          }
        }
      } catch (err) {
        console.warn("Could not fetch content from backend (using local state):", err);
        setBackendConnected(false);
      } finally {
        setLoading(false);
      }
    }

    fetchContents();
  }, [token]);

  // Compute live counts for sidebar badges
  const counts: Record<string, number> = {
    "All Notes": contents.length,
    "Twitter": contents.filter((c) => c.type === "Twitter").length,
    "YouTube": contents.filter((c) => c.type === "YouTube").length,
    "Documents": contents.filter((c) => c.type === "Document").length,
    "Links": contents.filter((c) => c.type === "Link").length,
    "Tags": contents.reduce((acc, c) => acc + (c.tags?.length || 0), 0),
  };

  // Filter items based on active sidebar tab
  const filteredContents = contents.filter((item) => {
    if (activeTab === "All Notes" || activeTab === "Tags") return true;
    if (activeTab === "Twitter") return item.type === "Twitter";
    if (activeTab === "YouTube") return item.type === "YouTube";
    if (activeTab === "Documents") return item.type === "Document";
    if (activeTab === "Links") return item.type === "Link";
    return true;
  });

  const handleAddContent = async (newContent: {
    title: string;
    link: string;
    type: "YouTube" | "Twitter" | "Document" | "Link";
    tags: string[];
  }) => {
    const tempId = Date.now().toString();
    const localItem: ContentItem = {
      id: tempId,
      title: newContent.title,
      link: newContent.link,
      type: newContent.type,
      tags: newContent.tags,
    };

    // Optimistically update UI
    setContents((prev) => [localItem, ...prev]);

    // Send to backend if authenticated
    if (token) {
      try {
        await axios.post(
          `${BACKEND_URL}/api/v1/content`,
          {
            title: newContent.title,
            link: newContent.link,
          },
          {
            headers: {
              Authorization: token,
            },
          }
        );
      } catch (err) {
        console.error("Error saving content to backend:", err);
      }
    }
  };

  const handleDeleteContent = async (id: string) => {
    setContents((prev) => prev.filter((item) => item.id !== id));

    if (token && !id.startsWith("demo-")) {
      try {
        await axios.delete(`${BACKEND_URL}/api/v1/content`, {
          headers: {
            Authorization: token,
          },
          data: {
            contentId: id,
          },
        });
      } catch (err) {
        console.error("Error deleting content from backend:", err);
      }
    }
  };

  const handleShareBrain = async () => {
    if (token) {
      try {
        const response = await axios.post(
          `${BACKEND_URL}/api/v1/brain/share`,
          { share: true },
          { headers: { Authorization: token } }
        );
        const hash = response.data?.hash;
        if (hash) {
          const shareUrl = `${window.location.origin}/share/${hash}`;
          navigator.clipboard?.writeText(shareUrl);
          alert(`Share link copied: ${shareUrl}`);
          return;
        }
      } catch (err) {
        console.warn("Share API error, using current URL:", err);
      }
    }
    navigator.clipboard?.writeText(window.location.href);
    alert("Brain link copied to clipboard!");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/signin");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar with interactive items, active state & counts */}
      <Sidebar
        activeItem={activeTab}
        onSelect={setActiveTab}
        counts={counts}
        username={username}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="ml-72 flex-1 min-h-screen p-8 transition-all">
        {/* Top Header Bar */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-gray-200/80">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                {activeTab}
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700">
                {filteredContents.length} {filteredContents.length === 1 ? "item" : "items"}
              </span>
              {backendConnected && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Backend Connected
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {activeTab === "All Notes"
                ? `Welcome back, ${username}! Explore your saved knowledge base.`
                : `Showing all saved ${activeTab} items in your second brain.`}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              startIcon={<ShareIcon size="md" />}
              variant="secondary"
              text="Share Brain"
              onClick={handleShareBrain}
            />
            <Button
              startIcon={<PlusIcon size="md" />}
              variant="primary"
              text="Add Content"
              onClick={() => setModalOpen(true)}
            />
            <Button
              variant="secondary"
              text="Sign Out"
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200"
            />
          </div>
        </header>

        {/* Content Loading State */}
        {loading && (
          <div className="py-12 flex justify-center items-center text-sm text-purple-600 font-medium">
            <span className="animate-pulse">Loading brain content...</span>
          </div>
        )}

        {/* Cards Grid or Empty State */}
        {!loading && filteredContents.length > 0 ? (
          <div className="flex flex-wrap gap-5 items-start">
            {filteredContents.map((item) => (
              <Card
                key={item.id}
                type={item.type}
                title={item.title}
                link={item.link}
                onDelete={() => handleDeleteContent(item.id)}
                onShare={() => {
                  navigator.clipboard?.writeText(item.link);
                  alert(`Copied link for "${item.title}"!`);
                }}
              />
            ))}
          </div>
        ) : (
          !loading && (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-2xl border border-dashed border-gray-300 shadow-2xs">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <PlusIcon size="lg" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                No {activeTab} yet
              </h3>
              <p className="text-sm text-gray-500 max-w-sm mb-5">
                You haven't saved any {activeTab} content to your second brain yet. Click below to add one now.
              </p>
              <Button
                startIcon={<PlusIcon size="md" />}
                variant="primary"
                text="Add Content"
                onClick={() => setModalOpen(true)}
              />
            </div>
          )
        )}

        {/* Add Content Modal */}
        <CreateContentModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleAddContent}
        />
      </main>
    </div>
  );
}

export default Dashboard;
