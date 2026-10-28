import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { CreateContentModal } from "../components/ui/CreateContentModel";
import { EditContentModal } from "../components/ui/EditContentModal";
import { PlusIcon } from "../icons/plusIcons";
import { ShareIcon } from "../icons/shareIcons";
import { Sidebar } from "../components/ui/Sidebar";
import { useContent, type ContentType, type ContentItem } from "../hooks/useContent";

function getTabDefaultType(tab: string): ContentType {
  if (tab === "Documents") return "Document";
  if (tab === "YouTube") return "YouTube";
  if (tab === "Twitter") return "Twitter";
  if (tab === "Links") return "Link";
  return "Document";
}

export function Dashboard() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [activeTab, setActiveTab] = useState("All Notes");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Hook handles real-time sync with database, fetching, additions, updates, and deletions
  const { contents, loading, addContent, updateContent, deleteContent } = useContent();

  const displayName = localStorage.getItem("name") || localStorage.getItem("username") || "User";
  const token = localStorage.getItem("token");

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
    type: ContentType;
    tags: string[];
  }) => {
    try {
      await addContent(newContent);
    } catch (err) {
      console.error("Failed to add content:", err);
    }
  };

  const handleEditClick = (item: ContentItem) => {
    setEditingContent(item);
    setEditModalOpen(true);
  };

  const handleUpdateContent = async (
    id: string,
    updated: { title: string; link: string; type: ContentType; tags: string[] }
  ) => {
    try {
      await updateContent(id, updated);
    } catch (err) {
      console.error("Failed to update content:", err);
    }
  };

  const handleDeleteContent = async (id: string) => {
    try {
      await deleteContent(id);
    } catch (err) {
      console.error("Failed to delete content:", err);
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
    localStorage.removeItem("name");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    navigate("/signin");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Collapsible Sidebar with shadcn style toggle */}
      <Sidebar
        activeItem={activeTab}
        onSelect={setActiveTab}
        counts={counts}
        username={displayName}
        onLogout={handleLogout}
        collapsed={sidebarCollapsed}
        onToggleCollapse={setSidebarCollapsed}
      />

      {/* Main Content Area — shifts smoothly when sidebar collapses/expands */}
      <main
        className={`flex-1 min-h-screen p-8 transition-all duration-300 ${
          sidebarCollapsed ? "ml-20" : "ml-72"
        }`}
      >
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
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Welcome back, {displayName}!{" "}
              {activeTab === "All Notes"
                ? "Explore your saved knowledge base."
                : `Showing all saved ${activeTab} items.`}
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
        {loading && contents.length === 0 && (
          <div className="py-16 flex flex-col justify-center items-center text-sm text-purple-600 font-medium gap-2">
            <div className="w-7 h-7 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <span className="animate-pulse">Loading brain content...</span>
          </div>
        )}

        {/* Responsive Cards Grid (3 cards per row on laptop, 2 on tablet, 1 on mobile) */}
        {filteredContents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {filteredContents.map((item) => (
              <Card
                key={item.id}
                type={item.type}
                title={item.title}
                link={item.link}
                tags={item.tags}
                onEdit={() => handleEditClick(item)}
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

        {/* Add Content Modal with Auto-selected Type */}
        <CreateContentModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleAddContent}
          defaultType={getTabDefaultType(activeTab)}
        />

        {/* Edit Content Modal */}
        <EditContentModal
          open={editModalOpen}
          content={editingContent}
          onClose={() => {
            setEditModalOpen(false);
            setEditingContent(null);
          }}
          onSubmit={handleUpdateContent}
        />
      </main>
    </div>
  );
}

export default Dashboard;
