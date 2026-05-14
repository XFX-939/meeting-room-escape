export type ThemeMode = "light" | "dark";

type ThemeToggleProps = {
  theme: ThemeMode;
  onToggle: () => void;
};

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === "dark";

  return (
    <button
      aria-label={isDark ? "切换浅色模式" : "切换深色模式"}
      className="fixed right-4 top-4 z-50 h-11 rounded-full border border-line bg-panel/90 px-4 text-sm font-bold text-white shadow-glow backdrop-blur"
      onClick={onToggle}
      type="button"
    >
      {isDark ? "浅色模式" : "深色模式"}
    </button>
  );
}
