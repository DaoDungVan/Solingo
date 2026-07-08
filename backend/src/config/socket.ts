import type { Server as HttpServer } from "http";
import { Server as SocketServer, type Socket } from "socket.io";
import jwt from "jsonwebtoken";

import { env } from "./env";
import { pool } from "./db";

// TN5 — ghép cặp ngẫu nhiên 2 người dùng để chat luyện tiếng.
// Matchmaking đơn giản trong bộ nhớ: 1 slot chờ; có người thứ 2 → ghép phòng.
let io: SocketServer | null = null;
let waiting: Socket | null = null;

interface SocketData {
  userId?: string;
  name?: string;
  room?: string;
  partnerId?: string;
}

function leaveRoom(socket: Socket) {
  const data = socket.data as SocketData;
  if (waiting?.id === socket.id) waiting = null;
  if (data.room) {
    socket.to(data.room).emit("partner:left");
    socket.leave(data.room);
    // dọn state phía partner
    const partner = data.partnerId ? io?.sockets.sockets.get(data.partnerId) : null;
    if (partner) {
      const pd = partner.data as SocketData;
      pd.room = undefined;
      pd.partnerId = undefined;
    }
    data.room = undefined;
    data.partnerId = undefined;
  }
}

function tryMatch(socket: Socket) {
  leaveRoom(socket); // rời phòng cũ nếu đang có (skip)
  if (waiting && waiting.id !== socket.id && waiting.connected) {
    const a = waiting;
    const b = socket;
    waiting = null;
    const room = `room:${a.id}:${b.id}`;
    a.join(room);
    b.join(room);
    (a.data as SocketData).room = room;
    (a.data as SocketData).partnerId = b.id;
    (b.data as SocketData).room = room;
    (b.data as SocketData).partnerId = a.id;
    a.emit("matched", { partner: (b.data as SocketData).name });
    b.emit("matched", { partner: (a.data as SocketData).name });
  } else {
    waiting = socket;
    socket.emit("waiting");
  }
}

export function initSocketServer(httpServer: HttpServer): SocketServer {
  io = new SocketServer(httpServer, { cors: { origin: "*" } });

  // Xác thực bằng JWT ở handshake.
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) return next(new Error("Thiếu token"));
      const decoded = jwt.verify(token, env.jwtSecret) as { id: string };
      const r = await pool.query(
        `SELECT p.display_name FROM profiles p WHERE p.user_id = $1`,
        [decoded.id]
      );
      (socket.data as SocketData).userId = decoded.id;
      (socket.data as SocketData).name = r.rows[0]?.display_name || "Người học";
      next();
    } catch {
      next(new Error("Token không hợp lệ"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("find", () => tryMatch(socket));

    socket.on("chat:message", ({ text }: { text?: string }) => {
      const data = socket.data as SocketData;
      if (data.room && text) {
        socket.to(data.room).emit("chat:message", { text, from: data.name });
      }
    });

    socket.on("chat:typing", () => {
      const data = socket.data as SocketData;
      if (data.room) socket.to(data.room).emit("chat:typing");
    });

    socket.on("leave", () => leaveRoom(socket));
    socket.on("disconnect", () => leaveRoom(socket));
  });

  console.log("[socket] matchmaking (TN5) sẵn sàng");
  return io;
}

export function getIo(): SocketServer {
  if (!io) throw new Error("[socket] chưa khởi tạo. Gọi initSocketServer trước.");
  return io;
}
