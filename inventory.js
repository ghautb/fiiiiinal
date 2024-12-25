// Inventory Management Module

const INVENTORY_KEY = 'inventory';
const PURCHASES_KEY = 'purchases';
const ORDERS_KEY = 'orders';

const inventory = JSON.parse(localStorage.getItem(INVENTORY_KEY)) || [];

// Save inventory to localStorage
function saveInventoryToLocalStorage() {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
}

// Function to handle inventory form submission
function handleInventorySubmission(event) {
    event.preventDefault();

    const itemId = document.getElementById('item-id').value.trim();
    const category = document.getElementById('category').value.trim();
    const quantityAvailable = parseInt(document.getElementById('quantity-available').value, 10);
    const reorderLevel = parseInt(document.getElementById('reorder-level').value, 10);
    const restockDate = document.getElementById('restock-date').value.trim();
    const storageLocation = document.getElementById('storage-location').value.trim();

    // Validate required fields
    if (!itemId || !category || isNaN(quantityAvailable) || isNaN(reorderLevel)) {
        alert('Please fill in all required fields correctly.');
        return;
    }

    // Ensure Item ID is unique
    const existingItem = inventory.find(item => item.itemId === itemId);
    if (existingItem) {
        if (existingItem.category !== category) {
            alert(`Item ID "${itemId}" already exists for a different category (${existingItem.category}). Please use a unique ID.`);
            return;
        }

        // Update existing item
        existingItem.category = category;
        existingItem.quantityAvailable = quantityAvailable;
        existingItem.reorderLevel = reorderLevel;
        existingItem.restockDate = restockDate || 'N/A';
        existingItem.storageLocation = storageLocation || 'N/A';
        alert(`Inventory item "${itemId}" updated successfully.`);
    } else {
        // Add a new item
        const newItem = {
            itemId,
            category,
            quantityAvailable,
            reorderLevel,
            restockDate: restockDate || 'N/A',
            storageLocation: storageLocation || 'N/A'
        };
        inventory.push(newItem);
        alert(`Inventory item "${itemId}" added successfully.`);
    }

    saveInventoryToLocalStorage();
    displayInventory();
    document.getElementById('inventory-form').reset();
}

// Function to display inventory
function displayInventory() {
    const inventoryList = document.getElementById('inventory-list');
    inventoryList.innerHTML = '';

    if (inventory.length === 0) {
        inventoryList.innerHTML = '<p>No inventory items found.</p>';
        return;
    }

    inventory.forEach(item => {
        if (!item.itemId || item.itemId === 'N/A') {
            return;
        }

        const itemDiv = document.createElement('div');
        itemDiv.classList.add('inventory-item');
        itemDiv.innerHTML = `
            <p><strong>Item ID:</strong> ${item.itemId || 'N/A'}</p>
            <p><strong>Category:</strong> ${item.category || 'N/A'}</p>
            <p><strong>Quantity Available:</strong> ${item.quantityAvailable || 0}</p>
            <p><strong>Reorder Level:</strong> ${item.reorderLevel || 0}</p>
            <p><strong>Restock Date:</strong> ${item.restockDate || 'N/A'}</p>
            <p><strong>Storage Location:</strong> ${item.storageLocation || 'N/A'}</p>
            <hr>
        `;
        inventoryList.appendChild(itemDiv);
    });
}

// Updated Function to generate demand forecast
function generateForecast() {
    const forecastOutput = document.getElementById('forecast-output');
    forecastOutput.innerHTML = '';

    if (inventory.length === 0) {
        forecastOutput.innerHTML = '<p>No inventory data available for forecasting.</p>';
        return;
    }

    const recommendations = [];
    inventory.forEach(item => {
        if (!item.itemId || item.itemId === 'N/A' || !item.category) {
            return;
        }

        const purchases = JSON.parse(localStorage.getItem(PURCHASES_KEY)) || [];
        const recentPurchases = purchases.filter(p => p.category === item.category);
        const totalRecentPurchases = recentPurchases.reduce((sum, p) => sum + p.quantity, 0);
        const predictedDemand = totalRecentPurchases * 0.8;

        if (predictedDemand < item.reorderLevel) {
            recommendations.push(
                `Item ID: ${item.itemId} (${item.category}) - Predicted demand is low. Consider restocking.`
            );
        } else {
            recommendations.push(
                `Item ID: ${item.itemId} (${item.category}) - Stock levels are sufficient.`
            );
        }
    });

    forecastOutput.innerHTML = `<h3>Forecast Results:</h3><ul>${recommendations.map(r => `<li>${r}</li>`).join('')}</ul>`;
}

