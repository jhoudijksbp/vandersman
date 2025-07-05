// App.js
import React, { useState, useEffect } from "react";
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
import { triggerDataJobs } from "./graphql/queries";
import { generateClient } from "aws-amplify/api";

function NavigationTabs({ onRefresh }) {
  const location = useLocation();
  const current = location.pathname;

  const buttonClass = (isActive) =>
    `px-4 py-2 rounded-lg font-medium shadow ${
      isActive
        ? "bg-[rgb(113,148,48)] text-white"
        : "bg-gray-100 text-gray-800"
    }`;

  return (
    <div className="flex justify-center gap-4 mb-4 flex-wrap">
      <Link to="/edit">
        <button className={buttonClass(current === "/edit")}>Werkbonnen</button>
      </Link>
      <Link to="/add">
        <button className={buttonClass(current === "/add")}>Werkbon aanmaken</button>
      </Link>
      <button
        onClick={onRefresh}
        className="px-4 py-2 rounded-lg font-medium shadow bg-gray-100 text-gray-800 hover:opacity-90"
      >
        Data verversen
      </button>
    </div>
  );
}

function WerkbonApp() {
  const client = generateClient({ authMode: "userPool" });
  const [statusMessage, setStatusMessage] = useState(null);
  const [statusType, setStatusType] = useState("success");
  const [refreshToken, setRefreshToken] = useState(Date.now());

  useEffect(() => {
    if (statusMessage) {
      const timeout = setTimeout(() => {
        setStatusMessage(null);
      }, 10000);
      return () => clearTimeout(timeout);
    }
  }, [statusMessage]);

  const handleTriggerJobs = async () => {
    setStatusType("info");
    setStatusMessage("⏳ Proces gestart. Wachten op bevestiging van backend...");

    try {
      const result = await client.graphql({ query: triggerDataJobs });
      const data = result.data;
      const messages = [];

      if (data?.triggerGetCognitoJob) {
        const status = data.triggerGetCognitoJob.status;
        const icon = status === "OK" ? "✅" : "❌";
        messages.push(`${icon} [Cognito] ${status}: ${data.triggerGetCognitoJob.message}`);
      }

      if (data?.triggerRomsplompDataJob) {
        const status = data.triggerRomsplompDataJob.status;
        const icon = status === "OK" ? "✅" : "❌";
        messages.push(`${icon} [Rompslomp] ${status}: ${data.triggerRomsplompDataJob.message}`);
      }

      const hasError =
        data.triggerGetCognitoJob.status !== "OK" ||
        data.triggerRomsplompDataJob.status !== "OK";

      setStatusType(hasError ? "error" : "success");
      setStatusMessage(messages.join("\n"));

      if (!hasError) {
        setRefreshToken(Date.now()); // triggert herladen in Add/Edit
      }
    } catch (error) {
      console.error("Fout bij verversen:", error);
      setStatusType("error");
      setStatusMessage("❌ Fout bij uitvoeren van de jobs.");
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-12">
      <h1 className="text-2xl font-bold mb-6 text-center text-[rgb(113,148,48)]">
        Jordy van der Sman Werkbon APP
      </h1>

      <NavigationTabs onRefresh={handleTriggerJobs} />

      {statusMessage && (
        <div
          className={`mb-4 p-3 rounded border text-sm font-medium max-w-4xl mx-auto whitespace-pre-line ${
            statusType === "success"
              ? "bg-green-100 text-green-800 border-green-300"
              : statusType === "error"
              ? "bg-red-100 text-red-800 border-red-300"
              : "bg-blue-100 text-blue-800 border-blue-300"
          }`}
        >
          {statusMessage.split("\n").map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <Routes>
          <Route path="/edit" element={<PageEdit refreshToken={refreshToken} />} />
          <Route path="/add" element={<PageAdd refreshToken={refreshToken} />} />
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
