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
}

export function Sidebar({
    activeItem: controlledActiveItem,
    onSelect,
    counts = {},
    username = "My Workspace",
    onLogout,
}: SidebarProps) {
    const [localActiveItem, setLocalActiveItem] = useState("All Notes");
    const activeItem = controlledActiveItem ?? localActiveItem;

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

    const userInitial = username ? username.slice(0, 2).toUpperCase() : "SB";

    return (
        <aside className="h-screen bg-white w-72 border-r border-gray-200/90 fixed left-0 top-0 flex flex-col justify-between shadow-xs select-none z-30">
            {/* Top Brand & Navigation */}
            <div>
                {/* Brand Header */}
                <div className="flex items-center gap-3.5 px-6 py-5 border-b border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 to-purple-500 text-white flex items-center justify-center shadow-md shadow-purple-500/25 shrink-0 transition-transform hover:scale-105">
                        <BrainIcon size="md" className="text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-bold text-gray-900 tracking-tight leading-none">
                            Second Brain
                        </span>
                        <span className="text-xs font-medium text-purple-600 mt-1">
                            Personal Knowledge
                        </span>
                    </div>
                </div>

                {/* Section Header */}
                <div className="px-5 pt-6 pb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Knowledge Base
                </div>

                {/* Navigation Items */}
                <nav className="px-2 space-y-1">
                    {navigationItems.map((item) => (
                        <SidebarItem
                            key={item.id}
                            text={item.label}
                            icon={item.icon}
                            selected={activeItem === item.id}
                            onClick={() => handleSelect(item.id)}
                            badge={item.badge}
                        />
                    ))}
                </nav>
            </div>

            {/* Bottom Workspace / Status Area */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-gray-200/80 shadow-2xs">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 font-semibold text-xs flex items-center justify-center ring-2 ring-purple-500/20 shrink-0">
                            {userInitial}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold text-gray-800 truncate" title={username}>
                                {username}
                            </span>
                            <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Ready & Synced
                            </span>
                        </div>
                    </div>

                    {onLogout && (
                        <button
                            type="button"
                            onClick={onLogout}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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