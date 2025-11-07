import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Worker } from "@react-pdf-viewer/core";
createRoot(document.getElementById("root")!).render(<App />);

const pdfjsWorker = "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js";