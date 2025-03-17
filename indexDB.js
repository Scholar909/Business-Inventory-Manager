
// Open IndexedDB and create necessary object stores
let db;

function openDatabase() {
    const request = indexedDB.open("ProductDB", 1);

    request.onupgradeneeded = function (event) {
        db = event.target.result;

        if (!db.objectStoreNames.contains("products")) {
            db.createObjectStore("products", { keyPath: "id", autoIncrement: true });
        }
        if (!db.objectStoreNames.contains("creditors")) {
            db.createObjectStore("creditors", { keyPath: "id", autoIncrement: true });
        }
    };

    request.onsuccess = function (event) {
        db = event.target.result;
        console.log("Database opened successfully");
    };

    request.onerror = function (event) {
        console.error("Database error: ", event.target.error);
    };
}

// Add a product
function addProduct(product, callback) {
    let transaction = db.transaction(["products"], "readwrite");
    let objectStore = transaction.objectStore("products");
    let addRequest = objectStore.add(product);

    addRequest.onsuccess = function () {
        console.log("Product added successfully");
        if (callback) callback();
    };

    addRequest.onerror = function (event) {
        console.error("Failed to add product", event.target.error);
    };
}

// Delete a product
function deleteProduct(id, callback) {
    if (!id) {
        console.error("Invalid ID provided for deletion");
        return;
    }

    let transaction = db.transaction(["products"], "readwrite");
    let objectStore = transaction.objectStore("products");
    let deleteRequest = objectStore.delete(Number(id));

    deleteRequest.onsuccess = function () {
        console.log(`Product with ID ${id} deleted successfully`);
        if (callback) callback();
    };

    deleteRequest.onerror = function (event) {
        console.error("Failed to delete product", event.target.error);
    };
}

// Add a creditor
function addCreditor(creditor, callback) {
    let transaction = db.transaction(["creditors"], "readwrite");
    let objectStore = transaction.objectStore("creditors");
    let addRequest = objectStore.add(creditor);

    addRequest.onsuccess = function () {
        console.log("Creditor added successfully");
        if (callback) callback();
    };

    addRequest.onerror = function (event) {
        console.error("Failed to add creditor", event.target.error);
    };
}

// Delete a creditor
function deleteCreditor(id, callback) {
    if (!id) {
        console.error("Invalid ID provided for deletion");
        return;
    }

    let transaction = db.transaction(["creditors"], "readwrite");
    let objectStore = transaction.objectStore("creditors");
    let deleteRequest = objectStore.delete(Number(id));

    deleteRequest.onsuccess = function () {
        console.log(`Creditor with ID ${id} deleted successfully`);
        if (callback) callback();
    };

    deleteRequest.onerror = function (event) {
        console.error("Failed to delete creditor", event.target.error);
    };
}

// Initialize database on page load
document.addEventListener('DOMContentLoaded', openDatabase);
