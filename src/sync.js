import { getIndexedDBRecords, updateIndexedDBRecord } from './indexedDB.js';
import { addRecord, getRecords, updateRecord } from './firebase.js';
import { notifyUser } from './ui/notifications.js';
import { loadPets } from './ui/app.js';

export async function syncIndexedDBToFirebase() {
  const records = await getIndexedDBRecords();
  for (const record of records) {
    if (!record.synced) {
      try {
          if (record.id.startsWith('firebase-')) {
            const firebaseId = record.id.replace('firebase-', '');
            await updateRecord('pets', firebaseId, record);
          } else {
            record.synced = true;
            const newId = await addRecord('pets', record);
            await updateIndexedDBRecord(record);
            record.id = 'firebase-' + newId;
        }
          record.synced = true;
          await updateIndexedDBRecord(record);
          notifyUser('Offline data synced');
        } catch (error) {
        notifyUser('Sync error: ' + error.message);
      }
    }
  }
}

window.addEventListener('online', () => {
  syncIndexedDBToFirebase();
});

loadPets();