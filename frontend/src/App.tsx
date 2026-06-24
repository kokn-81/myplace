import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const MapPage = lazy(() => import("./pages/MapPage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdvisorDashboard = lazy(() => import("./pages/AdvisorDashboard"));

const MAPBOX_TOKEN =
  process.env.VITE_MAPBOX_TOKEN ||
  (import.meta as any).env?.VITE_MAPBOX_TOKEN ||
  (globalThis as any).VITE_MAPBOX_TOKEN ||
  "";

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--surface-page)] text-[var(--text-main)] dark:bg-stone-900 dark:text-secondary">
      <div className="h-8 w-8 rounded-full border-2 border-[var(--accent-main)] border-t-transparent animate-spin" />
    </div>
  );
}

export default function App() {
  const hasValidKey = Boolean(MAPBOX_TOKEN) && MAPBOX_TOKEN !== "YOUR_MAPBOX_TOKEN";

  if (!hasValidKey) {
    return (
      <div className="flex h-screen items-center justify-center font-sans bg-[var(--surface-page)] text-[var(--text-main)] dark:bg-stone-900 dark:text-secondary">
        <div className="max-w-xl text-center p-8 bg-[var(--surface-panel)] rounded-xl border border-[var(--border-soft)] shadow-[var(--shadow-warm)]">
          <h2 className="text-3xl font-bold mb-6">Mapbox Token Required</h2>
          <p className="mb-4">
            <strong>Step 1:</strong>{" "}
            <a
              href="https://account.mapbox.com/access-tokens/"
              target="_blank"
              rel="noopener"
              className="text-[var(--accent-main)] hover:text-[var(--accent-hover)] font-bold hover:underline"
            >
              Get a Mapbox Token
            </a>
          </p>
          <p className="mb-2"><strong>Step 2:</strong> Add your token as a secret:</p>
          <ul className="text-left leading-relaxed mb-6 bg-[var(--surface-control)] border border-[var(--border-soft)] p-4 rounded-lg text-sm text-[var(--text-muted)]">
            <li>Open <strong>Settings</strong></li>
            <li>Select <strong>Secrets</strong></li>
            <li>Type <code className="text-[var(--accent-main)] font-bold bg-[var(--surface-panel)] px-1 rounded border border-[var(--border-soft)]">VITE_MAPBOX_TOKEN</code>, press <strong>Enter</strong></li>
            <li>Paste your Mapbox token, press <strong>Enter</strong></li>
          </ul>
          <p className="text-[var(--text-muted)] text-sm">The app rebuilds automatically.</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/asesor" element={<AdvisorDashboard />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
