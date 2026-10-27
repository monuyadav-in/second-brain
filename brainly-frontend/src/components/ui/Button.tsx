import type { ReactElement } from "react";
import type { ReactNode } from "react";

export interface ButtonProps {
    variant?: "primary" | "secondary";
    size?: "sm" | "md" | "lg";
    text?: string;
    type?: "button" | "submit" | "reset";
    startIcon?: ReactElement;
    endIcon?: ReactElement;
    onClick?: () => void;
    fullWidth?: boolean;
    loading?: boolean;
    className?: string;
    children?: ReactNode;
}

const variantStyles: Record<"primary" | "secondary", string> = {
    primary: "bg-purple-600 text-white hover:bg-purple-700",
    secondary: "bg-purple-200 text-purple-600 hover:bg-purple-300",
};

const sizeStyles: Record<"sm" | "md" | "lg", string> = {
    sm: "py-1 px-3 text-sm gap-1.5",
    md: "py-2 px-4 text-base gap-2",
    lg: "py-3 px-6 text-lg gap-2.5",
};

const defaultStyles = "rounded-md font-medium flex items-center justify-center cursor-pointer transition-all duration-200 focus:outline-none";

export const Button = ({
    variant = "primary",
    size = "md",
    text,
    type = "button",
    startIcon,
    endIcon,
    onClick,
    fullWidth = false,
    loading = false,
    className = "",
    children,
}: ButtonProps) => {
    return (
        <button
            onClick={onClick}
            disabled={loading}
            type={type}
            className={`${variantStyles[variant]} ${sizeStyles[size]} ${defaultStyles} ${
                fullWidth ? "w-full" : ""
            } ${loading ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
        >
            {startIcon && <span className="flex items-center">{startIcon}</span>}
            {text && <span>{text}</span>}
            {children}
            {endIcon && <span className="flex items-center">{endIcon}</span>}
        </button>
    );
};
