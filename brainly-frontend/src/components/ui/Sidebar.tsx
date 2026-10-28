import { useState } from "react";
import { BrainIcon } from "../../icons/brainIcons";
import { TwitterIcon } from "../../icons/twitter";
import { YouTubeIcon } from "../../icons/youtube";
import { DocumentIcon } from "../../icons/documentIcons";
import { LinkIcon } from "../../icons/linkIcons";
import { TagIcon } from "../../icons/tagIcons";
import { SidebarItem } from "./SidebarItem";

export interface SidebarProps {
    activeItem?: string;
    onSelect?: (item: string) => void;
    counts?: Record<string, number>;
    username?: string;
    onLogout?: () => void;
    collapsed?: boolean;
    onToggleCollapse?: (collapsed: boolean) => void;
}

export function Sidebar({
    activeItem: controlledActiveItem,
    onSelect,
    counts = {},
    username = "User",
    onLogout,
    collapsed: controlledCollapsed,
    onToggleCollapse,
}: SidebarProps) {
    const [localActiveItem, setLocalActiveItem] = useState("All Notes");
    const [localCollapsed, setLocalCollapsed] = useState(false);

    const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : localCollapsed;
    const activeItem = controlledActiveItem ?? localActiveItem;

    const handleToggle = () => {
        const next = !isCollapsed;
        setLocalCollapsed(next);
        onToggleCollapse?.(next);
    };

    const handleSelect = (item: string) => {
        setLocalActiveItem(item);
        onSelect?.(item);
    };

    const navigationItems = [
        { id: "All Notes", label: "All Notes", icon: <BrainIcon size="md" />, badge: counts["All Notes"] },
        { id: "Twitter", label: "Twitter", icon: <TwitterIcon size="md" />, badge: counts["Twitter"] },
        { id: "YouTube", label: "YouTube", icon: <YouTubeIcon size="md" />, badge: counts["YouTube"] },
        { id: "Documents", label: "Documents", icon: <DocumentIcon size="md" />, badge: counts["Documents"] },
        { id: "Links", label: "Links", icon: <LinkIcon size="md" />, badge: counts["Links"] },
        { id: "Tags", label: "Tags", icon: <TagIcon size="md" />, badge: counts["Tags"] },
    ];

    const userInitial = username ? username.slice(0, 2).toUpperCase() : "ME";

    return (
        <aside
            className={`h-screen bg-white border-r border-gray-200/90 fixed left-0 top-0 flex flex-col justify-between shadow-xs select-none z-30 transition-all duration-300 ${
                isCollapsed ? "w-20" : "w-72"
            }`}
        >
            {/* Top Brand & Navigation */}
            <div>
                {/* Brand Header & shadcn-style Collapse Toggle */}
                <div
                    className={`flex items-center border-b border-gray-100 py-4 ${
                        isCollapsed ? "justify-center px-2" : "justify-between px-5"
                    }`}
                >
                    {!isCollapsed ? (
                        <>
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 to-purple-500 text-white flex items-center justify-center shadow-md shadow-purple-500/25 shrink-0 transition-transform hover:scale-105">
                                    <BrainIcon size="md" className="text-white" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-lg font-bold text-gray-900 tracking-tight leading-none truncate">
                                        Second Brain
                                    </span>
                                    <span className="text-[11px] font-medium text-purple-600 mt-1">
                                        Personal Knowledge
                                    </span>
                                </div>
                            </div>

                            {/* Shadcn style panel toggle button */}
                            <button
                                type="button"
                                onClick={handleToggle}
                                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                title="Collapse sidebar"
                                aria-label="Collapse sidebar"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-5 h-5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <rect width="18" height="18" x="3" y="3" rx="2" />
                                    <path d="M9 3v18" />
                                    <path d="m14 9-3 3 3 3" />
                                </svg>
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            {/* Toggle button to expand */}
                            <button
                                type="button"
                                onClick={handleToggle}
                                className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all cursor-pointer"
                                title="Expand sidebar"
                                aria-label="Expand sidebar"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-5 h-5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <rect width="18" height="18" x="3" y="3" rx="2" />
                                    <path d="M9 3v18" />
                                    <path d="m13 15 3-3-3-3" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>

                {/* Section Header */}
                {!isCollapsed && (
                    <div className="px-5 pt-5 pb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        Knowledge Base
                    </div>
                )}

                {/* Navigation Items */}
                <nav className={`space-y-1.5 ${isCollapsed ? "px-2 pt-4" : "px-3 pt-1"}`}>
                    {navigationItems.map((item) => (
                        <SidebarItem
                            key={item.id}
                            text={item.label}
                            icon={item.icon}
                            selected={activeItem === item.id}
                            onClick={() => handleSelect(item.id)}
                            badge={item.badge}
                            collapsed={isCollapsed}
                        />
                    ))}
                </nav>
            </div>

            {/* Bottom Workspace / Profile Area */}
            <div className={`border-t border-gray-100 bg-gray-50/50 ${isCollapsed ? "p-2" : "p-4"}`}>
                <div
                    className={`flex items-center rounded-xl bg-white border border-gray-200/80 shadow-2xs ${
                        isCollapsed ? "justify-center p-2 flex-col gap-2" : "justify-between p-2.5"
                    }`}
                >
                    <div className="flex items-center gap-3 min-w-0" title={username}>
                        <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 font-semibold text-xs flex items-center justify-center ring-2 ring-purple-500/20 shrink-0">
                            {userInitial}
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-semibold text-gray-800 truncate">
                                    {username}
                                </span>
                            </div>
                        )}
                    </div>

                    {onLogout && (
                        <button
                            type="button"
                            onClick={onLogout}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                            title="Sign out"
                            aria-label="Sign out"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;