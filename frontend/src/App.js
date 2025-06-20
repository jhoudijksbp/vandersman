import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PageOne from "./pages/EditWerkbon";
import PageTwo from "./pages/AddWerkbon";
import Login from "./Login";
import PrivateRoute from "./PrivateRoute";
import LogoutButton from "./components/LogoutButton";

function WerkbonApp() {
  const [tab, setTab] = useState("one");

  return (
    
    <div className="min-h-screen bg-white p-4 md:p-12">
      <h1 className="text-2xl font-bold mb-6 text-center text-[rgb(113,148,48)]">
        Jordy van der Sman Werkbon APP
      </h1>
      <div className="flex justify-center gap-4 mb-6 flex-wrap">
        <button
          onClick={() => setTab("one")}
          className={`px-4 py-2 rounded-lg font-medium shadow ${
            tab === "one" ? "bg-[rgb(113,148,48)] text-white" : "bg-gray-100 text-gray-800"
          }`}
        >
          Werkbonnen
        </button>
        <button
          onClick={() => setTab("two")}
          className={`px-4 py-2 rounded-lg font-medium shadow ${
            tab === "two" ? "bg-[rgb(113,148,48)] text-white" : "bg-gray-100 text-gray-800"
          }`}
        >
          Werkbon aanmaken
        </button>
      </div>
      <div className="max-w-4xl mx-auto">
        {tab === "one" ? <PageOne /> : <PageTwo />}
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
        <Route
          path="/"
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
