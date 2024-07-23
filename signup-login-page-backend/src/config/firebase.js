const { initializeApp } = require("firebase/app");
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, sendPasswordResetEmail } = require("firebase/auth");

const firebaseConfig = {
  apiKey: "AIzaSyBWFVJYIA44Hom-Zkvpc19wjwOVbWyzZlw",
  authDomain: "user-authentication-aeb33.firebaseapp.com",
  projectId: "user-authentication-aeb33",
  storageBucket: "user-authentication-aeb33.appspot.com",
  messagingSenderId: "760336494344",
  appId: "1:760336494344:web:58e8ef5594ea2fb88886bd",
  measurementId: "G-PPT1404HMB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

module.exports = {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail
};