import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import RequireAuth from "./auth/RequireAuth";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Contacts from "./pages/Contacts";
import TripStart from "./pages/TripStart";
import Sos from "./pages/Sos";
import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route element={<RequireAuth />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/trip" element={<TripStart />} />
            <Route path="/sos" element={<Sos />} />
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="*"
            element={<div style={{ padding: 16 }}>Not Found</div>}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
