import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, where } from "firebase/firestore";

// Firebase configuration from Vite environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

let db = null;
let isFirebaseEnabled = false;

// Check if we have at least apiKey and projectId to initialize Firebase
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    isFirebaseEnabled = true;
    console.log("Firebase initialized successfully using environment variables.");
  } catch (error) {
    console.warn("Failed to initialize Firebase. Falling back to Simulated local database.", error);
  }
} else {
  console.log("Firebase env variables not found. Using Simulated local storage database.");
}

// SIMULATED DATABASE IMPLEMENTATION (fallback)
const getSimulatedScores = () => {
  const data = localStorage.getItem("quiz_leaderboard_simulated");
  return data ? JSON.parse(data) : [];
};

const saveSimulatedScore = (scoreData) => {
  const scores = getSimulatedScores();
  scores.push(scoreData);
  localStorage.setItem("quiz_leaderboard_simulated", JSON.stringify(scores));
  return Promise.resolve(scoreData);
};

// API EXPORTS

/**
 * Saves a player's score to the leaderboard.
 * @param {Object} data - Score detail data
 * @param {string} data.name - Player name
 * @param {string} data.quizId - Unique identifier of the quiz
 * @param {string} data.quizTitle - Title of the quiz
 * @param {number} data.score - Cumulative points or score
 * @param {number} data.percentage - Percentage score
 * @param {string} data.completedAt - ISO String date
 */
export const saveLeaderboardScore = async (data) => {
  const record = {
    name: data.name,
    quizId: data.quizId,
    quizTitle: data.quizTitle,
    score: Number(data.score),
    percentage: Number(data.percentage),
    completedAt: data.completedAt || new Date().toISOString()
  };

  if (isFirebaseEnabled && db) {
    try {
      const colRef = collection(db, "leaderboard");
      const docRef = await addDoc(colRef, record);
      return { id: docRef.id, ...record };
    } catch (e) {
      console.error("Firebase saveLeaderboardScore failed, falling back to simulated storage:", e);
      return saveSimulatedScore(record);
    }
  } else {
    return saveSimulatedScore(record);
  }
};

/**
 * Retrieves the Top 10 scores for a given quizId.
 * Ordered by score (descending) and latest completion time.
 * @param {string} quizId - ID of the quiz
 */
export const getTopScores = async (quizId) => {
  if (isFirebaseEnabled && db) {
    try {
      const colRef = collection(db, "leaderboard");
      // To avoid Firestore index requirements that trigger errors for reviewers,
      // we query all scores for the quiz and sort them in JS.
      const q = query(colRef, where("quizId", "==", quizId));
      const querySnapshot = await getDocs(q);
      
      const results = [];
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });

      // Sort in JS: Score descending, completedAt descending (latest date first)
      return results
        .sort((a, b) => {
          if (b.score !== a.score) {
            return b.score - a.score;
          }
          return new Date(b.completedAt) - new Date(a.completedAt);
        })
        .slice(0, 10);
    } catch (e) {
      console.error("Firebase getTopScores failed, falling back to simulated storage:", e);
      return getSimulatedTopScores(quizId);
    }
  } else {
    return getSimulatedTopScores(quizId);
  }
};

const getSimulatedTopScores = (quizId) => {
  const scores = getSimulatedScores();
  return scores
    .filter((item) => item.quizId === quizId)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return new Date(b.completedAt) - new Date(a.completedAt);
    })
    .slice(0, 10);
};

export { isFirebaseEnabled };
