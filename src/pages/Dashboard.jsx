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
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      <h2 className="text-4xl font-bold mb-6 text-gray-800">Welcome to Safe Commute</h2>
      <div className="flex gap-4 flex-wrap mb-6">
        <button onClick={enablePush} className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors shadow-md">Enable Push</button>
        <button onClick={disablePush} className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors shadow-md">Disable Push</button>
        <button onClick={testPush} className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors shadow-md">Send Test Push</button>
      </div>
      {msg && <p className="text-blue-700 bg-blue-100 p-4 rounded-lg">{msg}</p>}
      <p className="text-gray-700 text-lg mt-4">Start a trip to auto-share your route, or add trusted contacts.</p>
    </div>
  );
}
