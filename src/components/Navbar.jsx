import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">Safe Commute</Link>
            {user && (
              <div className="hidden md:flex md:ml-10 md:space-x-8">
                <Link to="/contacts" className="text-gray-700 hover:text-blue-600 transition-colors">Contacts</Link>
                <Link to="/trip" className="text-gray-700 hover:text-blue-600 transition-colors">Start Trip</Link>
                <Link to="/sos" className="text-red-600 font-semibold hover:text-red-700 transition-colors">SOS</Link>
              </div>
            )}
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center">
                <span className="mr-4 text-gray-800 font-medium">{user.name}</span>
                <button onClick={logout} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">Logout</button>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-blue-600 transition-colors">Login</Link>
                <Link to="/register" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
