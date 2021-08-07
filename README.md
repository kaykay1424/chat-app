# Polychat
Polychat is a mobile app built with React Native that gives users the option to not only chat in different languages with others but share images and their location as well. There are 4 chat rooms for users to chat in English, Spanish, Chinese, and French.

## How to Get Started
1. To set up the developer environment, you need Expo and the latest LTS version of Node.
    - If you have nvm installed run `nvm install --lts` to install the latest version of Node or you can [download the latest version of Node](https://nodejs.org/en/).
    - Run `npm install expo-cli --global` to install Expo
1. Download the Expo app on your phone. If you are using a simulator/emulator skip to step 11. 
1. Create [Expo account](https://expo.io/signup)
1. Login to Expo account
1. Clone the repo or download the zip file
1. Navigate to the chat-app folder in your terminal (run `cd location of chat-app`) if you are not already in it
1. Run `npm install` to install the necessary dependencies
1. Run `npm start` or `expo start` to start Expo. This will open a new browser tab with an HTTP server that will transpile JavaScript code using Babel and then serve it to the Expo app.
1. Make sure your phone and computer are on the same WiFi network and open the Expo app on your phone.
1. If the project is listed under “Recently in Development”, click on it. If not, you can scan the QR code in the HTTP server tab in your browser or terminal to open the project. You can also click "Send link with email" in the browser tab to open the project.
1. **Simulator/Emulator**: In the browser tab click "Run on Android device/emulator" or "Run on iOS simulator" to open the project.

## Necessary Packages
- expo-cli
- react-native-gifted-chat
- firebase

## Database
The database used for this project is the [Firestore database](https://firebase.google.com/). Be sure to edit the firebase config settings (`const firebaseConfig`) with the settings for your firestore database in the Chat.js file.
`{
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: ""
  }` 

## List of Technologies
- React Native
- Firebase





