
// Open IndexedDB
let db;
const request = indexedDB.open("CreditorsDB", 1);

request.onupgradeneeded = function (event) {
    db = event.target.result;
    if (!db.objectStoreNames.contains("creditors")) {
        db.createObjectStore("creditors", { keyPath: "id", autoIncrement: true });
    }
    if (!db.objectStoreNames.contains("paidCreditors")) {
        db.createObjectStore("paidCreditors", { keyPath: "id", autoIncrement: true });
    }
};

request.onsuccess = function (event) {
    db = event.target.result;
    loadCreditors();
};

request.onerror = function (event) {
    console.error("Database error: ", event.target.error);
};

// Open Add Creditor Form
function openCreditorForm() {
    document.getElementById("creditorForm").style.display = "block";
}

// Close Add Creditor Form
function closeCreditorForm() {
    document.getElementById("creditorForm").style.display = "none";
}

// Save Creditor
function saveCreditor() {
    let name = document.getElementById("creditorName").value.trim();
    let number = document.getElementById("creditorNumber").value.trim();
    let amount = document.getElementById("creditorAmount").value.trim();
    let date = document.getElementById("creditorDate").value.trim();
    let description = document.getElementById("creditorDescription").value.trim();

    if (!name || !number || !amount || !date || !description) {
        alert("All fields are required!");
        return;
    }

    let newCreditor = { name, number, amount, date, description };

    let transaction = db.transaction(["creditors"], "readwrite");
    let store = transaction.objectStore("creditors");
    store.add(newCreditor);

    transaction.oncomplete = function () {
        loadCreditors();
        closeCreditorForm();
    };
}

// Load Creditors List
function loadCreditors() {
    let transaction = db.transaction(["creditors"], "readonly");
    let store = transaction.objectStore("creditors");
    let request = store.getAll();

    request.onsuccess = function () {
        let creditors = request.result;
        let table = document.getElementById("creditorList");
        table.innerHTML = "";
        document.getElementById("totalCreditors").textContent = creditors.length;

        creditors.forEach((creditor, index) => {
            let row = `<tr>
                <td>${index + 1}</td>
                <td>${creditor.name}</td>
                <td>${creditor.number}</td>
                <td>${creditor.amount}</td>
                <td>${creditor.date}</td>
                <td>
                    <button onclick="viewCreditor(${creditor.id})">View</button>
                    <button onclick="editCreditor(${creditor.id})">Edit</button>
                    <button onclick="deleteCreditor(${creditor.id})">Delete</button>
                    <button onclick="markAsPaid(${creditor.id})">Mark as Paid</button>
                </td>
            </tr>`;
            table.innerHTML += row;
        });
    };
}

// View Creditor
function viewCreditor(id) {
    let transaction = db.transaction(["creditors"], "readonly");
    let store = transaction.objectStore("creditors");
    let request = store.get(id);

    request.onsuccess = function () {
        let creditor = request.result;
        document.getElementById("viewCreditorName").textContent = creditor.name;
        document.getElementById("viewCreditorNumber").textContent = creditor.number;
        document.getElementById("viewCreditorAmount").textContent = creditor.amount;
        document.getElementById("viewCreditorDate").textContent = creditor.date;
        document.getElementById("viewCreditorDescription").textContent = creditor.description;
        document.getElementById("creditorView").style.display = "block";
    };
}

// Close View Creditor Modal
function closeCreditorView() {
    document.getElementById("creditorView").style.display = "none";
}

// Edit Creditor
function editCreditor(id) {
    let transaction = db.transaction(["creditors"], "readonly");
    let store = transaction.objectStore("creditors");
    let request = store.get(id);

    request.onsuccess = function () {
        let creditor = request.result;
        document.getElementById("editCreditorName").value = creditor.name;
        document.getElementById("editCreditorNumber").value = creditor.number;
        document.getElementById("editCreditorAmount").value = creditor.amount;
        document.getElementById("editCreditorDate").value = creditor.date;
        document.getElementById("editCreditorDescription").value = creditor.description;

        document.getElementById("editCreditorForm").style.display = "block";
        document.getElementById("editCreditorForm").dataset.id = id;
    };
}

// Save Edited Creditor
function saveEditedCreditor() {
    let id = parseInt(document.getElementById("editCreditorForm").dataset.id);
    let name = document.getElementById("editCreditorName").value.trim();
    let number = document.getElementById("editCreditorNumber").value.trim();
    let amount = document.getElementById("editCreditorAmount").value.trim();
    let date = document.getElementById("editCreditorDate").value.trim();
    let description = document.getElementById("editCreditorDescription").value.trim();

    let transaction = db.transaction(["creditors"], "readwrite");
    let store = transaction.objectStore("creditors");
    store.put({ id, name, number, amount, date, description });

    transaction.oncomplete = function () {
        loadCreditors();
        document.getElementById("editCreditorForm").style.display = "none";
    };
}

function closeEditedCreditorForm() {
    document.getElementById("editCreditorForm").style.display = "none";
}

// Delete Creditor (Updated)
function deleteCreditor(id) {
    if (confirm("Are you sure you want to delete this creditor? This action cannot be undone.")) {
        let transaction = db.transaction(["creditors"], "readwrite");
        let store = transaction.objectStore("creditors");
        let request = store.delete(Number(id)); // Ensure ID is an integer

        request.onsuccess = function () {
            console.log("Creditor deleted successfully.");
            loadCreditors();
        };

        request.onerror = function (event) {
            console.error("Error deleting creditor:", event.target.error);
        };
    }
}

// Mark as Paid
function markAsPaid(id) {
    let transaction = db.transaction(["creditors"], "readwrite");
    let store = transaction.objectStore("creditors");
    let request = store.get(id);

    request.onsuccess = function () {
        let creditor = request.result;
        creditor.datePaid = new Date().toISOString().split("T")[0];

        let paidTransaction = db.transaction(["paidCreditors"], "readwrite");
        let paidStore = paidTransaction.objectStore("paidCreditors");
        paidStore.add(creditor);

        store.delete(id);
        paidTransaction.oncomplete = function () {
            loadCreditors();
        };
    };
}

// Search Creditors
function searchCreditors() {
    const query = document.getElementById("creditorSearch").value.toLowerCase();

    const transaction = db.transaction("creditors", "readonly");
    const store = transaction.objectStore("creditors");
    const request = store.getAll();

    request.onsuccess = function () {
        let filteredCreditors = request.result.filter(creditor =>
            creditor.name.toLowerCase().includes(query)
        );

        let table = document.getElementById("creditorList");
        table.innerHTML = "";
        document.getElementById("totalCreditors").textContent = filteredCreditors.length;

        filteredCreditors.forEach((creditor, index) => {
            let row = `<tr>
                <td>${index + 1}</td>
                <td>${creditor.name}</td>
                <td>${creditor.number}</td>
                <td>${creditor.amount}</td>
                <td>${creditor.date}</td>
                <td>
                    <button onclick="viewCreditor(${creditor.id})">View</button>
                    <button onclick="editCreditor(${creditor.id})">Edit</button>
                    <button onclick="deleteCreditor(${creditor.id})">Delete</button>
                    <button onclick="markAsPaid(${creditor.id})">Mark as Paid</button>
                </td>
            </tr>`;
            table.innerHTML += row;
        });
    };
}
