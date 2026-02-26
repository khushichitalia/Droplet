## Droplet 

(｡･ω･｡)ﾉ A mobile app that pairs with a load cell to track hydration. Place any water bottle on the load cell and it measures weight changes to log water intake in real time. If hydration goals aren't met, the app can restrict usage of selected apps on your phone

### Tech Stack

- **Frontend:** React Native (Expo)
- **Auth:** Firebase 
- **Database:** MongoDB
- **Hardware:** Load cell sensor

### Firebase Setup

Firebase is initialized in `lib/firebase.js` and is used for authentication (email/password sign-up, login, password reset)

Create a `.env` file in the project root with your Firebase project credentials:

```
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

### Running the App

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `i` / `a` to open in the iOS Simulator or Android Emulator

### Screens

#### Auth

- **Login** (`(auth)/login`) - email/password sign-in via Firebase 
- **Sign Up** (`(auth)/signup`) - account creation with Firebase 
- **Forgot Password** (`(auth)/forgot-password`) - sends a password-reset email through Firebase

#### Tabs
- **Home** (`tabs/homepage`) - animated water-drop progress visual, current intake vs. goal, settings and sign-out
- **Dashboard** (`tabs/dashboard`) - week / month / year bar charts, daily streak, circular progress rings
- **Screen Time** (`tabs/screentime`) - select apps (Instagram, TikTok, Snapchat, Messages) and set time limits tied to hydration goals
- **Map** (`tabs/map`) - nearby water refill stations with reviews, displayed on a map
