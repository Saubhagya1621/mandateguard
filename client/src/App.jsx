import { useState } from "react";
import MandateList from "./components/MandateList";
import MandateDetail from "./components/MandateDetail";

function App() {
  const [selectedMandateId, setSelectedMandateId] = useState(null);

  return (
    <div className="min-h-screen bg-plum">
      {selectedMandateId ? (
        <MandateDetail
          mandateId={selectedMandateId}
          onBack={() => setSelectedMandateId(null)}
        />
      ) : (
        <MandateList onSelectMandate={setSelectedMandateId} />
      )}
    </div>
  );
}

export default App;