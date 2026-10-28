import type { ReactElement } from "react";

export interface SidebarItemProps {
    text: string;
    icon: ReactElement;
    selected?: boolean;
    onClick?: () => void;
    badge?: string | number;
    className?: string;
    collapsed?: boolean;
}

export function SidebarItem({
    text,
    icon,
    selected = false,
    onClick,
    badge,
    className = "",
    collapsed = false,
}: SidebarItemProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={collapsed ? `${text}${badge !== undefined ? ` (${badge})` : ""}` : undefined}
            className={`group w-full flex items-center ${
                collapsed ? "justify-center px-2 py-2.5" : "justify-between px-3.5 py-2.5"
            } rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer outline-none select-none text-left relative ${
                selected
                    ? "bg-purple-100/80 text-purple-700 font-semibold shadow-xs"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 active:bg-gray-200/70"
            } ${className}`}
        >
            <div className={`flex items-center gap-3 min-w-0 ${collapsed ? "justify-center" : ""}`}>
                <span
                    className={`flex items-center justify-center shrink-0 transition-colors duration-200 ${
                        selected ? "text-purple-600" : "text-gray-500 group-hover:text-gray-800"
                    }`}
                >
                    {icon}
                </span>
                {!collapsed && <span className="truncate">{text}</span>}
            </div>

            {!collapsed && badge !== undefined ? (
                <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors shrink-0 ${
                        selected
                            ? "bg-purple-200 text-purple-800"
                            : "bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700"
                    }`}
                >
                    {badge}
                </span>
            ) : !collapsed && selected ? (
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0" />
            ) : null}

            {/* In collapsed mode, indicate active item with a small indicator dot */}
            {collapsed && selected && (
                <span className="absolute right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-purple-600" />
            )}
        </button>
    );
}