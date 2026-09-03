import { useEffect, useState } from "react";

function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark((prev) => !prev)}
      className="text-[11px] font-mono uppercase tracking-wider text-ink-muted border border-line rounded px-3 py-2 hover:border-ink hover:text-ink transition"
    >
      {isDark ? "Light Mode" : "Dark Mode"}
    </button>
  );
}

export default ThemeToggle;