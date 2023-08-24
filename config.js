// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyBEAtXEs3sJd9nPrgFhCWxCAkRk_WpL0f0",
  authDomain: "acada-6ed2e.firebaseapp.com",
  databaseURL: "https://acada-6ed2e-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "acada-6ed2e",
  storageBucket: "acada-6ed2e.appspot.com",
  messagingSenderId: "462148705998",
  appId: "1:462148705998:web:287ab0288468c68deb7a9f",
  measurementId: "G-W7W6BF673J"
};

const app = initializeApp(firebaseConfig);

export default app;