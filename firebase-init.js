// ---------- Firebase config ----------
// Get these values from: Firebase Console → Project settings (gear icon) →
// General tab → scroll to "Your apps" → click the Web app (</>) → the
// firebaseConfig object is shown there. Paste your real values below.
const firebaseConfig = {
  apiKey: "AIzaSyAVeJHzhine9Zu60sQodF27vm7QjkIDwsU",
  authDomain: "abhayai-7cf39.firebaseapp.com",
  projectId: "abhayai-7cf39",
  storageBucket: "abhayai-7cf39.firebasestorage.app",
  messagingSenderId: "206185529154",
  appId: "1:206185529154:web:ace943815a9056017bd2db"
};
 
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
 