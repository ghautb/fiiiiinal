// Initialize categories from localStorage 
const categories = JSON.parse(localStorage.getItem('categories')) || [
    { name: "Small", weight: 100, price: 0, stock: 0, restockAlert: 10 },
    { name: "Medium", weight: 250, price: 0, stock: 0, restockAlert: 10 },
    { name: "Large", weight: 500, price: 0, stock: 0, restockAlert: 10 },
    { name: "Extra Large", weight: 1000, price: 0, stock: 0, restockAlert: 10 },
    { name: "Family Pack", weight: 2000, price: 0, stock: 0, restockAlert: 10 },
    { name: "Bulk Pack", weight: 5000, price: 0, stock: 0, restockAlert: 10 },
    { name: "Premium", weight: "custom", price: 0, stock: 0, restockAlert: 10 }
];

// Save categories and inventory to localStorage
function saveCategories() {
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('inventory', JSON.stringify(categories)); // Sync inventory as well
}

// Sync data across tabs using the storage event
window.addEventListener("storage", (event) => {
    if (event.key === "categories" || event.key === "inventory") {
        const updatedData = JSON.parse(event.newValue) || [];
        Object.assign(categories, updatedData);
        refreshPricingDisplay();
        refreshInventoryDisplay();
    }
});

// Assign a category to a product based on weight
document.getElementById("assign-category").addEventListener("click", () => {
    const weight = parseInt(document.getElementById("product-weight").value);
    let categoryAssigned = "N/A";

    if (!isNaN(weight)) {
        for (let category of categories) {
            if (category.weight !== "custom" && weight <= category.weight) {
                categoryAssigned = category.name;
                break;
            }
        }
        if (weight > 5000) categoryAssigned = "Premium";
    }

    document.getElementById("category-output").textContent = categoryAssigned;
});

// Refresh the pricing display
function refreshPricingDisplay() {
    const pricingList = document.getElementById("pricing-list");
    pricingList.innerHTML = ""; // Clear existing list

    categories.forEach(category => {
        const item = document.createElement("li");
        item.textContent = `${category.name}: $${category.price.toFixed(2)} per kg`;
        pricingList.appendChild(item);
    });
}

// Update category pricing
document.getElementById("update-price").addEventListener("click", () => {
    const selectedCategory = document.getElementById("category-select").value;
    const priceInput = parseFloat(document.getElementById("price-input").value);

    if (!isNaN(priceInput) && priceInput > 0) {
        const category = categories.find(cat => cat.name.toLowerCase() === selectedCategory.toLowerCase());
        if (category) {
            category.price = priceInput;
            saveCategories(); // Save updated data
            refreshPricingDisplay(); // Refresh display
        }
    } else {
        alert("Please enter a valid price.");
    }
});

// Refresh the inventory table
function refreshInventoryDisplay() {
    const inventoryTableBody = document.querySelector("#inventory-table tbody");
    inventoryTableBody.innerHTML = ""; // Clear current rows

    categories.forEach(category => {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = category.name;

        const stockCell = document.createElement("td");
        stockCell.textContent = category.stock;

        const statusCell = document.createElement("td");
        if (category.stock <= category.restockAlert) {
            statusCell.textContent = "Restock Needed";
            statusCell.style.color = "red";
        } else {
            statusCell.textContent = "Sufficient Stock";
            statusCell.style.color = "green";
        }

        row.appendChild(nameCell);
        row.appendChild(stockCell);
        row.appendChild(statusCell);
        inventoryTableBody.appendChild(row);
    });
}

// Update stock for a category
document.getElementById("update-stock").addEventListener("click", () => {
    const selectedCategory = document.getElementById("category-inventory-select").value;
    const stockInput = parseInt(document.getElementById("stock-level-input").value);

    if (!isNaN(stockInput) && stockInput >= 0) {
        const category = categories.find(cat => cat.name.toLowerCase() === selectedCategory.toLowerCase());
        if (category) {
            category.stock = stockInput;
            saveCategories(); // Save updated stock
            refreshInventoryDisplay(); // Refresh table
        }
    } else {
        alert("Please enter a valid stock level.");
    }
});

// Generate inventory report
document.getElementById("generate-report").addEventListener("click", () => {
    const reportContainer = document.getElementById("report-output");
    reportContainer.innerHTML = ""; // Clear previous report

    const reportContent = document.createElement("div");
    reportContent.innerHTML = `
        <h3>Inventory Report</h3>
        <ul>
            ${categories.map(category => `
                <li>
                    ${category.name}: 
                    Stock Level - ${category.stock}, 
                    Status - ${category.stock <= category.restockAlert ? "Restock Needed" : "Sufficient Stock"}
                </li>
            `).join("")}
        </ul>
    `;

    reportContainer.appendChild(reportContent);
});

// Calculate total cost
document.getElementById("calculate-cost").addEventListener("click", () => {
    const selectedCategory = document.getElementById("category-cost-select").value;
    const quantityInput = parseFloat(document.getElementById("quantity").value);

    if (isNaN(quantityInput) || quantityInput <= 0) {
        alert("Please enter a valid quantity.");
        return;
    }

    // Locate the selected category in the categories array
    const category = categories.find(cat => cat.name.toLowerCase() === selectedCategory.toLowerCase());

    if (category) {
        if (category.price > 0) {
            const totalCost = category.price * quantityInput;
            document.getElementById("total-cost").textContent = `$${totalCost.toFixed(2)}`;
        } else {
            alert("The price for the selected category is not set. Please update the price first.");
        }
    } else {
        alert("Selected category not found.");
    }
});

// Function to initiate packaging and check inventory levels
function initiatePackagingProcess() {
    const alertContainer = document.getElementById("packaging-alerts");
    alertContainer.innerHTML = ""; // Clear previous alerts

    let lowStockAlerts = [];

    categories.forEach(category => {
        if (category.stock <= category.restockAlert) {
            lowStockAlerts.push(
                `⚠️ Category "${category.name}" has low stock (${category.stock}). Minimum threshold: ${category.restockAlert}.`
            );
        }
    });

    if (lowStockAlerts.length > 0) {
        alertContainer.innerHTML = `
            <h3>Low Stock Alerts:</h3>
            <ul>${lowStockAlerts.map(alert => `<li>${alert}</li>`).join("")}</ul>
        `;
        alert("Some categories have low stock. Please restock before proceeding.");
    } else {
        alertContainer.innerHTML = `<p>All categories have sufficient stock. Packaging can proceed.</p>`;
        alert("Inventory levels are sufficient. You can proceed with the packaging process.");
    }
}

// Add an event listener for the packaging process
document.getElementById("start-packaging").addEventListener("click", initiatePackagingProcess);

// Initialize the application
refreshPricingDisplay();
refreshInventoryDisplay();
