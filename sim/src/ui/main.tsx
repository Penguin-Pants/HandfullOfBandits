// UI entry: render the app with the live API client.
import { createRoot } from "react-dom/client";
import { api } from "./api.ts";
import { App } from "./App.tsx";
import "./styles.css";

const root = document.getElementById("root");
if (root !== null) createRoot(root).render(<App api={api} />);
