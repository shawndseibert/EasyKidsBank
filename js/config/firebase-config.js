/* ========================================
   EasyKidsBank - Firebase Configuration
   ======================================== */

/**
 * IMPORTANT: Replace the placeholder values below with your actual Firebase config.
 *
 * To get your Firebase config:
 * 1. Go to https://console.firebase.google.com/
 * 2. Click "Add project" (or select an existing project)
 * 3. Give your project a name (e.g., "EasyKidsBank")
 * 4. Enable Google Analytics if desired (optional)
 * 5. Once created, click the web icon (</>) to add a web app
 * 6. Register your app with a nickname (e.g., "EasyKidsBank Web")
 * 7. Copy the firebaseConfig object and paste it below
 *
 * Then enable Authentication:
 * 1. In Firebase Console, go to Authentication > Sign-in method
 * 2. Enable "Email/Password"
 * 3. Enable "Google" (for Google sign-in)
 *
 * Then create Firestore Database:
 * 1. In Firebase Console, go to Firestore Database
 * 2. Click "Create database"
 * 3. Start in "test mode" for development (we'll add security rules later)
 * 4. Choose a location close to your users
 */

const firebaseConfig = {

  apiKey: "AIzaSyBUlUeS4XGWZ2sR-OYEq1sLgVGQkPuIaF0",

  authDomain: "aim-clone-5278f.firebaseapp.com",

  databaseURL: "https://aim-clone-5278f-default-rtdb.firebaseio.com",

  projectId: "aim-clone-5278f",

  storageBucket: "aim-clone-5278f.firebasestorage.app",

  messagingSenderId: "978091741450",

  appId: "1:978091741450:web:bc156952eee2300e3d2af3",

  measurementId: "G-D3Q47DCZYN"

};


// Initialize Firebase
let app;
let auth;
let db;

try {
    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();

    // Enable offline persistence for Firestore
    db.enablePersistence({ synchronizeTabs: true })
        .catch((err) => {
            if (err.code === 'failed-precondition') {
                // Multiple tabs open, persistence can only be enabled in one tab at a time
            } else if (err.code === 'unimplemented') {
                // The current browser doesn't support persistence
            }
        });

} catch (error) {
    // Firebase initialization error
}

// Check if Firebase is properly configured
function isFirebaseConfigured() {
    return firebaseConfig.apiKey !== "YOUR_API_KEY" &&
           firebaseConfig.projectId !== "YOUR_PROJECT_ID";
}

// Export for use in other modules
window.FirebaseConfig = {
    app,
    auth,
    db,
    isConfigured: isFirebaseConfigured
};
