import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import quizzesData from "../data/quiz.json";
import { Search, Filter, Clock, BookOpen, Brain, Globe, Laptop, Film, Beaker, Trophy, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const CATEGORY_ICONS = {
  "General Knowledge": Globe,
  "Programming": Laptop,
  "Entertainment": Film,
  "Science": Beaker,
  "Sports": Trophy
};

const CATEGORY_GRADIENTS = {
  "General Knowledge": "from-emerald-500 to-teal-600",
  "Programming": "from-indigo-500 to-purple-600",
  "Entertainment": "from-pink-500 to-rose-600",
  "Science": "from-amber-500 to-orange-600",
  "Sports": "from-blue-500 to-cyan-600"
};

const QuizList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  const quizzes = quizzesData.quizzes;

  // Extract unique categories for filters
  const categories = useMemo(() => ["All", ...new Set(quizzes.map(q => q.category))], [quizzes]);
  const difficulties = ["All", "Easy", "Medium", "Hard"];

  // Filter quizzes
  const filteredQuizzes = useMemo(() => {
    return quizzes.filter(quiz => {
      const matchesSearch = quiz.title.toLowerCase().includes(search.toLowerCase()) || 
                            quiz.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === "All" || quiz.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === "All" || quiz.difficulty === selectedDifficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [quizzes, search, selectedCategory, selectedDifficulty]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden mb-10 bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-8 sm:p-12 shadow-xl border border-white/5">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-15 hidden md:block">
          <div className="w-full h-full bg-indigo-500 animate-morph rounded-full filter blur-3xl transform translate-x-12 translate-y-12"></div>
        </div>
        <div className="relative z-10 max-w-2xl">
          <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
            Welcome to QuizVerse
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mt-4 mb-3 leading-tight font-sans">
            Ready to test your knowledge?
          </h1>
          <p className="text-slate-300 text-base sm:text-lg mb-6">
            Choose from a wide variety of topics including General Knowledge, React Programming, Movies, Science, and Sports. Challenge yourself and reach the top 10 leaderboard!
          </p>
          <div className="flex items-center gap-6 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>{quizzes.length} Quizzes Available</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-600"></div>
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-pink-400" />
              <span>{quizzes.reduce((acc, curr) => acc + curr.totalQuestions, 0)} Total Questions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="glass rounded-2xl p-6 mb-8 border border-slate-200/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search quizzes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Selector */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat} Category</option>
              ))}
            </select>
          </div>

          {/* Difficulty Selector */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            {difficulties.map((diff) => (
              <option key={diff} value={diff}>{diff} Difficulty</option>
            ))}
          </select>
        </div>
      </div>

      {/* Quiz Grid */}
      {filteredQuizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz, index) => {
            const IconComponent = CATEGORY_ICONS[quiz.category] || Globe;
            const gradientClass = CATEGORY_GRADIENTS[quiz.category] || "from-slate-500 to-slate-700";

            return (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group flex flex-col justify-between rounded-2xl glass border border-slate-200/10 shadow-sm overflow-hidden hover-lift hover:shadow-md dark:hover:shadow-black/50"
              >
                {/* Visual Header */}
                <div className={`relative h-32 bg-gradient-to-r ${gradientClass} p-5 flex flex-col justify-between text-white`}>
                  <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
                    <IconComponent className="w-32 h-32" />
                  </div>
                  <div className="flex items-center justify-between z-10">
                    <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/10">
                      {quiz.category}
                    </span>
                    <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full border ${
                      quiz.difficulty === "Easy" ? "bg-emerald-500/20 text-emerald-100 border-emerald-500/30" :
                      quiz.difficulty === "Medium" ? "bg-amber-500/20 text-amber-100 border-amber-500/30" :
                      "bg-rose-500/20 text-rose-100 border-rose-500/30"
                    }`}>
                      {quiz.difficulty}
                    </span>
                  </div>
                  <div className="z-10 flex items-center gap-2">
                    <IconComponent className="w-5 h-5 text-indigo-100" />
                    <span className="text-sm font-semibold text-slate-100">{quiz.category}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-slate-100 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors duration-200">
                      {quiz.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-6">
                      {quiz.description}
                    </p>
                  </div>

                  {/* Metadata & Play Button */}
                  <div>
                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 mb-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-indigo-500" />
                        <span>{quiz.totalQuestions} Questions</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-pink-500" />
                        <span>{quiz.timePerQuestion}s / Q</span>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/quiz/${quiz.id}`)}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all duration-200 text-sm cursor-pointer group/btn"
                    >
                      <span>Play Quiz</span>
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 px-4 glass rounded-2xl border border-slate-200/10">
          <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-full mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-1">No quizzes found</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm text-center mb-6">
            We couldn't find any quizzes matching your search or filters. Try adjusting your query or resetting the filters.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setSelectedCategory("All");
              setSelectedDifficulty("All");
            }}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-indigo-600/15"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizList;
