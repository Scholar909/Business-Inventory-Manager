
let db;
const request = indexedDB.open("CreditorsDB", 1);

request.onsuccess = function (event) {
    db = event.target.result;
    loadPaidCreditors();
};

request.onerror = function () {
    console.error("Failed to open IndexedDB.");
};

// Load Paid Creditors List
function loadPaidCreditors(searchTerm = "") {
    let transaction = db.transaction(["paidCreditors"], "readonly");
    let store = transaction.objectStore("paidCreditors");
    let request = store.getAll();

    request.onsuccess = function () {
        let paidCreditors = request.result || [];
        let table = document.getElementById("paidCreditorsList");
        table.innerHTML = ""; // Clear previous entries
        document.getElementById("totalPaidCreditors").textContent = paidCreditors.length;

        paidCreditors.forEach((creditor, index) => {
            if (searchTerm && !creditor.name.toLowerCase().includes(searchTerm.toLowerCase())) return;

            let row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${creditor.name}</td>
                <td>${creditor.number}</td>
                <td>${creditor.amount}</td>
                <td>${creditor.datePaid}</td>
                <td>
                    <button onclick="viewPaidCreditor(${creditor.id})">View</button>
                    <button onclick="deletePaidCreditor(${creditor.id})">Delete</button>
                </td>
            `;
            table.appendChild(row);
        });
    };
}

// Search Paid Creditors
function searchPaidCreditors() {
    let searchValue = document.getElementById("paidCreditorSearch").value.trim();
    loadPaidCreditors(searchValue);
}

// View Paid Creditor Details
function viewPaidCreditor(id) {
    let transaction = db.transaction(["paidCreditors"], "readonly");
    let store = transaction.objectStore("paidCreditors");
    let request = store.get(id);

    request.onsuccess = function () {
        let creditor = request.result;
        if (!creditor) return;

        document.getElementById("viewPaidCreditorName").textContent = creditor.name;
        document.getElementById("viewPaidCreditorNumber").textContent = creditor.number;
        document.getElementById("viewPaidCreditorAmount").textContent = creditor.amount;
        document.getElementById("viewPaidCreditorDateBurrowed").textContent = creditor.date; // FIXED
        document.getElementById("viewPaidCreditorDate").textContent = creditor.datePaid;
        document.getElementById("viewPaidCreditorDescription").textContent = creditor.description;

        document.getElementById("paidCreditorView").style.display = "block";
    };
}

// Close View Modal
function closePaidView() {
    document.getElementById("paidCreditorView").style.display = "none";
}

// Delete Paid Creditor
function deletePaidCreditor(id) {
    if (confirm("Are you sure you want to delete this paid creditor? This action cannot be undone.")) {
        let transaction = db.transaction(["paidCreditors"], "readwrite");
        let store = transaction.objectStore("paidCreditors");
        let deleteRequest = store.delete(id);

        deleteRequest.onsuccess = function () {
            loadPaidCreditors();
        };

        deleteRequest.onerror = function () {
            console.error("Failed to delete the paid creditor.");
        };
    }
}

// Ensure Data Persists After Refresh
document.addEventListener("DOMContentLoaded", () => {
    request.onsuccess = function (event) {
        db = event.target.result;
        loadPaidCreditors();
    };
});