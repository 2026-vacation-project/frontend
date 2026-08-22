/* global firebase, importScripts */

const params = new URL(self.location.href).searchParams;
const firebaseConfig = {
    apiKey: params.get('apiKey'),
    authDomain: params.get('authDomain'),
    projectId: params.get('projectId'),
    storageBucket: params.get('storageBucket'),
    messagingSenderId: params.get('messagingSenderId'),
    appId: params.get('appId'),
};

if (firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.messagingSenderId && firebaseConfig.appId) {
    importScripts('https://www.gstatic.com/firebasejs/12.18.0/firebase-app-compat.js');
    importScripts('https://www.gstatic.com/firebasejs/12.18.0/firebase-messaging-compat.js');
    firebase.initializeApp(firebaseConfig);
    firebase.messaging();
}
