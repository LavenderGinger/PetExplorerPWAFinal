import { addRecord, getRecords, updateRecord, deleteRecord } from '../firebase.js';
import { addIndexedDBRecord, getIndexedDBRecords, updateIndexedDBRecord, deleteIndexedDBRecord } from '../indexedDB.js';
import { notifyUser } from './notifications.js';
import { syncIndexedDBToFirebase } from '../sync.js';

export async function createRecord(data) {
  if (navigator.onLine) {
      try {
        data.synced = true;
        const id = await addRecord('pets', data);
        return id;
      } catch (error) {
        data.synced = false;
        await addIndexedDBRecord(data);
      }
      } else {
    data.synced = false;
    data.id = 'local-'+Math.floor(Math.random()*10000);
    await addIndexedDBRecord(data);
  }
  }


// Read all records from online or offline storage
export async function readRecords() {
  if (navigator.onLine) {
    try {
      return await getRecords('pets');
    } catch (error) {
      return await getIndexedDBRecords();
    }
  } else {
    return await getIndexedDBRecords();
  }
}

// Update a record by ID (online or offline)
export async function updateRecordById(id, data) {
  if (navigator.onLine) {
    try {
      await updateRecord('pets', id, data);
    } catch (error) {
      data.id = id;
      data.synced = false;
      await updateIndexedDBRecord(data);
    }
  } else {
    data.id = id;
    data.synced = false;
    await updateIndexedDBRecord(data);
  }
}

// Delete a record by ID (online or offline)
export async function deleteRecordById(id) {
  if (navigator.onLine) {
    try {
      await deleteRecord('pets', id);
    } catch (error) {
      await deleteIndexedDBRecord(id);
    }
  } else {
    await deleteIndexedDBRecord(id);
  }
}

// DOM load event for form interaction
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('petForm');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const petName = form.petName.value.trim();
    const petType = form.petType.value.trim();

    if (petName && petType) {
      try {
        await createRecord({ name: petName, type: petType, synced: false });
        form.reset();
      } catch (err) {
      }
    } else {
      notifyUser('Please fill out both fields.');
    }
  });
});

