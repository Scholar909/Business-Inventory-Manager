
// Open IndexedDB
let db;
const request = indexedDB.open("JottingsDB", 1);

request.onupgradeneeded = function (event) {
    db = event.target.result;
    const store = db.createObjectStore("notes", { keyPath: "id", autoIncrement: true });
    store.createIndex("title", "title", { unique: false });
    store.createIndex("content", "content", { unique: false });
};

request.onsuccess = function (event) {
    db = event.target.result;
    displayNotes();
};

request.onerror = function () {
    console.error("IndexedDB failed to open.");
};

// Add a new note
document.getElementById("addNoteBtn").addEventListener("click", function () {
    document.getElementById("noteModal").style.display = "block";
});

document.getElementById("saveNote").addEventListener("click", function () {
    const content = document.getElementById("noteContent").value.trim();
    if (content === "") return;

    const transaction = db.transaction(["notes"], "readwrite");
    const store = transaction.objectStore("notes");

    const note = { title: content.split("\n")[0] || "Untitled", content: content };
    store.add(note);

    transaction.oncomplete = function () {
        document.getElementById("noteModal").style.display = "none";
        document.getElementById("noteContent").value = "";
        displayNotes();
    };
});

// Display notes
function displayNotes() {
    const transaction = db.transaction(["notes"], "readonly");
    const store = transaction.objectStore("notes");
    const request = store.getAll();

    request.onsuccess = function () {
        const notesList = document.getElementById("notesList");
        notesList.innerHTML = "";
        request.result.forEach((note, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + 1}</td>
                <td><a href="#" onclick="viewNote(${note.id})">${note.title}</a></td>
                <td><button onclick="deleteNote(${note.id})">Delete</button></td>
            `;
            notesList.appendChild(row);
        });
    };
}

// View note
function viewNote(id) {
    const transaction = db.transaction(["notes"], "readonly");
    const store = transaction.objectStore("notes");
    const request = store.get(id);

    request.onsuccess = function () {
        const note = request.result;
        document.getElementById("viewNoteContent").innerText = note.content;
        document.getElementById("viewNoteModal").style.display = "block";
    };
}

// Delete note
function deleteNote(id) {
    const transaction = db.transaction(["notes"], "readwrite");
    const store = transaction.objectStore("notes");
    store.delete(id);

    transaction.oncomplete = function () {
        displayNotes();
    };
}

// Search notes by content
document.getElementById("searchJottings").addEventListener("input", function () {
    const query = this.value.toLowerCase();
    const transaction = db.transaction(["notes"], "readonly");
    const store = transaction.objectStore("notes");
    const request = store.getAll();

    request.onsuccess = function () {
        const notesList = document.getElementById("notesList");
        notesList.innerHTML = "";
        request.result.forEach((note, index) => {
            if (note.content.toLowerCase().includes(query)) {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td><a href="#" onclick="viewNote(${note.id})">${note.title}</a></td>
                    <td><button onclick="deleteNote(${note.id})">Delete</button></td>
                `;
                notesList.appendChild(row);
            }
        });
    };
});

// Close modals
document.querySelector(".close").addEventListener("click", function () {
    document.getElementById("noteModal").style.display = "none";
});

document.querySelector(".close-view").addEventListener("click", function () {
    document.getElementById("viewNoteModal").style.display = "none";
});

// Clear all notes
document.getElementById("clearAll").addEventListener("click", function () {
    const transaction = db.transaction(["notes"], "readwrite");
    const store = transaction.objectStore("notes");
    store.clear();

    transaction.oncomplete = function () {
        displayNotes();
    };
});
