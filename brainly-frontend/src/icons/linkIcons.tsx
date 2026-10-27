export interface IconProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

const sizeStyles = {
    sm: "size-3.5",
    md: "size-5",
    lg: "size-6",
};

export const LinkIcon = ({ size = "md", className = "" }: IconProps) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.75"
            stroke="currentColor"
            className={`${sizeStyles[size]} ${className}`}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-3.32a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
            />
        </svg>
    );
};

export const linkIcons = LinkIcon;
