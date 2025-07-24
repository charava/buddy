// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCH8cVAs3Oe0OAdLX2c7MV5GEwnFRu8aqk",
  authDomain: "somethings-buddy.firebaseapp.com",
  databaseURL: "https://somethings-buddy-default-rtdb.firebaseio.com",
  projectId: "somethings-buddy",
  storageBucket: "somethings-buddy.firebasestorage.app",
  messagingSenderId: "1025022953185",
  appId: "1:1025022953185:web:d16ff1e2fd0c344a77d9a0",
  measurementId: "G-HL4BPJ7SEL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);