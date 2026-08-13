const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export default function App() {
  return (
    <main className="shell">
      <h1>MovieFlex</h1>
      <p>Phase 1 skeleton — client package is ready.</p>
      <p className="meta">API base: {apiBaseUrl}</p>
    </main>
  );
}
