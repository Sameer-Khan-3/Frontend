import { useEffect, useState } from "react";

const BACKEND =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

function App() {
  const [status, setStatus] = useState<string>("Checking backend...");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch(`${BACKEND}/health`);

        if (!response.ok) {
          throw new Error("Backend not responding");
        }

        const data = await response.json();
        setStatus(`✅ Backend Status: ${data.status}`);
      } catch (error) {
        console.error(error);
        setStatus("❌ Backend not reachable");
      } finally {
        setLoading(false);
      }
    };

    checkBackend();
  }, []);

  return (
    <div style={styles.container}>
      <h1>IAM System Frontend</h1>

      <p>
        Backend URL: <strong>{BACKEND}</strong>
      </p>

      {loading ? <p>Checking connection...</p> : <p>{status}</p>}
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "system-ui",
    padding: "40px",
    textAlign: "center" as const,
  },
};

export default App;