// Function to generate alerts and notifications
function generateAlerts() {
    const alertsContainer = document.getElementById('alerts-container');
    alertsContainer.innerHTML = '';

    inventory.forEach(item => {
        if (item.quantityAvailable <= item.reorderLevel) {
            const alertDiv = document.createElement('div');
            alertDiv.classList.add('alert');
            alertDiv.innerHTML = `
                ⚠️ Low stock alert for ${item.category} (Item ID: ${item.itemId}).
                Current stock: ${item.quantityAvailable}. Reorder level: ${item.reorderLevel}.
                <button onclick="reorderItem('${item.category}')">Reorder Now</button>
            `;
            alertsContainer.appendChild(alertDiv);
        }

        const today = new Date();
        const restockDate = new Date(item.restockDate);
        if (restockDate && restockDate <= today) {
            const restockReminder = document.createElement('div');
            restockReminder.classList.add('alert');
            restockReminder.innerHTML = `<p>⏰ Reminder: Restocking for Item ID: ${item.itemId} (${item.category}) is scheduled for today or overdue.</p>`;
            alertsContainer.appendChild(restockReminder);
        }
    });

    if (alertsContainer.innerHTML === '') {
        alertsContainer.innerHTML = '<p>All inventory levels are sufficient.</p>';
    }
}

function reorderItem(category) {
    alert(`Reorder request sent for category: ${category}.`);
}

// Updated Function to generate inventory reports with financial data removed
function generateReport(period) {
    const reportOutput = document.getElementById('report-output');
    reportOutput.innerHTML = `<p>Generating ${period} report...</p>`;
    const orders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];

    // Filter orders based on the selected period
    const filteredOrders = orders.filter(order => {
        if (!order.date || !order.totalCost || !order.quantityOrdered || !order.category) {
            console.warn("Invalid order detected:", order);
            return false;
        }

        const orderDate = new Date(order.date);
        const currentDate = new Date();
        switch (period) {
            case 'daily':
                return orderDate.toDateString() === currentDate.toDateString();
            case 'weekly':
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(currentDate.getDate() - 7);
                return orderDate >= oneWeekAgo;
            case 'monthly':
                return orderDate.getMonth() === currentDate.getMonth() && orderDate.getFullYear() === currentDate.getFullYear();
            default:
                return false;
        }
    });

    // Skip financial summary
    const netProfit = 0; // Remove net profit calculations

    // Update report output to exclude financials
    reportOutput.innerHTML = `
        <h3>${period.charAt(0).toUpperCase() + period.slice(1)} Report</h3>
        <h4>Products Sold:</h4>
        <ul>${filteredOrders.map(order => `<li>${order.category}: ${order.quantityOrdered} units</li>`).join('')}</ul>
    `;

    // Filter valid inventory items and list them
    const validInventory = inventory.filter(item => item.category && item.quantityAvailable !== undefined);
    reportOutput.innerHTML += `
        <h4>Current Inventory:</h4>
        <ul>${validInventory.map(item => `<li>${item.category}: ${item.quantityAvailable} units</li>`).join('')}</ul>
    `;
}

// Function to export inventory report
function exportInventoryReport() {
    let csvContent = "data:text/csv;charset=utf-8,Item ID,Category,Quantity Available,Reorder Level,Restock Date,Storage Location\n";

    inventory.forEach(item => {
        const row = [
            item.itemId,
            item.category,
            item.quantityAvailable,
            item.reorderLevel,
            item.restockDate || 'N/A',
            item.storageLocation || 'N/A'
        ].join(",");
        csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "inventory_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Function to sync with other modules (placeholders)
function syncWithPurchaseRecords() {
    const purchases = JSON.parse(localStorage.getItem(PURCHASES_KEY)) || [];
    purchases.forEach(purchase => {
        const inventoryItem = inventory.find(item => item.category === purchase.category);
        if (inventoryItem) {
            inventoryItem.quantityAvailable += purchase.quantity;
        }
    });
    saveInventoryToLocalStorage();
    alert('Inventory synced with Purchase Records successfully!');
    displayInventory();
}

function syncWithSupplierManagement() {
    const lowStockItems = inventory.filter(item => item.quantityAvailable <= item.reorderLevel);
    if (lowStockItems.length === 0) {
        alert('No items require restocking at the moment.');
        return;
    }

    lowStockItems.forEach(item => {
        console.log(`Notify supplier for ${item.category} (Item ID: ${item.itemId}) - Current Stock: ${item.quantityAvailable}`);
    });

    alert('Restocking notifications sent to suppliers for low-stock items.');
}

// Initialize the module
function initializeInventoryManagement() {
    document.getElementById('inventory-form').addEventListener('submit', handleInventorySubmission);
    document.getElementById('generate-forecast').addEventListener('click', generateForecast);
    document.getElementById('generate-daily-report').addEventListener('click', () => generateReport('daily'));
    document.getElementById('generate-weekly-report').addEventListener('click', () => generateReport('weekly'));
    document.getElementById('generate-monthly-report').addEventListener('click', () => generateReport('monthly'));
    document.getElementById('export-inventory-report').addEventListener('click', exportInventoryReport);
    document.getElementById('sync-with-purchase-records').addEventListener('click', syncWithPurchaseRecords);
    document.getElementById('sync-with-supplier-management').addEventListener('click', syncWithSupplierManagement);

    displayInventory();
    generateAlerts();
}

document.addEventListener('DOMContentLoaded', initializeInventoryManagement);
