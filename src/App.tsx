import { BrowserRouter, Route, Routes } from "react-router"
import { Layout } from "./components/Layout.tsx"
import { AboutPage } from "./pages/AboutPage.tsx"
import { CefrPage } from "./pages/CefrPage.tsx"
import { EvalPage } from "./pages/EvalPage.tsx"
import { FlashcardPage } from "./pages/FlashcardPage.tsx"
import { HighlighterPage } from "./pages/HighlighterPage.tsx"
import { HomePage } from "./pages/HomePage.tsx"
import { NotFoundPage } from "./pages/NotFoundPage.tsx"
import { ResultsPage } from "./pages/ResultsPage.tsx"
import { ReviewPage } from "./pages/ReviewPage.tsx"
import { SamplesPage } from "./pages/SamplesPage.tsx"
import { routerBasename } from "./publicUrl.ts"

export default function App() {
  return (
    <BrowserRouter basename={routerBasename()}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="results" element={<ResultsPage />} />
          <Route path="eval" element={<EvalPage />} />
          <Route path="samples" element={<SamplesPage />} />
          <Route path="samples/cefr-gauge" element={<CefrPage />} />
          <Route path="samples/flashcards" element={<FlashcardPage />} />
          <Route path="samples/error-highlighter" element={<HighlighterPage />} />
          <Route path="samples/review" element={<ReviewPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
