import React from "react";
import { BaseComponentProps } from "../../types";

interface AvatarProps extends BaseComponentProps {
  src?: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  online?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = "md",
  online = false,
  className = "",
}) => {
  const sizeStyles = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const indicatorSize = {
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
    xl: "w-4 h-4",
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <img
        src={
          src ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            alt
          )}&background=8B5CF6&color=fff`
        }
        alt={alt}
        className={`
          ${sizeStyles[size]}
          rounded-full
          object-cover
          border-2 border-gray-200 dark:border-gray-700
          transition-all duration-200
        `}
      />
      {online && (
        <div
          className={`
            absolute bottom-0 right-0
            ${indicatorSize[size]}
            bg-emerald-500
            border-2 border-white dark:border-gray-800
            rounded-full
          `}
        />
      )}
    </div>
  );
};
