import React from "react";
import KanbanBoard from "../components/KanbanBoard";
import { useLocation } from "react-router-dom";

const ScreeningSchedule = () => {
  const { state } = useLocation(); // Destructure properly

  return (
    <div className="w-full overflow-scroll">
      <KanbanBoard data={state} /> {/* Send meaningful prop name */}
    </div>
  );
};

export default ScreeningSchedule;