
// Open IndexedDB
let db;
const request = indexedDB.open("ProductDB", 1);

request.onupgradeneeded = function (event) {
    let db = event.target.result;
    if (!db.objectStoreNames.contains("products")) {
        db.createObjectStore("products", { keyPath: "id", autoIncrement: true });
    }
};

request.onsuccess = function (event) {
    db = event.target.result;
    loadProducts();
};

// Open product form
function openProductForm() {
    document.getElementById("productForm").style.display = "block";
}

// Close product form
function closeProductForm() {
    document.getElementById("productForm").style.display = "none";
}

// Save product
function saveProduct() {
    const name = document.getElementById("productName").value.trim();
    const category = document.getElementById("productCategory").value.trim();
    const price = document.getElementById("productPrice").value.trim();
    const description = document.getElementById("productDescription").value.trim();
    const imageInput = document.getElementById("productImage");
    let image = "";

    if (imageInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = function (e) {
            image = e.target.result;
            storeProduct(name, category, price, description, image);
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        storeProduct(name, category, price, description, image);
    }
}

// Store product in IndexedDB
function storeProduct(name, category, price, description, image) {
    if (!name || !category || !price) {
        alert("Name, category, and price are required.");
        return;
    }

    const transaction = db.transaction("products", "readwrite");
    const store = transaction.objectStore("products");
    store.add({ name, category, price, description, image });

    transaction.oncomplete = function () {
        closeProductForm();
        loadProducts();
    };
}

// Load products
function loadProducts() {
    const transaction = db.transaction("products", "readonly");
    const store = transaction.objectStore("products");
    const request = store.getAll();

    request.onsuccess = function () {
        displayProducts(request.result);
    };
}

// Display products in table
function displayProducts(products) {
    const tableBody = document.getElementById("productList");
    tableBody.innerHTML = "";

    let totalProducts = 0;
    let categories = new Set();

    products.forEach((product, index) => {
        totalProducts++;
        categories.add(product.category);

        let row = `<tr>
            <td>${index + 1}</td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${product.price}</td>
            <td>
                <button onclick="viewProduct(${product.id})">View</button>
                <button onclick="editProduct(${product.id})">Edit</button>
                <button onclick="deleteProduct(${product.id})">Delete</button>
            </td>
        </tr>`;
        tableBody.innerHTML += row;
    });

    document.getElementById("totalProducts").textContent = totalProducts;
    document.getElementById("totalCategories").textContent = categories.size;
}

// View product details
function viewProduct(id) {
    const transaction = db.transaction("products", "readonly");
    const store = transaction.objectStore("products");
    const request = store.get(id);

    request.onsuccess = function () {
        const product = request.result;
        if (product) {
            document.getElementById("viewImage").src = product.image || "default.jpg";
            document.getElementById("viewName").textContent = product.name;
            document.getElementById("viewCategory").textContent = product.category;
            document.getElementById("viewPrice").textContent = product.price;
            document.getElementById("viewDescription").textContent = product.description;
            document.getElementById("productView").style.display = "block";
        }
    };
}

// Close product view modal
function closeProductView() {
    document.getElementById("productView").style.display = "none";
}

// Open edit product form
function editProduct(id) {
    const transaction = db.transaction("products", "readonly");
    const store = transaction.objectStore("products");
    const request = store.get(id);

    request.onsuccess = function () {
        const product = request.result;
        if (product) {
            document.getElementById("editProductName").value = product.name;
            document.getElementById("editProductCategory").value = product.category;
            document.getElementById("editProductPrice").value = product.price;
            document.getElementById("editProductDescription").value = product.description;
            document.getElementById("editProductForm").dataset.id = product.id;
            document.getElementById("editProductForm").style.display = "block";
        }
    };
}

// Save edited product
function saveEditedProduct() {
    const id = Number(document.getElementById("editProductForm").dataset.id);
    const name = document.getElementById("editProductName").value.trim();
    const category = document.getElementById("editProductCategory").value.trim();
    const price = document.getElementById("editProductPrice").value.trim();
    const description = document.getElementById("editProductDescription").value.trim();

    const transaction = db.transaction("products", "readwrite");
    const store = transaction.objectStore("products");
    const request = store.get(id);

    request.onsuccess = function () {
        let product = request.result;
        product.name = name;
        product.category = category;
        product.price = price;
        product.description = description;
        store.put(product);
    };

    transaction.oncomplete = function () {
        closeEditForm();
        loadProducts();
    };
}

// Close edit form
function closeEditForm() {
    document.getElementById("editProductForm").style.display = "none";
}

// Delete product with confirmation
function deleteProduct(id) {
    if (confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
        let transaction = db.transaction(["products"], "readwrite");
        let store = transaction.objectStore("products");
        store.delete(id);

        transaction.oncomplete = function () {
            loadProducts();
        };
    }
}

// Search function
function searchProducts() {
    const query = document.getElementById("productSearch").value.toLowerCase();
    
    const transaction = db.transaction("products", "readonly");
    const store = transaction.objectStore("products");
    const request = store.getAll();

    request.onsuccess = function () {
        let filteredProducts = request.result.filter(product =>
            product.name.toLowerCase().includes(query) || 
            product.category.toLowerCase().includes(query)
        );
        displayProducts(filteredProducts);
    };
}