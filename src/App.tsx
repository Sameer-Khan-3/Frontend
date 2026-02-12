import { useEffect, useState } from "react";

const BACKEND_URL = "http://localhost:4000";

function App() {
  const [status, setStatus] = useState("Checking backend...");

  useEffect(() => {
    fetch(`${BACKEND_URL}/`)
      .then((res) => res.json())
      .then((data) => {
        setStatus(data.message);
      })
      .catch(() => {
        setStatus("❌ Backend not reachable");
      });
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Frontend ↔ Backend Integration</h1>
      <p>{status}</p>
    </div>
  );
}

export default App;
