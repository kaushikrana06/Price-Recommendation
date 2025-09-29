import React from "react";
import { Link } from "react-router-dom";

export default function AppFooter() {
  const year = new Date().getFullYear();
  const version = import.meta.env.VITE_APP_VERSION ?? "v1.0";

  return (
    <footer className="mt-10">
      {/* subtle divider */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8 lg:px-10">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4 py-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="font-medium text-gray-700">Pricing Intel</span>
            <span className="text-gray-400">• {version}</span>
          </div>

          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-gray-500">
            <Link to="/" className="hover:text-gray-700">Dashboard</Link>
            <Link to="/compare" className="hover:text-gray-700">Compare</Link>
            <Link to="/doc" className="hover:text-gray-700">Doc</Link>
            <a
              href="https://github.com/kaushikrana06?tab=repositories"
              target="_blank"
              rel="noreferrer"
              className="hover:text-gray-700"
            >
              GitHub
            </a>
            <a
              href="#privacy"
              className="hover:text-gray-700"
              onClick={(e) => e.preventDefault()}
            >
              Privacy
            </a>
          </nav>

          <div className="text-gray-400">
            © {year} Pricing Intel. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
