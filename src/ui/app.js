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

    //Load Pets by default
    loadPets();
  });
});

export async function loadPets() {
  const petContainer = document.querySelector(".petcoll");
  petContainer.innerHTML = "<div class=\"card-panel white row valign-wrapper\" data-id=\"no_pet_yet\"><div class=\"col s2\"><i class=\"large material-icons prefix\">pets</i></div><div class=\"pet-detail col s8\"><h5 class=\"pet-title black-text\">No loving pets yet</h5><div class=\"pet-type\">Please submit your pet's details to get started</div></div><div class=\"col s2 right-align\">&nbsp;</div></div>";

  if (navigator.onLine) {
    const firebasePets = await getRecords('pets');
    for (const pet of firebasePets) {
      displayPet(pet);
    }
  } else {
    const pets = await getIndexedDBRecords();
    pets.forEach((pet) => {
      displayPet(pet);
    });
  }
}

function displayPet(pet) {
  const petContainer = document.querySelector(".petcoll");

  const emptypetnest = petContainer.querySelector(`[data-id="no_pet_yet"]`);
  if (emptypetnest) {
    emptypetnest.remove();
  }

  // Check if the pet already exists in the UI and remove it
  const existingPet = petContainer.querySelector(`[data-id="pet_${pet.id}"]`);
  if (existingPet) {
    existingPet.remove();
  }

  // Create new pet HTML and add it to the container
  const html = `
    <div class="card-panel white row valign-wrapper" data-id="pet_${pet.id}">
      <div class="col s2">
        <i class="large material-icons prefix">pets</i>
      </div>
      <div class="pet-detail col s8">
        <h5 class="pet-title black-text">${pet.name}</h5>
        <div class="pet-type">${pet.type}</div>
      </div>
      <div class="col s2 right-align">
        <button class="pet-delete btn-flat delete-action" aria-label="Delete pet">
          <i class="large material-icons black-text-darken-1" style="font-size: 30px">delete_outline</i>
        </button>
      </div>
    </div>
  `;
  petContainer.insertAdjacentHTML("beforeend", html);

  const deleteButton = petContainer.querySelector(
    `[data-id="pet_${pet.id}"] .pet-delete`
  );
  deleteButton.addEventListener("click", () => deletePet(pet.id));

}

function deletePet(pet) {
  const petContainer = document.querySelector(".petcoll");
    // Check if the pet already exists in the UI and remove it
  const existingPet = petContainer.querySelector(`[data-id="pet_${pet}"]`);
  if (existingPet) {
    existingPet.remove();
  }
  deleteRecord('pets',pet);
  deleteIndexedDBRecord(pet);
  if (pet=="Licorice")
  {
      petContainer.innerHTML = "<div class=\"card-panel white row valign-wrapper\" data-id=\"no_pet_yet\"><div class=\"col s2\"><i class=\"large material-icons prefix\">pets</i></div><div class=\"pet-detail col s8\"><h5 class=\"pet-title black-text\">No loving pets yet</h5><div class=\"pet-type\">Please submit your pet's details to get started</div></div><div class=\"col s2 right-align\">&nbsp;</div></div>";
  }
  notifyUser('R.I.P. ' + pet + ', Are you happy? Now GO AWAY!');
}