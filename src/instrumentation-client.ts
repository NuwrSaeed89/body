function isThirdPartySource(source: string | undefined | null): boolean {
  if (!source) return false;
  return (
    source.startsWith("blob:") ||
    source.includes("chrome-extension://") ||
    source.includes("moz-extension://") ||
    source.includes("safari-extension://")
  );
}

function isThirdPartyStack(stack: string | undefined): boolean {
  if (!stack) return false;
  return /blob:|chrome-extension:|moz-extension:|safari-extension:/.test(stack);
}

if (process.env.NODE_ENV === "development") {
  window.addEventListener(
    "error",
    (event) => {
      if (isThirdPartySource(event.filename)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true,
  );

  window.addEventListener(
    "unhandledrejection",
    (event) => {
      const reason = event.reason;
      const stack = reason instanceof Error ? reason.stack : String(reason);
      if (isThirdPartyStack(stack)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true,
  );
}
