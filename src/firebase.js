import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBUEPxmjXb5hqfc8hW0tGO05IFvX8bjgLU",
  authDomain: "capacitacorp-db.firebaseapp.com",
  projectId: "capacitacorp-db",
  storageBucket: "capacitacorp-db.firebasestorage.app",
  messagingSenderId: "66322810405",
  appId: "1:66322810405:web:a59bb115aee16b532d61cc",
  measurementId: "G-XG1C0YB4LK"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar la base de datos para usarla en tu plataforma
export const db = getFirestore(app);
