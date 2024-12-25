// Farmers' Information Management with Enhanced localStorage Integration
const farmers = JSON.parse(localStorage.getItem('farmers')) || [];
const purchases = JSON.parse(localStorage.getItem('purchases')) || [];

// Save farmers and purchases to localStorage
function saveFarmersToLocalStorage() {
    localStorage.setItem('farmers', JSON.stringify(farmers));
}

function savePurchasesToLocalStorage() {
    localStorage.setItem('purchases', JSON.stringify(purchases));
}

// Synchronize data across tabs
window.addEventListener("storage", (event) => {
    if (event.key === "farmers") {
        displayFarmers(JSON.parse(event.newValue) || []);
    } else if (event.key === "purchases") {
        displayPurchases(JSON.parse(event.newValue) || []);
    }
});

// Display farmers in a table
function displayFarmers(farmersList) {
    const farmerContainer = document.getElementById('farmer-container');
    farmerContainer.innerHTML = '';

    if (farmersList.length === 0) {
        farmerContainer.innerHTML = '<p>No farmers found.</p>';
        return;
    }

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Farmer ID</th>
                <th>Name</th>
                <th>Contact</th>
                <th>Location</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            ${farmersList.map(farmer => `
                <tr>
                    <td>${farmer.farmerId}</td>
                    <td>${farmer.name}</td>
                    <td>${farmer.contactDetails}</td>
                    <td>${farmer.location}</td>
                    <td>
                        <button onclick="editFarmer('${farmer.farmerId}')">Edit</button>
                        <button onclick="deleteFarmer('${farmer.farmerId}')">Delete</button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;
    farmerContainer.appendChild(table);
}

// Add or update a farmer
function saveFarmer() {
    const farmerId = document.getElementById('farmer-id').value.trim();
    const name = document.getElementById('farmer-name').value.trim();
    const contactDetails = document.getElementById('contact-details').value.trim();
    const location = document.getElementById('location').value.trim();

    if (!farmerId || !name || !contactDetails || !location) {
        alert('Please fill in all fields.');
        return;
    }

    const existingFarmerIndex = farmers.findIndex(f => f.farmerId === farmerId);
    if (existingFarmerIndex !== -1) {
        alert('Farmer ID must be unique.');
        return;
    }

    farmers.push({ farmerId, name, contactDetails, location });
    alert('Farmer added successfully.');
    saveFarmersToLocalStorage();
    clearFarmerForm();
    displayFarmers(farmers);
}

// Clear the farmer form
function clearFarmerForm() {
    document.getElementById('farmer-id').value = '';
    document.getElementById('farmer-name').value = '';
    document.getElementById('contact-details').value = '';
    document.getElementById('location').value = '';
}

// Search farmers by name or location and display in a table
function searchFarmers() {
    const searchField = document.getElementById('search-field').value.trim().toLowerCase();
    const results = farmers.filter(farmer =>
        farmer.name.toLowerCase().includes(searchField) ||
        farmer.location.toLowerCase().includes(searchField)
    );
    displayFarmers(results);
}

// Delete a farmer
function deleteFarmer(farmerId) {
    const farmerIndex = farmers.findIndex(f => f.farmerId === farmerId);
    if (farmerIndex !== -1) {
        farmers.splice(farmerIndex, 1);
        saveFarmersToLocalStorage();
        alert('Farmer deleted successfully.');
        searchFarmers();
    }
}

// Edit a farmer
function editFarmer(farmerId) {
    const farmer = farmers.find(f => f.farmerId === farmerId);
    if (farmer) {
        document.getElementById('farmer-id').value = farmer.farmerId;
        document.getElementById('farmer-name').value = farmer.name;
        document.getElementById('contact-details').value = farmer.contactDetails;
        document.getElementById('location').value = farmer.location;
    }
}

// Save a new purchase
function savePurchase() {
    const purchaseId = document.getElementById('purchase-id').value.trim();
    const farmerId = document.getElementById('farmer-id-purchase').value.trim();
    const purchaseDate = document.getElementById('purchase-date').value.trim();
    const quantity = parseFloat(document.getElementById('quantity').value.trim());
    const price = parseFloat(document.getElementById('price').value.trim());

    if (!purchaseId || !farmerId || !purchaseDate || isNaN(quantity) || isNaN(price)) {
        alert('Please fill in all fields correctly.');
        return;
    }

    const existingPurchaseIndex = purchases.findIndex(p => p.purchaseId === purchaseId || p.farmerId === farmerId);
    if (existingPurchaseIndex !== -1) {
        alert('Purchase ID must be unique, and only one purchase can be assigned to a Farmer at a time.');
        return;
    }

    const totalCost = quantity * price;
    purchases.push({ purchaseId, farmerId, purchaseDate, quantity, price, totalCost });
    savePurchasesToLocalStorage();
    alert('Purchase logged successfully!');
    displayPurchases(purchases);
}

// Display purchase records
function displayPurchases(purchaseList) {
    const purchaseContainer = document.getElementById('purchase-container');
    purchaseContainer.innerHTML = '';

    if (purchaseList.length === 0) {
        purchaseContainer.innerHTML = '<p>No purchase records found.</p>';
        return;
    }

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Purchase ID</th>
                <th>Farmer ID</th>
                <th>Date</th>
                <th>Quantity (kg)</th>
                <th>Price per kg</th>
                <th>Total Cost</th>
            </tr>
        </thead>
        <tbody>
            ${purchaseList.map(purchase => `
                <tr>
                    <td>${purchase.purchaseId}</td>
                    <td>${purchase.farmerId}</td>
                    <td>${purchase.purchaseDate}</td>
                    <td>${purchase.quantity}</td>
                    <td>${purchase.price}</td>
                    <td>${purchase.totalCost}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
    purchaseContainer.appendChild(table);
}

// Sort purchases by date, farmer, or amount
function sortPurchases(criteria) {
    let sortedPurchases;
    switch (criteria) {
        case 'date':
            sortedPurchases = [...purchases].sort((a, b) => new Date(a.purchaseDate) - new Date(b.purchaseDate));
            break;
        case 'farmer':
            sortedPurchases = [...purchases].sort((a, b) => a.farmerId.localeCompare(b.farmerId));
            break;
        case 'amount':
            sortedPurchases = [...purchases].sort((a, b) => a.totalCost - b.totalCost);
            break;
        default:
            sortedPurchases = [...purchases];
    }
    displayPurchases(sortedPurchases);
}

// Generate purchase summary for a specific farmer in a table
function generateFarmerSummary(farmerId) {
    const filteredPurchases = purchases.filter(purchase => purchase.farmerId === farmerId);

    if (filteredPurchases.length === 0) {
        alert(`No purchases found for Farmer ${farmerId}`);
        return;
    }

    const tableContainer = document.getElementById('purchase-container');
    tableContainer.innerHTML = '';

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Purchase ID</th>
                <th>Date</th>
                <th>Quantity (kg)</th>
                <th>Price per kg</th>
                <th>Total Cost</th>
            </tr>
        </thead>
        <tbody>
            ${filteredPurchases.map(purchase => `
                <tr>
                    <td>${purchase.purchaseId}</td>
                    <td>${purchase.purchaseDate}</td>
                    <td>${purchase.quantity}</td>
                    <td>${purchase.price}</td>
                    <td>${purchase.totalCost}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
    tableContainer.appendChild(table);
}

// Calculate expenses for selected time periods
function calculateExpenses() {
    const timePeriod = document.getElementById('time-period').value;
    let totalCost = 0;
    const today = new Date();

    purchases.forEach(purchase => {
        const purchaseDate = new Date(purchase.purchaseDate);
        let timeDiff = today - purchaseDate;

        if (timePeriod === 'daily' && timeDiff < 24 * 60 * 60 * 1000) {
            totalCost += purchase.totalCost;
        } else if (timePeriod === 'weekly' && timeDiff < 7 * 24 * 60 * 60 * 1000) {
            totalCost += purchase.totalCost;
        } else if (timePeriod === 'monthly') {
            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();
            const purchaseMonth = purchaseDate.getMonth();
            const purchaseYear = purchaseDate.getFullYear();
            if (currentMonth === purchaseMonth && currentYear === purchaseYear) {
                totalCost += purchase.totalCost;
            }
        }
    });

    alert(`Total expenses for the selected period (${timePeriod}): ${totalCost}`);
}

// Generate report on raw material costs
function generateRawMaterialReport(timePeriod) {
    let totalCost = 0;
    const today = new Date();

    purchases.forEach(purchase => {
        const purchaseDate = new Date(purchase.purchaseDate);
        let timeDiff = today - purchaseDate;

        if (timePeriod === 'daily' && timeDiff < 24 * 60 * 60 * 1000) {
            totalCost += purchase.totalCost;
        } else if (timePeriod === 'weekly' && timeDiff < 7 * 24 * 60 * 60 * 1000) {
            totalCost += purchase.totalCost;
        } else if (timePeriod === 'monthly') {
            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();
            const purchaseMonth = purchaseDate.getMonth();
            const purchaseYear = purchaseDate.getFullYear();
            if (currentMonth === purchaseMonth && currentYear === purchaseYear) {
                totalCost += purchase.totalCost;
            }
        }
    });

    alert(`Raw material cost report for the selected period (${timePeriod}): ${totalCost}`);
}

// Export farmers data to CSV
function exportFarmers() {
    if (farmers.length === 0) {
        alert('No farmers to export.');
        return;
    }

    const csvContent = [
        ['Farmer ID', 'Name', 'Contact Details', 'Location'],
        ...farmers.map(farmer => [farmer.farmerId, farmer.name, farmer.contactDetails, farmer.location])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'farmers.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Event Listeners for Farmers, Purchases, and Expenses
document.addEventListener("DOMContentLoaded", () => {
    // Submit farmer form (add or update farmer)
    document.getElementById('farmer-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveFarmer();
    });

    // Submit purchase form
    document.getElementById('purchase-form').addEventListener('submit', (e) => {
        e.preventDefault();
        savePurchase();
    });

    // Search farmers on button click
    document.getElementById('search-farmers').addEventListener('click', searchFarmers);

    // Sort purchase records
    document.getElementById('sort-date').addEventListener('click', () => sortPurchases('date'));
    document.getElementById('sort-farmer').addEventListener('click', () => sortPurchases('farmer'));
    document.getElementById('sort-amount').addEventListener('click', () => sortPurchases('amount'));

    // Generate summary by farmer
    document.getElementById('summary-farmer').addEventListener('click', () => {
        const farmerId = prompt('Enter Farmer ID for summary:');
        if (farmerId) generateFarmerSummary(farmerId);
    });

    // Calculate expenses
    document.getElementById('expense-form').addEventListener('submit', (e) => {
        e.preventDefault();
        calculateExpenses();
    });

    // Generate raw material report
    document.getElementById('generate-report').addEventListener('click', () => {
        const timePeriod = prompt('Enter time period for raw material cost report (daily, weekly, monthly):');
        if (timePeriod) generateRawMaterialReport(timePeriod);
    });

    // Export farmers to CSV
    document.getElementById('export-farmers').addEventListener('click', exportFarmers);

    // Display initial list of farmers and purchases
    displayFarmers(farmers);
    displayPurchases(purchases);
});
