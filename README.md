# Pet Explorer PWA

Pet Explorer is a Progressive Web App prototype designed with Materialize CSS.

Firebase and IndexedDB:
Firebase handles backend services like database and storage, while IndexedDB stores data locally for offline use. PWAs save user updates in IndexedDB when offline and sync them to Firebase once connected to stay consistent.

CRUD operations:
In online mode, CRUD operations interact directly with Firebase through its JavaScript APIs, with the data also in IndexedDB for faster access and backup. When offline, IndexedDB stores these changes then sends them to Firebase when reconnected to the Internet.

Synchronization process and Firebase IDs:
When the app goes online, it scans IndexedDB for unsynced records. If a record’s ID starts with “firebase-”, it updates the corresponding Firebase entry. Otherwise, it creates a new Firebase record, gets the generated ID, and updates the local record. After syncing, this process runs automatically on reconnect to keep data consistent.

(For now, pressing the "Save Pet" button will send and store the data to Firebase/IndexedDB, so it can be verified in the console and in Firebase data. Pet details will be displayed on the page in future versions of this application).
