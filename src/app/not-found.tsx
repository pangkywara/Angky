import { IconMicrophoneOff } from "@/components/icons";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-gray-50 p-6 text-center dark:bg-gray-900">
      <div className="flex size-12 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/10">
        <IconMicrophoneOff className="size-7" stroke={1.8} />
      </div>
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">Halaman tidak ditemukan</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Angky hanya menyediakan studio rekaman dataset.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
      >
        Kembali ke Studio
      </Link>
    </div>
  );
}
