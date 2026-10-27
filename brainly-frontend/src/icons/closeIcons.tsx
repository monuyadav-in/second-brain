export interface IconProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

const sizeStyles = {
    sm: "size-3.5",
    md: "size-5",
    lg: "size-6",
};

export const CloseIcon = ({ size = "md", className = "" }: IconProps) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className={`${sizeStyles[size]} ${className}`}
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
    );
};

export const closeIcons = CloseIcon;