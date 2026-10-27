import type { ReactElement } from "react";

export interface SidebarItemProps {
    text: string;
    icon: ReactElement;
    selected?: boolean;
    onClick?: () => void;
    badge?: string | number;
    className?: string;
}

export function SidebarItem({
    text,
    icon,
    selected = false,
    onClick,
    badge,
    className = "",
}: SidebarItemProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`group w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer outline-none select-none text-left ${
                selected
                    ? "bg-purple-100/70 text-purple-700 font-semibold shadow-xs"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 active:bg-gray-200/70"
            } ${className}`}
        >
            <div className="flex items-center gap-3 min-w-0">
                <span
                    className={`flex items-center justify-center shrink-0 transition-colors duration-200 ${
                        selected ? "text-purple-600" : "text-gray-500 group-hover:text-gray-800"
                    }`}
                >
                    {icon}
                </span>
                <span className="truncate">{text}</span>
            </div>

            {badge !== undefined ? (
                <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors shrink-0 ${
                        selected
                            ? "bg-purple-200 text-purple-800"
                            : "bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700"
                    }`}
                >
                    {badge}
                </span>
            ) : selected ? (
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0" />
            ) : null}
        </button>
    );
}