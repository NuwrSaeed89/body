type StarRatingDisplayProps = {
  average: number;
  size?: "sm" | "md";
  className?: string;
};

function starFillForIndex(average: number, index: number): 0 | 0.5 | 1 {
  const threshold = index + 1;
  if (average >= threshold) return 1;
  if (average >= threshold - 0.5) return 0.5;
  return 0;
}

export function StarRatingDisplay({
  average,
  size = "sm",
  className = "",
}: StarRatingDisplayProps) {
  const iconSize = size === "md" ? "text-[20px]" : "text-[16px]";

  return (
    <div
      className={`flex items-center gap-0.5 text-primary ${className}`}
      aria-hidden
    >
      {Array.from({ length: 5 }).map((_, index) => {
        const fill = starFillForIndex(average, index);
        return (
          <span
            key={index}
            className={`material-symbols-outlined ${iconSize}`}
            style={{
              fontVariationSettings: fill === 1 ? "'FILL' 1" : "'FILL' 0",
              opacity: fill === 0 ? 0.28 : 1,
            }}
          >
            {fill === 0.5 ? "star_half" : "star"}
          </span>
        );
      })}
    </div>
  );
}
