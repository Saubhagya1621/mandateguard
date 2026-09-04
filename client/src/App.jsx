import { useState } from "react";
import Sidebar from "./components/Sidebar";
import MandateList from "./components/MandateList";
import MandateDetail from "./components/MandateDetail";
import ThemeToggle from "./components/ThemeToggle";
import OverviewPage from "./components/OverviewPage";
import AuditLogPage from "./components/AuditLogPage";
import SnapshotTrend from "./components/SnapshotTrend";
import CompliancePage from "./components/CompliancePage";
import LandingPage from "./components/LandingPage";

function App() {
  const [activeSection, setActiveSection] = useState("overview");
  const [selectedMandateId, setSelectedMandateId] = useState(null);
  const [hasEntered, setHasEntered] = useState(false);

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
      return (
        <div>
          <h2 className="font-display text-3xl font-semibold text-ink mb-8">Snapshots</h2>
          <SnapshotTrend forceOpen />
        </div>
      );
    }

    if (activeSection === "rules") {
      return <CompliancePage />;
    }

    return null;
  }

  if (!hasEntered) {
    return <LandingPage onEnter={() => setHasEntered(true)} />;
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