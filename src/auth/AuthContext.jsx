import { createContext, useContext, useEffect, useMemo, useState } from "react";
import http from "../api/http";
import { io as ioClient } from "socket.io-client";
import { registerServiceWorker, subscribePush } from "../push";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);

    useEffect(() => {
      const raw = localStorage.getItem("user");
      const user = raw ? JSON.parse(raw) : null;
      if (!user) return;
      // connect socket
      const s = ioClient(import.meta.env.VITE_API_URL.replace("/api", ""), {
        transports: ["websocket"],
        auth: { token: localStorage.getItem("token") },
      });
      s.on("connect", () => {
        s.emit("identify", user.id || user._id || user.id); // tell server which user room to join
      });
      setSocket(s);
      return () => s.disconnect();
    }, []);

    const login = async (email, password) => {
      setLoading(true);
      try {
        const { data } = await http.post("/auth/login", { email, password });
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);

        // Try registering SW + subscribing (best-effort)
        try {
          const reg = await registerServiceWorker();
          await subscribePush(reg);
        } catch (e) {
          /* ignore if denied or unsupported */
        }

        return { ok: true };
      } finally {
        setLoading(false);
      }
    };

  const register = async (payload) => {
    setLoading(true);
    try {
      const { data } = await http.post("/auth/register", payload);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      return { ok: true };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, login, register, logout, socket }),
    [user, loading, socket]
  );
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
