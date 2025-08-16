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
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Start Trip</h2>
      <form onSubmit={start} className="grid gap-6 max-w-2xl bg-white p-6 rounded-lg shadow-md">
        <fieldset className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-lg">
          <legend className="text-xl font-semibold mb-2 text-gray-700 px-2">Origin</legend>
          <input
            placeholder="Lat"
            value={origin.lat}
            onChange={(e) => setOrigin({ ...origin, lat: e.target.value })}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            placeholder="Lng"
            value={origin.lng}
            onChange={(e) => setOrigin({ ...origin, lng: e.target.value })}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            placeholder="Label"
            value={origin.label}
            onChange={(e) => setOrigin({ ...origin, label: e.target.value })}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </fieldset>
        <fieldset className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-lg">
          <legend className="text-xl font-semibold mb-2 text-gray-700 px-2">Destination</legend>
          <input
            placeholder="Lat"
            value={destination.lat}
            onChange={(e) =>
              setDestination({ ...destination, lat: e.target.value })
            }
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            placeholder="Lng"
            value={destination.lng}
            onChange={(e) =>
              setDestination({ ...destination, lng: e.target.value })
            }
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            placeholder="Label"
            value={destination.label}
            onChange={(e) =>
              setDestination({ ...destination, label: e.target.value })
            }
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </fieldset>

        <div className="flex gap-4 mt-4">
          <button type="button" onClick={previewRoute} disabled={!isLoaded} className="flex-1 bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition-colors disabled:bg-gray-400">
            Preview Route
          </button>
          <button type="submit" disabled={!isLoaded} className="flex-1 bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400">
            Start
          </button>
        </div>
        {err && <p className="text-red-500 text-sm mt-2">{err}</p>}
      </form>

      <div className="mt-8 rounded-lg shadow-md overflow-hidden">
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
        <div className="mt-8 p-6 bg-green-100 border border-green-200 rounded-lg shadow-md">
          <p className="text-green-800 font-semibold">
            Trip active: <code className="bg-white p-1 rounded">{trip._id}</code>
          </p>
          <button onClick={complete} className="mt-4 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors">Complete Trip</button>
        </div>
      )}
    </div>
  );
}
