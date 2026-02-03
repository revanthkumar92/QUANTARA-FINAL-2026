import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA4qQbefM0NbVPcppTyrYcDMTJ-WXk-cdk",
    authDomain: "quantara-1-b3ee5.firebaseapp.com",
    projectId: "quantara-1-b3ee5",
    storageBucket: "quantara-1-b3ee5.firebasestorage.app",
    messagingSenderId: "811940042525",
    appId: "1:811940042525:web:e535184160dec92120f3f4",
    measurementId: "G-BPRW2RC18J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Analytics is only supported in browser environments
let analytics;
if (typeof window !== "undefined") {
    analytics = getAnalytics(app);
}

const logAction = async (actionName: string) => {
    try {
        const userStr = localStorage.getItem("quantaraUser");
        const user = userStr ? JSON.parse(userStr) : null;

        await addDoc(collection(db, "userActions"), {
            uid: user ? (user.phone || "anonymous") : "anonymous",
            action: actionName,
            page: window.location.pathname,
            time: serverTimestamp(),
            email: user?.email || null,
            name: user?.name || null
        });
        console.log("Action stored:", actionName);
    } catch (error) {
        console.error("Error logging action:", error);
    }
};

export { app, db, auth, analytics, logAction };
