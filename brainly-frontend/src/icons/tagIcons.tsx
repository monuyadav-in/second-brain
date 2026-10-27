export interface IconProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

const sizeStyles = {
    sm: "size-3.5",
    md: "size-5",
    lg: "size-6",
};

export const TagIcon = ({ size = "md", className = "" }: IconProps) => {
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
                d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.386l3.844-2.258c.827-.486 1.077-1.547.469-2.316l-8.995-11.39A2.25 2.25 0 0 0 9.568 3Z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
        </svg>
    );
};

export const tagIcons = TagIcon;
