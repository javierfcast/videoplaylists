import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom'
import firebase from 'firebase';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

firebase.initializeApp({
  // Initialize Firebase
  apiKey: "AIzaSyC414ldiHXtTTh6ewYAKNYnK4NYyE8TRrY",
  authDomain: "video-playlists-3a52b.firebaseapp.com",
  databaseURL: "https://video-playlists-3a52b.firebaseio.com",
  projectId: "video-playlists-3a52b",
  storageBucket: "video-playlists-3a52b.appspot.com",
  messagingSenderId: "248783838381"
});

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
, document.getElementById('root'));
registerServiceWorker();
