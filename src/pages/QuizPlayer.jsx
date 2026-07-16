import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import quizzesData from "../data/quiz.json";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle2, XCircle, AlertCircle, ArrowRight, Play, Volume2, VolumeX, Shuffle, Keyboard, Award } from "lucide-react";
import ResultScreen from "../components/ResultScreen";

// Web Audio API Synthesizer sound generator
const playSynthSound = (type, enabled) => {
  if (!enabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "tick") {
      osc.frequency.setValueAtTime(700, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } else if (type === "correct") {
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === "incorrect") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.22);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } else if (type === "complete") {
      // Celebratory Major Chord Sequence (C4, E4, G4, C5)
      const freqs = [261.63, 329.63, 392.00, 523.25];
      freqs.forEach((freq, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        g.gain.setValueAtTime(0.05, ctx.currentTime + idx * 0.08);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.08 + 0.4);
        o.start(ctx.currentTime + idx * 0.08);
        o.stop(ctx.currentTime + idx * 0.08 + 0.4);
      });
    }
  } catch (error) {
    console.warn("Synth Audio is blocked by browser interaction rules:", error);
  }
};

// Shuffling utility (Fisher-Yates)
const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[arr[j]]] = [arr[arr[j]], arr[i]];
  }
  return arr;
};

const QuizPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Find current quiz
  const baseQuiz = quizzesData.quizzes.find(q => q.id === id);

  if (!baseQuiz) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Quiz not found</h2>
        <button onClick={() => navigate("/")} className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl">
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Quiz Settings State
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [keyboardEnabled, setKeyboardEnabled] = useState(true);

  // Active Game State
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [answersLog, setAnswersLog] = useState([]); // Array of strings (options chosen) or null
  const [timeLeft, setTimeLeft] = useState(baseQuiz.timePerQuestion);
  const [quizFinished, setQuizFinished] = useState(false);
  
  const timerRef = useRef(null);

  // Start game handler
  const startQuiz = () => {
    let preparedQuestions = baseQuiz.questions.map(q => {
      // Copy question and option order
      const options = shuffleOptions ? shuffleArray(q.options) : [...q.options];
      return { ...q, options };
    });

    if (shuffleQuestions) {
      preparedQuestions = shuffleArray(preparedQuestions);
    }

    setQuestions(preparedQuestions);
    setCurrentIndex(0);
    setSelectedOption("");
    setAnswersLog([]);
    setTimeLeft(baseQuiz.timePerQuestion);
    setQuizFinished(false);
    setIsPlaying(true);
    playSynthSound("tick", soundEnabled);
  };

  // Timer interval controller
  useEffect(() => {
    if (!isPlaying || quizFinished) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        // Play tick sound when time runs low (<= 5 seconds)
        if (prev <= 6) {
          playSynthSound("tick", soundEnabled);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isPlaying, currentIndex, quizFinished]);

  // Handle timeout (timer hits 0)
  const handleTimeOut = () => {
    // If user has an option selected, use it, otherwise mark null (unanswered)
    const finalSelection = selectedOption || null;
    processAnswerAndAdvance(finalSelection);
  };

  // Process selected choice and advance index
  const processAnswerAndAdvance = (selection) => {
    const currentQuestion = questions[currentIndex];
    const isCorrect = selection === currentQuestion.correctAnswer;
    
    // Play sounds
    if (selection === null) {
      playSynthSound("incorrect", soundEnabled);
    } else {
      playSynthSound(isCorrect ? "correct" : "incorrect", soundEnabled);
    }

    const updatedLogs = [...answersLog, selection];
    setAnswersLog(updatedLogs);

    // Reset option selection and reset timer
    setSelectedOption("");

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setTimeLeft(baseQuiz.timePerQuestion);
    } else {
      // Quiz finished
      setQuizFinished(true);
      playSynthSound("complete", soundEnabled);
    }
  };

  // Next Button handler
  const handleNextClick = () => {
    if (!selectedOption) return;
    clearInterval(timerRef.current);
    processAnswerAndAdvance(selectedOption);
  };

  // Keyboard navigation logic
  useEffect(() => {
    if (!isPlaying || quizFinished || !keyboardEnabled) return;

    const handleKeyDown = (e) => {
      // Option keys '1', '2', '3', '4'
      if (["1", "2", "3", "4"].includes(e.key)) {
        const optionIndex = parseInt(e.key) - 1;
        const currentQuestion = questions[currentIndex];
        if (currentQuestion && currentQuestion.options[optionIndex]) {
          setSelectedOption(currentQuestion.options[optionIndex]);
        }
      }
      
      // Enter key for Next button (only if option selected)
      if (e.key === "Enter" && selectedOption) {
        handleNextClick();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, currentIndex, quizFinished, keyboardEnabled, selectedOption, questions]);

  // Reset/Restart Quiz
  const handlePlayAgain = () => {
    startQuiz();
  };

  // Compute final scores
  const getStats = () => {
    let correct = 0;
    let wrong = 0;
    let score = 0;

    questions.forEach((q, idx) => {
      const chosen = answersLog[idx];
      if (chosen === q.correctAnswer) {
        correct++;
        score += q.points;
      } else {
        wrong++;
      }
    });

    const totalQuestions = questions.length;
    const percentage = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;

    return {
      score,
      correct,
      wrong,
      percentage
    };
  };

  // Render Quiz Settings (Lobby Screen)
  if (!isPlaying) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 flex-grow flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full glass rounded-3xl p-8 border border-slate-200/10 shadow-xl"
        >
          <div className="text-center mb-8">
            <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
              Quiz Setup
            </span>
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-3 mb-2">
              {baseQuiz.title}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
              {baseQuiz.description}
            </p>
          </div>

          {/* Quick metadata badges */}
          <div className="grid grid-cols-3 gap-4 mb-8 text-center bg-slate-500/5 p-4 rounded-2xl border border-slate-200/5">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-0.5">Questions</div>
              <div className="text-lg font-bold text-indigo-500">{baseQuiz.totalQuestions}</div>
            </div>
            <div className="border-x border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-0.5">Difficulty</div>
              <div className="text-lg font-bold text-amber-500">{baseQuiz.difficulty}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-0.5">Time per Q</div>
              <div className="text-lg font-bold text-pink-500">{baseQuiz.timePerQuestion}s</div>
            </div>
          </div>

          {/* Configuration Toggles */}
          <div className="space-y-4 mb-8">
            <h3 className="text-sm font-extrabold uppercase text-slate-400 tracking-wider mb-2">Game Options</h3>
            
            {/* Shuffle Questions */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/10">
              <div className="flex items-center gap-3">
                <Shuffle className="w-5 h-5 text-indigo-500" />
                <div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-100">Shuffle Questions</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Randomize question sequence</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={shuffleQuestions}
                onChange={(e) => setShuffleQuestions(e.target.checked)}
                className="w-5 h-5 accent-indigo-500 cursor-pointer rounded"
              />
            </div>

            {/* Shuffle Options */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/10">
              <div className="flex items-center gap-3">
                <Shuffle className="w-5 h-5 text-pink-500" />
                <div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-100">Shuffle Options</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Randomize four choices sequence</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={shuffleOptions}
                onChange={(e) => setShuffleOptions(e.target.checked)}
                className="w-5 h-5 accent-pink-500 cursor-pointer rounded"
              />
            </div>

            {/* Sound FX */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/10">
              <div className="flex items-center gap-3">
                {soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <VolumeX className="w-5 h-5 text-slate-400" />
                )}
                <div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-100">Sound Synthesizer</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Synth sound effect confirmations</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-5 h-5 accent-emerald-500 cursor-pointer rounded"
              />
            </div>

            {/* Keyboard Shortcuts */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/10">
              <div className="flex items-center gap-3">
                <Keyboard className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-100">Keyboard Shortcuts</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Use keys [1-4] for answers and [Enter] to submit</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={keyboardEnabled}
                onChange={(e) => setKeyboardEnabled(e.target.checked)}
                className="w-5 h-5 accent-blue-500 cursor-pointer rounded"
              />
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={startQuiz}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-extrabold text-base shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Start Quiz Challenge</span>
          </button>
        </motion.div>
      </div>
    );
  }

  // Render Result Screen
  if (quizFinished) {
    const stats = getStats();
    return (
      <ResultScreen
        quizId={baseQuiz.id}
        quizTitle={baseQuiz.title}
        score={stats.score}
        correct={stats.correct}
        wrong={stats.wrong}
        percentage={stats.percentage}
        questions={questions}
        answersLog={answersLog}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  // Render Playing state
  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) return null; // Defensive check

  const progressPercentage = ((currentIndex) / questions.length) * 100;
  const timeProgress = (timeLeft / baseQuiz.timePerQuestion);

  // SVG timer colors based on time remaining
  const getTimerColorClass = () => {
    if (timeLeft <= 5) return "text-rose-500";
    if (timeLeft <= 10) return "text-amber-500";
    return "text-indigo-500 dark:text-indigo-400";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex-grow flex flex-col justify-center">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Playing Quiz: {baseQuiz.title}
          </span>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mt-0.5">
            Question <span className="text-indigo-500">{currentIndex + 1}</span> of {questions.length}
          </h2>
        </div>

        {/* Circular Countdown Timer */}
        <div className="relative w-14 h-14 flex items-center justify-center">
          <svg className="absolute w-full h-full transform -rotate-90">
            <circle
              cx="28"
              cy="28"
              r="24"
              className="stroke-slate-200 dark:stroke-slate-800 fill-none"
              strokeWidth="4"
            />
            <motion.circle
              cx="28"
              cy="28"
              r="24"
              className={`fill-none stroke-current ${getTimerColorClass()}`}
              strokeWidth="4"
              strokeDasharray={150.8}
              animate={{ strokeDashoffset: 150.8 - (150.8 * timeProgress) }}
              transition={{ duration: 1, ease: "linear" }}
            />
          </svg>
          <span className={`text-sm font-extrabold z-10 ${getTimerColorClass()}`}>
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full mb-8 overflow-hidden shadow-inner">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full"
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question Card Container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="glass rounded-3xl p-6 sm:p-8 border border-slate-200/10 shadow-lg flex-grow flex flex-col justify-between"
        >
          {/* Question Title */}
          <div>
            <h3 className="text-xl sm:text-2xl font-bold leading-snug text-slate-800 dark:text-slate-100 mb-8 font-sans">
              {currentQuestion.question}
            </h3>

            {/* Grid of Choices */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {currentQuestion.options.map((option, idx) => {
                const letter = ["A", "B", "C", "D"][idx];
                const isSelected = selectedOption === option;
                return (
                  <motion.button
                    key={idx}
                    onClick={() => setSelectedOption(option)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`relative overflow-hidden flex items-center gap-4 p-4.5 rounded-2xl text-left border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50 border-indigo-500 dark:bg-indigo-950/40 dark:border-indigo-400 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20"
                        : "bg-white/40 border-slate-200 dark:bg-slate-900/40 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500 text-slate-700 dark:text-slate-300 shadow-sm"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center border text-xs sm:text-sm shrink-0 transition-colors duration-200 ${
                      isSelected
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20"
                        : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-indigo-100"
                    }`}>
                      {keyboardEnabled ? idx + 1 : letter}
                    </div>
                    <span className="text-sm sm:text-base font-bold leading-tight flex-grow pr-4">
                      {option}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-6">
            <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <span>Points for this question: </span>
              <span className="font-extrabold text-slate-600 dark:text-slate-300">{currentQuestion.points} pts</span>
            </div>

            <button
              onClick={handleNextClick}
              disabled={!selectedOption}
              className={`flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-extrabold text-sm transition-all duration-200 shadow-sm ${
                selectedOption
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer hover:shadow-md"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
              }`}
            >
              <span>{currentIndex === questions.length - 1 ? "Finish Quiz" : "Next Question"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default QuizPlayer;
