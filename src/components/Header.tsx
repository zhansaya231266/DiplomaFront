import { Link } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

export const Header = () => {
  return (
    <header className="bg-white dark:bg-gray-900 sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800 transition-colors">
      <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo - клик по нему вернет на главную */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">
            EMP
          </div>
          <span className="text-xl font-semibold text-gray-900 dark:text-white">
            Smart EMP
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          {/* Ссылка на логин */}
          <Link
            to="/login"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            Sign In
          </Link>

          <Link
            to="/register-org"
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition shadow-sm"
          >
            Get Started
          </Link>
        </div>
      </nav>
    </header>
  );
};
