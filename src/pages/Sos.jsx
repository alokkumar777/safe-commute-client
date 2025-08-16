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
    <div style={{ padding: 16 }}>
      <h2>Emergency SOS</h2>
      <button onClick={trigger} style={{ fontSize: 18, padding: "12px 16px" }}>
        🔴 Send SOS
      </button>
      <p>{status}</p>
    </div>
  );
}
