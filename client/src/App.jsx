import { useState } from "react";
import MandateList from "./components/MandateList";
import MandateDetail from "./components/MandateDetail";
import ThemeToggle from "./components/ThemeToggle";

function App() {
  const [selectedMandateId, setSelectedMandateId] = useState(null);

  return (
    <div className="min-h-screen bg-paper font-sans">
      <header className="border-b border-line bg-card">
        <div className="max-w-5xl mx-auto px-8 py-6 flex items-baseline justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink tracking-tight">
              MandateGuard
            </h1>
            <p className="text-xs text-ink-muted font-mono mt-0.5 uppercase tracking-wider">
              Compliance-first retry ledger
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-10">
        {selectedMandateId ? (
          <MandateDetail
            mandateId={selectedMandateId}
            onBack={() => setSelectedMandateId(null)}
          />
        ) : (
          <MandateList onSelectMandate={setSelectedMandateId} />
        )}
      </main>
    </div>
  );
}

export default App;