import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // ✅ correct import

const firebaseConfig = {
  apiKey: "AIzaSyDLtvHoIr5htmdAOm7YK9d2-d_k4lHh8G8",
  authDomain: "apnascore-a7ce5.firebaseapp.com",
  databaseURL: "https://apnascore-a7ce5-default-rtdb.firebaseio.com", // ✅ important
  projectId: "apnascore-a7ce5",
};

const app = initializeApp(firebaseConfig);

// ✅ RTDB export
export const db = getDatabase(app);