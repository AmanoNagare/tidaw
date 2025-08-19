import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
const isTest = import.meta.env.VITE_TEST_ENTRY === "true";
const Entry = isTest
  ? (await import("./Test")).default
  : (await import("./App")).default;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Entry />
  </StrictMode>
);
