import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import registerServiceWorker from "./registerSW";

// Inicializa o aplicativo
createRoot(document.getElementById("root")!).render(<App />);

// Registra o service worker para funcionalidade de PWA
registerServiceWorker();
