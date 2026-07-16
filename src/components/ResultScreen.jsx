import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { saveLeaderboardScore } from "../firebase";
import Leaderboard from "./Leaderboard";
import { Trophy, CheckCircle, XCircle, Percent, RotateCcw, Home, UserCheck, Loader2, ChevronDown, ChevronUp, Info, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ResultScreen = ({ quizId, quizTitle, score, correct, wrong, percentage, questions = [], answersLog = [], onPlayAgain }) => {
  const [showReview, setShowReview] = useState(false);
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Confetti trigger for high scores (>= 80%)
  useEffect(() => {
    if (percentage >= 80) {
      // Fire confetti from left & right
      const duration = 2.5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // since particles fall down, animate them from the top
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [percentage]);

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setErrorMsg("Please enter a valid nickname");
      return;
    }
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      await saveLeaderboardScore({
        name: playerName.trim(),
        quizId,
        quizTitle,
        score,
        percentage,
        completedAt: new Date().toISOString()
      });
      setIsSubmitted(true);
      setRefreshTrigger(prev => prev + 1); // Trigger leaderboard refresh
    } catch (e) {
      setErrorMsg("Could not submit score. Please try again.");
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get custom messages based on performance
  const getPerformanceDetails = () => {
    if (percentage >= 90) {
      return {
        title: "Spectacular Achievement!",
        message: "Unbelievable accuracy! You have completely mastered this topic.",
        color: "text-emerald-500",
        bg: "bg-emerald-500/10 border-emerald-500/20"
      };
    } else if (percentage >= 75) {
      return {
        title: "Brilliant Job!",
        message: "Incredible score! Your hard work is clearly paying off.",
        color: "text-indigo-500",
        bg: "bg-indigo-500/10 border-indigo-500/20"
      };
    } else if (percentage >= 50) {
      return {
        title: "Nice Performance!",
        message: "You did well! Try reading up on the incorrect explanations to get 100%.",
        color: "text-amber-500",
        bg: "bg-amber-500/10 border-amber-500/20"
      };
    } else {
      return {
        title: "Keep Learning!",
        message: "Every mistake is a stepping stone. Review the answers and try again!",
        color: "text-rose-500",
        bg: "bg-rose-500/10 border-rose-500/20"
      };
    }
  };

  const perf = getPerformanceDetails();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex-grow">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Score Summary */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-6 glass rounded-3xl p-6 sm:p-8 border border-slate-200/10 shadow-lg text-center"
        >
          <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
            Quiz Complete
          </span>
          
          {/* Trophy Header */}
          <div className="flex justify-center my-6">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500/30 rounded-full filter blur-xl transform scale-110 animate-pulse"></div>
              <div className="relative bg-gradient-to-tr from-amber-400 to-yellow-500 p-5 rounded-full text-white shadow-lg border border-amber-300/30">
                <Trophy className="w-10 h-10" />
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
            Congratulations!
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">
            You completed the quiz: <span className="font-bold text-indigo-500">{quizTitle}</span>
          </p>

          {/* Performance Callout */}
          <div className={`p-4 rounded-2xl border text-center mb-8 ${perf.bg}`}>
            <h4 className={`text-base font-extrabold ${perf.color}`}>{perf.title}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{perf.message}</p>
          </div>

          {/* Score details grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {/* Percentage */}
            <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/10">
              <div className="flex justify-center mb-1"><Percent className="w-4 h-4 text-indigo-500" /></div>
              <div className="text-2xl font-black text-slate-800 dark:text-slate-100">{percentage}%</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Accuracy</div>
            </div>

            {/* Score */}
            <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/10">
              <div className="flex justify-center mb-1"><Trophy className="w-4 h-4 text-amber-500" /></div>
              <div className="text-2xl font-black text-slate-800 dark:text-slate-100">{score}</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Points</div>
            </div>

            {/* Correct */}
            <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/10">
              <div className="flex justify-center mb-1"><CheckCircle className="w-4 h-4 text-emerald-500" /></div>
              <div className="text-2xl font-black text-slate-800 dark:text-slate-100">{correct}</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Correct</div>
            </div>

            {/* Wrong */}
            <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/10">
              <div className="flex justify-center mb-1"><XCircle className="w-4 h-4 text-rose-500" /></div>
              <div className="text-2xl font-black text-slate-800 dark:text-slate-100">{wrong}</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Wrong</div>
            </div>
          </div>

          {/* Leaderboard Submission Form */}
          {!isSubmitted ? (
            <form onSubmit={handleNameSubmit} className="mb-8 p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-left">
              <label htmlFor="nickname-input" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Save to Firestore Leaderboard
              </label>
              <div className="flex gap-2">
                <input
                  id="nickname-input"
                  type="text"
                  placeholder="Enter name (e.g. Milan)"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="flex-grow px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-500/50 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>Submit</span>
                    </>
                  )}
                </button>
              </div>
              {errorMsg && <p className="text-xs text-rose-500 font-bold mt-2">{errorMsg}</p>}
            </form>
          ) : (
            <div className="mb-8 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-sm font-bold flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <span>Score successfully saved to Leaderboard!</span>
            </div>
          )}

          {/* Control Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onPlayAgain}
              className="flex-grow flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-extrabold text-sm shadow-md shadow-indigo-600/15 cursor-pointer transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex-grow flex items-center justify-center gap-2 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-extrabold text-sm border border-slate-200/10 cursor-pointer transition-all"
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
          </div>
        </motion.div>

        {/* Right Side: Dynamic Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:col-span-6 glass rounded-3xl p-6 sm:p-8 border border-slate-200/10 shadow-lg"
        >
          <div className="flex items-center gap-2.5 mb-6">
            <div className="bg-amber-500/10 p-2 rounded-xl text-amber-500">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">Top 10 Rankings</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Current quiz high scores</p>
            </div>
          </div>

          <Leaderboard quizId={quizId} refreshTrigger={refreshTrigger} />
        </motion.div>
      </div>

      {/* Dynamic Answer Review Section */}
      {questions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-8 glass rounded-3xl p-6 sm:p-8 border border-slate-200/10 shadow-lg"
        >
          <button
            onClick={() => setShowReview(prev => !prev)}
            className="w-full flex items-center justify-between text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="bg-indigo-500/10 p-2.5 rounded-xl text-indigo-500">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                  Review Answers & Explanations
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Detailed breakdown of each question</p>
              </div>
            </div>
            {showReview ? (
              <ChevronUp className="w-6 h-6 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            ) : (
              <ChevronDown className="w-6 h-6 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            )}
          </button>

          <AnimatePresence>
            {showReview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-6 space-y-6"
              >
                {questions.map((q, idx) => {
                  const chosen = answersLog[idx];
                  const isCorrect = chosen === q.correctAnswer;
                  const isUnanswered = chosen === null || chosen === undefined;

                  return (
                    <div
                      key={q.id || idx}
                      className={`p-5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 ${
                        isCorrect
                          ? "bg-emerald-500/5 border-emerald-500/25"
                          : isUnanswered
                          ? "bg-slate-500/5 border-slate-200/10"
                          : "bg-rose-500/5 border-rose-500/25"
                      }`}
                    >
                      {/* Question Header */}
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                        <span className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-100">
                          {idx + 1}. {q.question}
                        </span>
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                          isCorrect
                            ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                            : isUnanswered
                            ? "bg-slate-500/20 text-slate-500 border-slate-500/30"
                            : "bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30"
                        }`}>
                          {isCorrect ? "Correct (+10 pts)" : isUnanswered ? "Unanswered (0 pts)" : "Incorrect (0 pts)"}
                        </span>
                      </div>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4">
                        {q.options.map((option, oIdx) => {
                          const isOptionChosen = chosen === option;
                          const isOptionCorrect = option === q.correctAnswer;
                          
                          let btnStyle = "bg-white/30 border-slate-200/50 dark:bg-slate-900/30 dark:border-slate-800 text-slate-700 dark:text-slate-300";
                          let checkIcon = null;

                          if (isOptionCorrect) {
                            btnStyle = "bg-emerald-50 border-emerald-500 dark:bg-emerald-950/40 dark:border-emerald-400 text-emerald-800 dark:text-emerald-300 font-extrabold shadow-sm";
                            checkIcon = <Check className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />;
                          } else if (isOptionChosen) {
                            btnStyle = "bg-rose-50 border-rose-500 dark:bg-rose-950/40 dark:border-rose-400 text-rose-800 dark:text-rose-300 font-extrabold shadow-sm";
                            checkIcon = <X className="w-4.5 h-4.5 text-rose-600 dark:text-rose-400" />;
                          }

                          return (
                            <div
                              key={oIdx}
                              className={`flex items-center gap-2.5 p-3.5 rounded-xl border text-xs sm:text-sm ${btnStyle}`}
                            >
                              <div className="flex-grow">{option}</div>
                              {checkIcon}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation Callout */}
                      {q.explanation && (
                        <div className="mt-2 p-3.5 rounded-xl bg-slate-500/5 border border-slate-200/5 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2 leading-relaxed">
                          <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-extrabold text-slate-700 dark:text-slate-300">Explanation: </span>
                            {q.explanation}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default ResultScreen;
