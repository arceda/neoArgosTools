import React from "react";
import CanvasPage from "./pages/CanvasPage.jsx";
import { CanvasProvider } from "./Context/Canvas.context.jsx";

const App = () => {
  return (
    <CanvasProvider>
      <CanvasPage />
    </CanvasProvider>
  );
};

export default App;
