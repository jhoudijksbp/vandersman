import React, { useState } from "react";
import PageOne from "./pages/PageOne";
import PageTwo from "./pages/PageTwo";

function App() {
  const [tab, setTab] = useState("one");

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Mijn Amplify App</h1>
      <div style={{ marginBottom: "1rem" }}>
        <button onClick={() => setTab("one")}>Page One</button>
        <button onClick={() => setTab("two")}>Page Two</button>
      </div>
      {tab === "one" ? <PageOne /> : <PageTwo />}
    </div>
  );
}

export default App;
