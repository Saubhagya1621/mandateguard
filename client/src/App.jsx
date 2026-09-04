import { useState } from "react";
import Sidebar from "./components/Sidebar";
import MandateList from "./components/MandateList";
import MandateDetail from "./components/MandateDetail";
import ThemeToggle from "./components/ThemeToggle";
import OverviewPage from "./components/OverviewPage";
import AuditLogPage from "./components/AuditLogPage";

function App() {
  const [activeSection, setActiveSection] = useState("overview");
  const [selectedMandateId, setSelectedMandateId] = useState(null);

  function handleNavigate(section) {
    setActiveSection(section);
    setSelectedMandateId(null);
  }

  function renderSection() {
    if (activeSection === "mandates") {
      if (selectedMandateId) {
        return (
          <MandateDetail
            mandateId={selectedMandateId}
            onBack={() => setSelectedMandateId(null)}
          />
        );
      }
      return <MandateList onSelectMandate={setSelectedMandateId} />;
    }

    if (activeSection === "overview") {
      return (
        <OverviewPage
          onSelectMandate={(id) => {
            setActiveSection("mandates");
            setSelectedMandateId(id);
          }}
        />
      );
    }

    if (activeSection === "audit") {
      return (
        <AuditLogPage
          onSelectMandate={(id) => {
            setActiveSection("mandates");
            setSelectedMandateId(id);
          }}
        />
      );
    }

    if (activeSection === "snapshots") {
      return <div className="text-ink-muted font-mono text-sm">Snapshots — coming next.</div>;
    }

    if (activeSection === "rules") {
      return <div className="text-ink-muted font-mono text-sm">Compliance Rules — coming next.</div>;
    }

    return null;
  }

  return (
    <div className="min-h-screen bg-paper font-sans flex">
      <Sidebar activeSection={activeSection} onNavigate={handleNavigate} />

      <div className="flex-1">
        <div className="flex justify-end px-8 py-4">
          <ThemeToggle />
        </div>
        <main className="max-w-4xl px-8 pb-10">{renderSection()}</main>
      </div>
    </div>
  );
}

export default App;