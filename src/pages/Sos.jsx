import { useState } from "react";
import http from "../api/http";

export default function Sos() {
  const [status, setStatus] = useState("");

  const trigger = async () => {
    setStatus("Sending…");
    try {
      // try to get browser location
      let lat, lng;
      try {
        const pos = await new Promise((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej)
        );
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch (_) {
        /* ignore */
      }

      await http.post("/sos", { lat, lng });
      setStatus("SOS triggered.");
    } catch (e) {
      setStatus(e?.response?.data?.message || "Failed to send SOS");
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen flex flex-col items-center justify-center text-center">
      <h2 className="text-4xl font-bold mb-6 text-gray-800">Emergency SOS</h2>
      <button onClick={trigger} className="bg-red-600 text-white font-bold py-6 px-10 rounded-full shadow-lg hover:bg-red-700 transition-transform transform hover:scale-105">
        <span className="text-2xl">🔴 Send SOS</span>
      </button>
      {status && <p className="mt-6 text-lg text-blue-700 bg-blue-100 p-4 rounded-lg">{status}</p>}
    </div>
  );
}
