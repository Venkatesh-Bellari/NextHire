





import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import 'firebase/compat/storage';

import { LearningRoadmap, UserProfile, DailyScoreRecord } from '../types';

// Type alias for clarity, since the original file exported these types.
export type User = firebase.User;
type UserCredential = firebase.auth.UserCredential;
type FirebaseApp = firebase.app.App;
type Auth = firebase.auth.Auth;
type Database = firebase.database.Database;
type FirebaseStorage = firebase.storage.Storage;


const firebaseConfig = {
  apiKey: "AIzaSyByl2yMNdwGpse0oEa27JzeSEObZKvhvZg",
  authDomain: "nexthire-2406.firebaseapp.com",
  databaseURL: "https://nexthire-2406-default-rtdb.firebaseio.com",
  projectId: "nexthire-2406",
  storageBucket: "nexthire-2406.appspot.com",
  messagingSenderId: "876708714828",
  appId: "1:876708714828:web:7033f95ecf07ddec5057e9",
  measurementId: "G-5X2Q78GYKZ"
};


// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export const auth: Auth = firebase.auth();
const app: FirebaseApp = firebase.app();
const db: Database = firebase.database();
const storage: FirebaseStorage = firebase.storage();

export const initializeFirebase = (): FirebaseApp => {
  return app;
};

export const signUp = async (email: string, password: string): Promise<UserCredential> => {
  const userCredential = await auth.createUserWithEmailAndPassword(email, password);
  if (userCredential.user) {
      await userCredential.user.sendEmailVerification();
  }
  return userCredential;
};

export const signIn = (email: string, password: string): Promise<UserCredential> => {
  return auth.signInWithEmailAndPassword(email, password);
};

export const signInWithGithub = (): Promise<UserCredential> => {
    const provider = new firebase.auth.GithubAuthProvider();
    return auth.signInWithPopup(provider);
};

export const logOut = (): Promise<void> => {
  return auth.signOut();
};

const onAuthChangeCallback = (callback: (user: User | null) => void) => {
  return auth.onAuthStateChanged(callback);
};

export const resendVerificationEmail = async (): Promise<void> => {
    const user = auth.currentUser;
    if (user) {
        await user.sendEmailVerification();
    } else {
        throw new Error("No user is currently signed in to resend verification email.");
    }
};

export const uploadFile = async (file: File, path: string): Promise<string> => {
    try {
        const fileRef = storage.ref(path);
        await fileRef.put(file);
        const downloadURL = await fileRef.getDownloadURL();
        return downloadURL;
    } catch (error) {
        console.error("Error uploading file:", error);
        throw new Error("File upload failed.");
    }
};

export const saveRoadmap = async (userId: string, roadmap: Omit<LearningRoadmap, 'id'>): Promise<string> => {
    try {
        const roadmapsRef = db.ref(`user_roadmaps/${userId}`);
        const newRoadmapRef = roadmapsRef.push();
        // Destructure to remove userId if it exists, ensuring it's not stored in the DB object.
        const { userId: _userId, ...dataToSave } = roadmap as LearningRoadmap;
        await newRoadmapRef.set({
            ...dataToSave,
            savedAt: firebase.database.ServerValue.TIMESTAMP
        });
        return newRoadmapRef.key!;
    } catch (error) {
        console.error("Error saving roadmap to Realtime Database:", error);
        throw new Error("Could not save the roadmap.");
    }
};

export const getSavedRoadmaps = async (userId: string): Promise<LearningRoadmap[]> => {
    try {
        const roadmapsRef = db.ref(`user_roadmaps/${userId}`);
        const snapshot = await roadmapsRef.get();
        const roadmaps: LearningRoadmap[] = [];
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                roadmaps.push({ id: childSnapshot.key!, ...childSnapshot.val() } as LearningRoadmap);
            });
            // Sort client-side to get the most recent roadmaps first
            roadmaps.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
        }
        return roadmaps;
    } catch (error) {
        console.error("Error fetching roadmaps from Realtime Database:", error);
        throw new Error("Could not fetch saved roadmaps.");
    }
};

