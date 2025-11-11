import { getIndexedDBRecords, updateIndexedDBRecord } from './indexedDB.js';
import { addRecord, getRecords, updateRecord } from './firebase.js';
import { notifyUser } from './ui/notifications.js';

export async function syncIndexedDBToFirebase() {
  let new_records = [];
  const records = await getIndexedDBRecords();
  for (const record of records) {
    if (!record.synced) {
      try {
          if (record.id.startsWith('firebase-')) {
            const firebaseId = record.id.replace('firebase-', '');
            await updateRecord('pets', firebaseId, record);
          } else {
            record.synced = true;
            new_records = refreshOnlineEntries();
        if (!new_records.includes(record.id)) {
            new_records.push(record.id);
            const newId = await addRecord('pets', record);
            await updateIndexedDBRecord(record);
            record.id = 'firebase-' + newId;
          }
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

export async function refreshOnlineEntries() {
  let new_records = [];
  new_records.push('anchor');
  try{
  let onlineRecords = await getRecords('pets');
  for (const record of onlineRecords) {
    new_records.push(record.id);
  }
}
  finally {
     return new_records;
  }
}

window.addEventListener('online', () => {
  syncIndexedDBToFirebase();
});