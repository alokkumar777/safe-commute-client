import { useEffect, useMemo, useRef, useState } from "react";
import http from "../api/http";
import {
  GoogleMap,
  useJsApiLoader,
  DirectionsRenderer,
} from "@react-google-maps/api";

const containerStyle = { width: "100%", height: "380px", borderRadius: 8 };

export default function TripStart() {
  const [origin, setOrigin] = useState({ lat: "", lng: "", label: "" });
  const [destination, setDestination] = useState({
    lat: "",
    lng: "",
    label: "",
  });
  const [trip, setTrip] = useState(null);
  const [err, setErr] = useState("");
  const [directions, setDirections] = useState(null);
  const watchId = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const center = useMemo(() => ({ lat: 28.6139, lng: 77.209 }), []);

  // build route preview
  const previewRoute = async () => {
    setDirections(null);
    setErr("");
    try {
      const o = { lat: Number(origin.lat), lng: Number(origin.lng) };
      const d = { lat: Number(destination.lat), lng: Number(destination.lng) };
      const ds = new google.maps.DirectionsService();
      const res = await ds.route({
        origin: o,
        destination: d,
        travelMode: google.maps.TravelMode.DRIVING,
      });
      setDirections(res);
    } catch (e) {
      setErr("Could not build route. Check coordinates.");
    }
  };

  const start = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      if (!directions) {
        await previewRoute();
      }
      const overview =
        directions?.routes?.[0]?.overview_polyline?.toJSON?.().points ||
        directions?.routes?.[0]?.overview_polyline?.encodedPath ||
        directions?.routes?.[0]?.overview_polyline;

      const payload = {
        origin: {
          lat: Number(origin.lat),
          lng: Number(origin.lng),
          label: origin.label,
        },
        destination: {
          lat: Number(destination.lat),
          lng: Number(destination.lng),
          label: destination.label,
        },
        routePolyline:
          typeof overview === "string" ? overview : overview?.points || "",
      };
      const { data } = await http.post("/trips/start", payload);
      setTrip(data.trip);

      // Start live location streaming
      if (navigator.geolocation) {
        watchId.current = navigator.geolocation.watchPosition(
          async (pos) => {
            const lat = pos.coords.latitude,
              lng = pos.coords.longitude;
            try {
              await http.patch(`/trips/${data.trip._id}/location`, {
                lat,
                lng,
                ts: new Date().toISOString(),
              });
            } catch (_) {}
          },
          () => {},
          { enableHighAccuracy: true, maximumAge: 5000, timeout: 8000 }
        );
      }
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to start trip");
    }
  };

  const complete = async () => {
    if (!trip) return;
    try {
      await http.patch(`/trips/${trip._id}/complete`);
      if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
      setTrip(null);
    } catch (_) {}
  };

  useEffect(
    () => () => {
      if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    },
    []
  );

  return (
    <div style={{ padding: 16 }}>
      <h2>Start Trip</h2>
      <form onSubmit={start} style={{ display: "grid", gap: 8, maxWidth: 600 }}>
        <fieldset>
          <legend>Origin</legend>
          <input
            placeholder="Lat"
            value={origin.lat}
            onChange={(e) => setOrigin({ ...origin, lat: e.target.value })}
          />
          <input
            placeholder="Lng"
            value={origin.lng}
            onChange={(e) => setOrigin({ ...origin, lng: e.target.value })}
          />
          <input
            placeholder="Label"
            value={origin.label}
            onChange={(e) => setOrigin({ ...origin, label: e.target.value })}
          />
        </fieldset>
        <fieldset>
          <legend>Destination</legend>
          <input
            placeholder="Lat"
            value={destination.lat}
            onChange={(e) =>
              setDestination({ ...destination, lat: e.target.value })
            }
          />
          <input
            placeholder="Lng"
            value={destination.lng}
            onChange={(e) =>
              setDestination({ ...destination, lng: e.target.value })
            }
          />
          <input
            placeholder="Label"
            value={destination.label}
            onChange={(e) =>
              setDestination({ ...destination, label: e.target.value })
            }
          />
        </fieldset>

        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={previewRoute} disabled={!isLoaded}>
            Preview Route
          </button>
          <button type="submit" disabled={!isLoaded}>
            Start
          </button>
        </div>
        {err && <p style={{ color: "crimson" }}>{err}</p>}
      </form>

      <div style={{ marginTop: 12 }}>
        {isLoaded && (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={10}
          >
            {directions && <DirectionsRenderer directions={directions} />}
          </GoogleMap>
        )}
      </div>

      {trip && (
        <div style={{ marginTop: 16 }}>
          <p>
            Trip active: <code>{trip._id}</code>
          </p>
          <button onClick={complete}>Complete Trip</button>
        </div>
      )}
    </div>
  );
}
