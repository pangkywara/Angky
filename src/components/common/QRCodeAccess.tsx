"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import ComponentCard from "@/components/common/ComponentCard";
import { IconDeviceMobile, IconCopy, IconCheck } from "@tabler/icons-react";

interface NetworkInfo {
  ip: string;
  port: number;
  protocol: string;
}

export default function QRCodeAccess() {
  const [info, setInfo] = useState<NetworkInfo | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/network-info")
      .then((r) => r.json())
      .then((data: NetworkInfo) => {
        setInfo(data);
        const url = `${data.protocol}://${data.ip}:${data.port}/session`;
        QRCode.toDataURL(url, {
          width: 200,
          margin: 2,
          color: { dark: "#1f2937", light: "#ffffff" },
        }).then(setQrDataUrl);
      })
      .catch(() => { });
  }, []);

  const url = info ? `${info.protocol}://${info.ip}:${info.port}/session` : "";

  function copyUrl() {
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // Hide on mobile — you're already on the phone
  // Show only on wider screens (md+)
  if (!info || !qrDataUrl) return null;

  return (
    <div className="hidden md:block">
      <ComponentCard
        title="Rekam dari HP"
        desc="Pindai kode QR untuk membuka studio rekaman di ponsel Anda"
      >
        <div className="flex items-start gap-6">
          {/* QR Code */}
          <div className="shrink-0 rounded-xl border border-gray-200 dark:border-gray-700 bg-white p-2">
            <img
              src={qrDataUrl}
              alt="QR Code untuk akses studio"
              width={160}
              height={160}
              className="rounded-lg"
            />
          </div>

          {/* Info */}
          <div className="flex flex-col gap-3 min-w-0">
            <div className="flex items-center gap-2 text-brand-500">
              <IconDeviceMobile className="size-5 shrink-0" stroke={1.8} />
              <span className="text-sm font-medium">Akses dari Ponsel</span>
            </div>

            <ol className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
              <li>1. Pastikan HP dan laptop terhubung ke <strong className="text-gray-700 dark:text-gray-300">WiFi yang sama</strong></li>
              <li>2. Pindai kode QR dengan kamera HP</li>
              <li>3. Terima sertifikat HTTPS saat diminta</li>
              <li>4. Izinkan akses mikrofon</li>
            </ol>

            {/* URL display + copy */}
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 truncate rounded-lg bg-gray-100 dark:bg-gray-800 px-3 py-2 text-xs text-gray-600 dark:text-gray-400">
                {url}
              </code>
              <button
                onClick={copyUrl}
                className="flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                {copied ? (
                  <>
                    <IconCheck className="size-3.5 text-green-500" stroke={2} />
                    Tersalin
                  </>
                ) : (
                  <>
                    <IconCopy className="size-3.5" stroke={1.8} />
                    Salin
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-500">
              Sertifikat self-signed — tekan &quot;Lanjutkan&quot; di peringatan browser HP. (Nantinya akan muncul tombol Back to safety dan Advanced, klik Advanced lalu klik Proceed to [IP_ADDRESS] (unsafe))
            </p>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}
