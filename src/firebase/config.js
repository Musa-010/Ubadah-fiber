import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

 
const firebaseConfig = {
  apiKey: "AIzaSyBpKhuENPQlv1LLTq7ZwQ8UJm2ZGzSFNUw",
  authDomain: "ubadah-fiber.firebaseapp.com",
  projectId: "ubadah-fiber",
  storageBucket: "ubadah-fiber.firebasestorage.app",
  messagingSenderId: "723510701136",
  appId: "1:723510701136:web:039604b86a34fa1ff33555",
  measurementId: "G-M997LYL6FK"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
