import type { DetailedHTMLProps, HTMLAttributes } from "react";

type ModelViewerProps = DetailedHTMLProps<
  HTMLAttributes<HTMLElement> & {
    src?: string;
    alt?: string;
    poster?: string;
    loading?: "auto" | "lazy" | "eager" | string;
    reveal?: "auto" | "interaction" | "manual" | string;
    "camera-controls"?: boolean | "";
    "touch-action"?: string;
    "auto-rotate"?: boolean | "";
    "shadow-intensity"?: string;
    exposure?: string;
    "interaction-prompt"?: "auto" | "when-focused" | "none";
    ar?: boolean | "";
    "ar-modes"?: string;
    "camera-orbit"?: string;
    "environment-image"?: string;
  },
  HTMLElement
>;

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": ModelViewerProps;
    }
  }
}

export {};
