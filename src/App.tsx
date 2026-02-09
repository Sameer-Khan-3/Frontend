import React, { useEffect, useState } from "react";

const BACKEND = "http://localhost:4000";

export default function App() {
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${BACKEND}/` , { method: "GET" });
        setConnected(res.ok);
      } catch (e) {
        setConnected(false);
      }
    };
    check();
  }, []);

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", padding: 24 }}>
      <h1 style={{ fontSize: 20, marginBottom: 8 }}>Backend Connectivity Demo</h1>
      <div style={{ padding: 12, borderRadius: 6, background: "#f5f5f5", display: "inline-block" }}>
        {connected === null && <span>Checking backend…</span>}
        {connected === true && <span style={{ color: "green" }}>Backend is connected</span>}
        {connected === false && <span style={{ color: "red" }}>Backend is NOT connected</span>}
      </div>
    </div>
  );
}
