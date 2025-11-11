import { getIndexedDBRecords, updateIndexedDBRecord } from './indexedDB.js';
import { addRecord, getRecords, updateRecord } from './firebase.js';
import { notifyUser } from './ui/notifications.js';

export async function syncIndexedDBToFirebase() {
  let new_records = [];
  const records = await getIndexedDBRecords();
  const onlineRecords = await getRecords('pets');
  for (const record of onlineRecords) {
    new_records.push(record.id);
  }
  for (const record of records) {
    if (!record.synced) {
      try {
        onlineRecords = await getRecords('pets');
        for (const rec of onlineRecords) {
          if (!new_records.includes(rec.id)) {
            new_records.push(rec.id);
          }
        }
        if (!new_records.includes(record.id)) {
          if (record.id.startsWith('firebase-')) {
            const firebaseId = record.id.replace('firebase-', '');
            await updateRecord('pets', firebaseId, record);
          } else {
            record.synced = true;
            new_records.push(record.id);
            const newId = await addRecord('pets', record);
            await updateIndexedDBRecord(record);
            record.id = 'firebase-' + newId;
          }
          record.synced = true;
          await updateIndexedDBRecord(record);
          notifyUser('Offline data synced');
        }
      } catch (error) {
        notifyUser('Sync error: ' + error.message);
      }
    }
  }
}

window.addEventListener('online', () => {
  syncIndexedDBToFirebase();
});