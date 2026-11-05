import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "@fontsource/fraunces/latin-500.css"
import "@fontsource/fraunces/latin-600.css"
import "@fontsource/fraunces/latin-700.css"
import "@fontsource/ibm-plex-mono/latin-400.css"
import "@fontsource/source-sans-3/latin-400.css"
import "@fontsource/source-sans-3/latin-600.css"
import "@fontsource/source-sans-3/latin-700.css"
import App from "./App.tsx"
import "./styles.css"

const root = document.getElementById("root")
if (!root) throw new Error("Root element missing")

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
