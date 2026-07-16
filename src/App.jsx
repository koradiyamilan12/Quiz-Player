import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import QuizList from "./pages/QuizList";
import QuizPlayer from "./pages/QuizPlayer";
import { AnimatePresence, motion } from "framer-motion";

// Page transition wrapper component
const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="flex-grow flex flex-col"
    >
      {children}
    </motion.div>
  );
};

// Animated routes coordinator
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <QuizList />
            </PageTransition>
          }
        />
        <Route
          path="/quiz/:id"
          element={
            <PageTransition>
              <QuizPlayer />
            </PageTransition>
          }
        />
        {/* Fallback route */}
        <Route
          path="*"
          element={
            <PageTransition>
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Page Not Found</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">The page you are looking for does not exist.</p>
              </div>
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <BrowserRouter>
      <div className="bg-radial-gradient min-h-screen flex flex-col text-slate-900 dark:text-slate-50 transition-colors duration-300">
        <Navbar />
        <main className="flex-grow flex flex-col">
          <AnimatedRoutes />
        </main>
        {/* Footer */}
        <footer className="py-6 border-t border-slate-200/10 text-center text-xs text-slate-400 dark:text-slate-500 font-semibold glass mt-auto">
          <div className="max-w-7xl mx-auto px-4">
            &copy; {new Date().getFullYear()} QuizVerse. Made with React, Vite & Tailwind CSS.
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
