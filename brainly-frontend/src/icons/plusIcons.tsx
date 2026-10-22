export interface IconProps {
    size?: "sm" | "md" | "lg";
}

const sizeStyles = {
    sm: "size-3.5",
    md: "size-5",
    lg: "size-6",
};

export const PlusIcon = (props: IconProps) => {
    const size = props.size || "md";
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className={sizeStyles[size]}
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
    );
};

export const plusIcons = PlusIcon;
