import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  enableIndexedDbPersistence,
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDREE4wNWhsr1ICSKOlFdBGvPfC07xHk5c",
  authDomain: "petexplorerpwa.firebaseapp.com",
  projectId: "petexplorerpwa",
  storageBucket: "petexplorerpwa.firebasestorage.app",
  messagingSenderId: "20850172331",
  appId: "1:20850172331:web:df66caba0b270bc70432ee",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore and enable offline persistence
const firestore = getFirestore(app);
enableIndexedDbPersistence(firestore).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn("Multiple tabs open, offline persistence can only be enabled in one tab at a time.");
  } else if (err.code === 'unimplemented') {
    console.warn("The current browser does not support all features required to enable offline persistence.");
  }
});

// CRUD Functions using modular syntax

export async function addRecord(collectionName, data) {
  const colRef = collection(firestore, collectionName);
  const docRef = await addDoc(colRef, data);
  return docRef.id;
}

export async function getRecords(collectionName) {
  const colRef = collection(firestore, collectionName);
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateRecord(collectionName, id, data) {
  const docRef = doc(firestore, collectionName, id);
  await updateDoc(docRef, data);
}

export async function deleteRecord(collectionName, id) {
  const docRef = doc(firestore, collectionName, id);
  await deleteDoc(docRef);
}

export { firestore };