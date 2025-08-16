import { useState } from "react";
import { registerServiceWorker, subscribePush, unsubscribePush } from "../push";
import http from "../api/http";

export default function Dashboard() {
  const [msg, setMsg] = useState("");
  const testPush = async () => {
    try {
      await http.post("/push/test");
      setMsg("Test push sent (check notifications)");
    } catch {
      setMsg("Failed to send test");
    }
  };
  const enablePush = async () => {
    try {
      const reg = await registerServiceWorker();
      await subscribePush(reg);
      setMsg("Push enabled");
    } catch (e) {
      setMsg(e.message || "Push failed");
    }
  };
  const disablePush = async () => {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) await unsubscribePush(reg);
      setMsg("Push disabled");
    } catch {
      setMsg("Unsubscribe failed");
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Welcome to Safe Commute</h2>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={enablePush}>Enable Push</button>
        <button onClick={disablePush}>Disable Push</button>
        <button onClick={testPush}>Send Test Push</button>
      </div>
      {msg && <p>{msg}</p>}
      <p>Start a trip to auto-share your route, or add trusted contacts.</p>
    </div>
  );
}
