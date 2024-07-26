import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBWFVJYIA44Hom-Zkvpc19wjwOVbWyzZlw",
  authDomain: "user-authentication-aeb33.firebaseapp.com",
  projectId: "user-authentication-aeb33",
  storageBucket: "user-authentication-aeb33.appspot.com",
  messagingSenderId: "760336494344",
  appId: "1:760336494344:web:58e8ef5594ea2fb88886bd",
  measurementId: "G-PPT1404HMB"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);