export const deleteRoadmap = async (userId: string, roadmapId: string): Promise<void> => {
    try {
        const roadmapRef = db.ref(`user_roadmaps/${userId}/${roadmapId}`);
        await roadmapRef.remove();
    } catch (error) {
        console.error("Error deleting roadmap from Realtime Database:", error);
        throw new Error("Could not delete the roadmap.");
    }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
        const profileRef = db.ref(`profiles/${userId}`);
        const snapshot = await profileRef.get();
        if (snapshot.exists()) {
            return { id: snapshot.key!, ...snapshot.val() } as UserProfile;
        } else {
            console.log("No such profile document! Creating a new one.");
            return null;
        }
    } catch (error) {
        console.error("Error fetching user profile from Realtime Database:", error);
        throw new Error("Could not fetch user profile.");
    }
};

export const saveUserProfile = async (userId: string, profileData: UserProfile): Promise<void> => {
    try {
        const { id, ...dataToSave } = profileData;
        const profileRef = db.ref(`profiles/${userId}`);
        await profileRef.set(dataToSave);
    } catch (error) {
        console.error("Error saving user profile to Realtime Database:", error);
        throw new Error("Could not save user profile.");
    }
};

export const getTodaysScoreRecord = async (userId: string): Promise<DailyScoreRecord | null> => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    try {
        const scoreRef = db.ref(`daily_scores/${userId}/${today}`);
        const snapshot = await scoreRef.get();
        if (snapshot.exists()) {
            return snapshot.val() as DailyScoreRecord;
        }
        return null;
    } catch (error) {
        console.error("Error fetching today's score record:", error);
        throw new Error("Could not fetch today's score data.");
    }
};

export const saveDailyScore = async (userId: string, score: number) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const scoreRef = db.ref(`daily_scores/${userId}/${today}`);
        await scoreRef.set({
            score: score,
            date: today,
            completedAt: firebase.database.ServerValue.TIMESTAMP,
        });
    } catch (error) {
        console.error("Error saving daily score:", error);
        throw new Error("Could not save your quiz score.");
    }
};

export const getTodaysStandardPracticeRecord = async (userId: string): Promise<Record<string, boolean>> => {
    const today = new Date().toISOString().split('T')[0];
    try {
        const recordRef = db.ref(`standard_practice_records/${userId}/${today}`);
        const snapshot = await recordRef.get();
        if (snapshot.exists()) {
            return snapshot.val();
        }
        return {};
    } catch (error) {
        console.error("Error fetching today's standard practice records:", error);
        return {}; // Fail open
    }
};

export const saveStandardPracticeCompletion = async (userId: string, categoryId: string) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const recordRef = db.ref(`standard_practice_records/${userId}/${today}/${categoryId}`);
        await recordRef.set(true);
    } catch (error) {
        console.error("Error saving standard practice completion:", error);
        throw new Error("Could not save your practice session completion.");
    }
};

export const updateUserStreak = async (userId: string) => {
    try {
        const profileRef = db.ref(`profiles/${userId}`);
        const snapshot = await profileRef.get();
        const profile: Partial<UserProfile> = snapshot.val() || {};

        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        const todayStr = today.toISOString().split('T')[0];
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const lastDate = profile.lastQuizDate;
        let newStreak = profile.dailyQuizStreak || 0;

        if (lastDate === todayStr) {
            // Already played today, do nothing.
            return;
        } else if (lastDate === yesterdayStr) {
            newStreak++; // Consecutive day
        } else {
            newStreak = 1; // Streak is broken or it's the first time
        }

        await profileRef.update({
            dailyQuizStreak: newStreak,
            lastQuizDate: todayStr
        });
    } catch (error) {
        console.error("Error updating user streak:", error);
        // Don't throw, as this is a non-critical operation
    }
};


// Re-exporting with the original name for compatibility with other components
export const onAuthChange = onAuthChangeCallback;