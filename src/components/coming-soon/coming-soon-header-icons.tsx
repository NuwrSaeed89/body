"use client";

import { MaterialIcon } from "@/components/ui/material-icon";

const shellIcons = ["search", "favorite", "person", "shopping_bag"] as const;

export function ComingSoonHeaderIcons() {
  return (
    <div
      className="flex items-center justify-end gap-5 text-white"
      aria-hidden
    >
      {shellIcons.map((icon) => (
        <span key={icon} className="relative inline-flex">
          <MaterialIcon name={icon} className="text-white" />
          {icon === "shopping_bag" && (
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-white" />
          )}
        </span>
      ))}
    </div>
  );
}
