## Droplet

(｡･ω･｡)ﾉ💧 A mobile app that pairs with a hardware attachment to track hydration. Attach any water bottle on the attachment and it measures weight changes to log water intake in real time. If hydration goals aren't met, the app can restrict usage of selected apps on your phone

### Tech Stack

- **Frontend:** React Native (Expo)
- **Authentication:** Firebase 
- **Database:** MongoDB Atlas
- **Hardware:** Load cell sensor
- **Backend:** Express.js/Node.js (hosted on Render)
- **Development:** VS Code, Expo, Xcode

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

### Setup

1. Create a `.env` in the project root
2. Add your Firebase credentials (see above)
3. Set up the backend by creating a `.env` file in the `server/` directory:
   ```
   MONGO_URI=your_mongodb_connection_string
   PORT=3001
   ```
   See `.env.example` files in the project root and `server/` directory for reference templates

### Running the App

**Note:** This app uses a BLE library for the hardware sensor, which is not supported by Expo Go. You must build and run a development client on a device

#### Setup

```bash
npm install
```

#### Development Workflow

1. Connect your iPhone to your Mac
2. In your terminal, start the Expo development server:
   ```bash
   npx expo start --dev-client --host lan
   ```
3. Open the project in Xcode
4. In Xcode, press the **Play** button to build and run the app on your phone
5. The app will connect to the dev server via your local network

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

### Resources

- [How to Build a Bluetooth Low Energy Powered Expo App](https://expo.dev/blog/how-to-build-a-bluetooth-low-energy-powered-expo-app) (guide on setting up BLE with Expo)
