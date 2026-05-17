"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  IconCheck,
  IconChevronDown,
  IconDots,
  IconFolder,
  IconMicrophone,
  IconPlayerRecord,
} from "@tabler/icons-react";

interface DatasetEntry {
  id: string;
  text: string;
}

interface DatasetData {
  total: number;
  promptsLoaded: number;
  maxRecordings: number | null;
  indonesian: DatasetEntry[];
  source: DatasetEntry[];
}

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const [data, setData] = useState<DatasetData | null>(null);
  const [openLang, setOpenLang] = useState<"indonesian" | "source" | null>(null);
  const refsByLang = useRef<Record<string, HTMLDivElement | null>>({});
  const [heightByLang, setHeightByLang] = useState<Record<string, number>>({});

  const loadDataset = useCallback(async () => {
    try {
      const res = await fetch("/api/recording/dataset");
      if (res.ok) setData(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(loadDataset, 0);
    // Refresh when navigating between pages (covers post-record updates)
    const interval = window.setInterval(loadDataset, 5000);
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [loadDataset, pathname]);

  useEffect(() => {
    if (openLang) {
      const el = refsByLang.current[openLang];
      if (el) {
        setHeightByLang((prev) => ({ ...prev, [openLang]: el.scrollHeight }));
      }
    }
  }, [openLang, data]);

  const isHomeActive = pathname === "/";
  const isSessionActive = pathname.startsWith("/session");

  const renderLangSection = (lang: "indonesian" | "source", label: string) => {
    const entries = data ? data[lang] : [];
    const total = data?.total ?? 0;
    const isOpen = openLang === lang;
    const MAX_VISIBLE = 20;
    const visibleEntries = entries.slice(0, MAX_VISIBLE);
    const remaining = entries.length - MAX_VISIBLE;

    return (
      <li>
        <button
          onClick={() => setOpenLang(isOpen ? null : lang)}
          className={`menu-item group cursor-pointer ${
            isOpen ? "menu-item-active" : "menu-item-inactive"
          } ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
        >
          <span className={isOpen ? "menu-item-icon-active" : "menu-item-icon-inactive"}>
            <IconFolder className="size-5" stroke={1.8} />
          </span>
          {(isExpanded || isHovered || isMobileOpen) && (
            <>
              <span className="menu-item-text">{label}</span>
              <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
                {entries.length}/{total}
              </span>
              <IconChevronDown
                className={`ml-1 w-4 h-4 transition-transform duration-200 ${
                  isOpen ? "rotate-180 text-brand-500" : ""
                }`}
                stroke={2}
              />
            </>
          )}
        </button>
        {(isExpanded || isHovered || isMobileOpen) && (
          <div
            ref={(el) => { refsByLang.current[lang] = el; }}
            className="overflow-hidden transition-all duration-300"
            style={{ height: isOpen ? `${heightByLang[lang] ?? 0}px` : "0px" }}
          >
            <ul className="mt-2 space-y-0.5 ml-4 max-h-72 overflow-y-auto pr-2">
              {entries.length === 0 ? (
                <li className="text-xs text-gray-400 px-3 py-2">Belum ada rekaman</li>
              ) : (
                <>
                  {visibleEntries.map((e) => (
                    <li key={e.id}>
                      <Link
                        href={`/session?id=${e.id}`}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition"
                        title={e.text}
                      >
                        <IconCheck className="w-3.5 h-3.5 text-green-500 shrink-0" stroke={2.6} />
                        <span className="font-mono shrink-0">{e.id}</span>
                        <span className="truncate text-gray-500 dark:text-gray-500">
                          {e.text}
                        </span>
                      </Link>
                    </li>
                  ))}
                  {remaining > 0 && (
                    <li className="px-3 py-1.5 text-xs text-gray-400 dark:text-gray-500">
                      +{remaining} rekaman lainnya
                    </li>
                  )}
                </>
              )}
            </ul>
          </div>
        )}
      </li>
    );
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/angky/android-chrome-192x192.png"
            alt="Angky Logo"
            width={36}
            height={36}
            className="rounded-lg"
          />
          {(isExpanded || isHovered || isMobileOpen) && (
            <span className="text-xl font-semibold text-gray-900 dark:text-white">Angky</span>
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
                {isExpanded || isHovered || isMobileOpen ? "Studio" : <IconDots className="size-5" stroke={2} />}
              </h2>
              <ul className="flex flex-col gap-1">
                <li>
                  <Link
                    href="/"
                    className={`menu-item group ${isHomeActive ? "menu-item-active" : "menu-item-inactive"}`}
                  >
                    <span className={isHomeActive ? "menu-item-icon-active" : "menu-item-icon-inactive"}>
                      <IconMicrophone className="size-5" stroke={1.8} />
                    </span>
                    {(isExpanded || isHovered || isMobileOpen) && (
                      <span className="menu-item-text">Rekaman</span>
                    )}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/session"
                    className={`menu-item group ${isSessionActive ? "menu-item-active" : "menu-item-inactive"}`}
                  >
                    <span className={isSessionActive ? "menu-item-icon-active" : "menu-item-icon-inactive"}>
                      <IconPlayerRecord className="size-5" stroke={1.8} />
                    </span>
                    {(isExpanded || isHovered || isMobileOpen) && (
                      <span className="menu-item-text">Sesi</span>
                    )}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h2 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
                {isExpanded || isHovered || isMobileOpen ? "Dataset" : <IconDots className="size-5" stroke={2} />}
              </h2>
              {(isExpanded || isHovered || isMobileOpen) && (
                <p className="mb-2 px-3 text-[11px] leading-4 text-gray-400 dark:text-gray-500">
                  Klip tersimpan memperbarui file CSV metadata di <span className="font-mono">output/</span>.
                </p>
              )}
              <ul className="flex flex-col gap-1">
                {renderLangSection("indonesian", "Bahasa Indonesia")}
                {renderLangSection("source", "Bahasa Sumber")}
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
