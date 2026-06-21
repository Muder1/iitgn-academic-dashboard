import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDJBgp8sUFvg5HZ5E7lB80mwwEBupftMVs",
  authDomain: "iitgn-academic-dashboard.firebaseapp.com",
  projectId: "iitgn-academic-dashboard",
  storageBucket: "iitgn-academic-dashboard.firebasestorage.app",
  messagingSenderId: "573516441885",
  appId: "1:573516441885:web:b11352544bd7a78c3659f4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

provider.setCustomParameters({ prompt: 'select_account' });