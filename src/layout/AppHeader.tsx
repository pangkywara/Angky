"use client";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import { useSidebar } from "@/context/SidebarContext";
import { IconMenu2, IconX } from "@/components/icons";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const AppHeader: React.FC = () => {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  return (
    <header className="sticky top-0 flex w-full bg-white border-b border-gray-200 z-99999 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between w-full px-3 py-3 lg:px-6 lg:py-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            className="flex items-center justify-center w-10 h-10 text-gray-500 border border-gray-200 rounded-lg z-99999 dark:border-gray-800 dark:text-gray-400 lg:h-11 lg:w-11 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
            onClick={handleToggle}
            aria-label="Buka tutup sidebar"
          >
            {isMobileOpen ? (
              <IconX className="size-5" stroke={2} />
            ) : (
              <IconMenu2 className="size-5" stroke={2} />
            )}
          </button>

          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <Image
              src="/angky/android-chrome-192x192.png"
              alt="Angky Logo"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="text-lg font-semibold text-gray-900 dark:text-white">Angky</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggleButton />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
