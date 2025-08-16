import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav
      style={{
        display: "flex",
        gap: 12,
        padding: "10px 16px",
        borderBottom: "1px solid #eee",
      }}
    >
      <Link to="/">Safe Commute</Link>
      {user && (
        <>
          <Link to="/contacts">Contacts</Link>
          <Link to="/trip">Start Trip</Link>
          <Link to="/sos">SOS</Link>
        </>
      )}
      <div style={{ marginLeft: "auto" }}>
        {user ? (
          <>
            <span style={{ marginRight: 12 }}>{user.name}</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <span> · </span>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
