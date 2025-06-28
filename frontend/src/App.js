import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
} from "react-router-dom";
import PageEdit from "./pages/EditWerkbon";
import PageAdd from "./pages/AddWerkbon";
import Login from "./Login";
import PrivateRoute from "./PrivateRoute";
import LogoutButton from "./components/LogoutButton";

function NavigationTabs() {
  const location = useLocation();
  const current = location.pathname;

  return (
    <div className="flex justify-center gap-4 mb-6 flex-wrap">
      <Link to="/edit">
        <button
          className={`px-4 py-2 rounded-lg font-medium shadow ${
            current === "/edit"
              ? "bg-[rgb(113,148,48)] text-white"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          Werkbonnen
        </button>
      </Link>
      <Link to="/add">
        <button
          className={`px-4 py-2 rounded-lg font-medium shadow ${
            current === "/add"
              ? "bg-[rgb(113,148,48)] text-white"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          Werkbon aanmaken
        </button>
      </Link>
    </div>
  );
}

function WerkbonApp() {
  return (
    <div className="min-h-screen bg-white p-4 md:p-12">
      <h1 className="text-2xl font-bold mb-6 text-center text-[rgb(113,148,48)]">
        Jordy van der Sman Werkbon APP
      </h1>

      <NavigationTabs />

      <div className="max-w-4xl mx-auto">
        <Routes>
          <Route path="/edit" element={<PageEdit />} />
          <Route path="/add" element={<PageAdd />} />
        </Routes>
      </div>

      <div className="mt-8 text-center">
        <LogoutButton />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/edit" replace />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <WerkbonApp />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}
