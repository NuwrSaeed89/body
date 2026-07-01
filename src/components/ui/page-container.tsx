import type { ReactNode } from "react";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "main" | "section";
};

export function PageContainer({
  children,
  className = "",
  as: Tag = "div",
}: PageContainerProps) {
  const isMain = Tag === "main";

  return (
    <Tag
      id={isMain ? "main-content" : undefined}
      tabIndex={isMain ? -1 : undefined}
      className={`mx-auto w-full max-w-[1440px] px-5 md:px-16 ${className}`}
    >
      {children}
    </Tag>
  );
}
