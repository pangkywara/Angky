import { NextResponse } from "next/server";
import { networkInterfaces } from "os";

export async function GET() {
  const nets = networkInterfaces();
  let ip = "localhost";

  for (const name of Object.keys(nets)) {
    for (const net of nets[name] ?? []) {
      // Skip internal and non-IPv4 addresses
      if (!net.internal && net.family === "IPv4") {
        ip = net.address;
        break;
      }
    }
    if (ip !== "localhost") break;
  }

  // Detect port from environment or default
  const port = process.env.PORT || "3000";
  // Next.js --experimental-https serves over HTTPS
  const protocol = "https";

  return NextResponse.json({ ip, port: Number(port), protocol });
}
