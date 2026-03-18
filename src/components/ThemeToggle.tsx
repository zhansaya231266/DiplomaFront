import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { useTheme } from "./context/ThemeContext";

interface ThemeToggleProps {
  variant?: "full" | "minimal";
}

export const ThemeToggle = ({ variant = "minimal" }: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  // Вариант для входа (только иконка)
  if (variant === "minimal") {
    return (
      <button
        onClick={toggleTheme}
        className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:scale-110 transition-all shadow-sm"
        aria-label="Toggle Theme"
      >
        {isDark ? (
          <SunIcon className="h-5 w-5 text-yellow-500" />
        ) : (
          <MoonIcon className="h-5 w-5 text-gray-600" />
        )}
      </button>
    );
  }

  // Вариант для сайдбара (с текстом)
  return (
    <button
      onClick={toggleTheme}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group"
    >
      <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 group-hover:scale-110 transition-transform">
        {isDark ? (
          <SunIcon className="h-5 w-5 text-yellow-500" />
        ) : (
          <MoonIcon className="h-5 w-5" />
        )}
      </div>
      <span className="text-[14px] font-bold">
        {isDark ? "Light Mode" : "Dark Mode"}
      </span>
    </button>
  );
};
