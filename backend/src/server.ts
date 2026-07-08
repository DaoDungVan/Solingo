import http from "http";
import dns from "dns";

import app from "./app";
import { env } from "./config/env";
import "./config/db";
import { initSocketServer } from "./config/socket";

// Ưu tiên IPv4 — tránh lỗi kết nối Supabase trên một số mạng (giữ pattern repo cũ).
dns.setDefaultResultOrder("ipv4first");

const server = http.createServer(app);
initSocketServer(server);

server.listen(env.port, () => {
  console.log(`[server] Solingo backend chạy trên PORT ${env.port} (${env.nodeEnv})`);
});
