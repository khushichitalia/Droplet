import React, { createContext, useContext } from "react";
import useBLE from "./useBLE";

const BLEContext = createContext(null);

export function BLEProvider({ children }) {
  const bleState = useBLE();

  return (
    <BLEContext.Provider value={bleState}>
      {children}
    </BLEContext.Provider>
  );
}

export function useBLEContext() {
  const context = useContext(BLEContext);
  if (!context) {
    throw new Error("useBLEContext must be used within a BLEProvider");
  }
  return context;
}
