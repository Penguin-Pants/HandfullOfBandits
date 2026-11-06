// UI entry: render the app with the live API client.
import { createRoot } from "react-dom/client";
import { api } from "./api.ts";
import { App } from "./App.tsx";
// Map names: one bundled font, so label width is the same on every system (Georgia is wider on Windows).
import "@fontsource/crimson-pro/latin-600.css";
import "@fontsource/crimson-pro/latin-700.css";
import "./styles.css";

const root = document.getElementById("root");
if (root !== null) createRoot(root).render(<App api={api} />);
