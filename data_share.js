// Shared Data Keys in localStorage
const LOCAL_STORAGE_KEYS = {
    FARMERS: 'farmers',
    PURCHASES: 'purchases',
    INVENTORY: 'inventory',
    ORDERS: 'orders',
    FINANCIAL: 'financial',
    REPORT: 'comprehensive_report',
};

// Initialize Default Data in localStorage
function initializeLocalStorageDefaults() {
    const defaultData = {
        [LOCAL_STORAGE_KEYS.FARMERS]: [],
        [LOCAL_STORAGE_KEYS.PURCHASES]: [],
        [LOCAL_STORAGE_KEYS.INVENTORY]: [
            { name: 'Small', stock: 0, price: 0, restockAlert: 5 },
            { name: 'Medium', stock: 0, price: 0, restockAlert: 5 },
            { name: 'Large', stock: 0, price: 0, restockAlert: 5 },
            { name: 'Extra Large', stock: 0, price: 0, restockAlert: 5 },
            { name: 'Family Pack', stock: 0, price: 0, restockAlert: 5 },
            { name: 'Bulk Pack', stock: 0, price: 0, restockAlert: 5 },
            { name: 'Premium', stock: 0, price: 0, restockAlert: 5 },
        ],
        [LOCAL_STORAGE_KEYS.ORDERS]: [],
        [LOCAL_STORAGE_KEYS.FINANCIAL]: { income: 0, expenses: 0, tax: 0, profit: 0 },
        [LOCAL_STORAGE_KEYS.REPORT]: [],
    };

    Object.entries(defaultData).forEach(([key, value]) => {
        if (!localStorage.getItem(key)) {
            localStorage.setItem(key, JSON.stringify(value));
        }
    });
}

// Fetch Data Safely from localStorage
function fetchDataFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.warn(`Error reading data from localStorage for key "${key}":`, error);
        return null;
    }
}

// Save Data Safely to localStorage
function saveDataToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Couldn't save data to localStorage for key "${key}":`, error);
    }
}

// Synchronize Data Across Tabs
window.addEventListener('storage', (event) => {
    if (!event.key) return; // Ignore non-specific updates

    const updatedData = fetchDataFromLocalStorage(event.key);
    switch (event.key) {
        case LOCAL_STORAGE_KEYS.INVENTORY:
            refreshInventoryUI(updatedData);
            break;
        case LOCAL_STORAGE_KEYS.FINANCIAL:
            refreshFinancialUI(updatedData);
            break;
        case LOCAL_STORAGE_KEYS.REPORT:
            console.log('Updated report:', updatedData);
            break;
        default:
            console.log(`Key "${event.key}" updated, no specific handler assigned.`);
    }
});

// Update Inventory UI
function refreshInventoryUI(inventory) {
    const inventoryContainer = document.getElementById('inventory-container');
    if (!inventoryContainer) return;

    inventoryContainer.innerHTML = ''; // Clear existing content

    if (!inventory || inventory.length === 0) {
        inventoryContainer.innerHTML = '<p>No items in inventory.</p>';
        return;
    }

    inventory.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'inventory-item';
        itemDiv.innerHTML = `
            <h4>${item.name}</h4>
            <p>Stock: ${item.stock}</p>
            <p>Price: $${item.price}</p>
        `;
        inventoryContainer.appendChild(itemDiv);
    });
}

// Update Financial UI
function refreshFinancialUI(financial) {
    const financialContainer = document.getElementById('financial-container');
    if (!financialContainer || !financial) return;

    financialContainer.innerHTML = `
        <p>Income: $${financial.income.toFixed(2)}</p>
        <p>Expenses: $${financial.expenses.toFixed(2)}</p>
        <p>Profit: $${financial.profit.toFixed(2)}</p>
    `;
}

// Sync Inventory with Purchases
function syncInventoryWithPurchases() {
    const purchases = fetchDataFromLocalStorage(LOCAL_STORAGE_KEYS.PURCHASES);
    const inventory = fetchDataFromLocalStorage(LOCAL_STORAGE_KEYS.INVENTORY);

    if (!purchases || !inventory) return;

    purchases.forEach(({ category, quantity }) => {
        const item = inventory.find(i => i.name === category);
        if (item) {
            item.stock += quantity;
        }
    });

    saveDataToLocalStorage(LOCAL_STORAGE_KEYS.INVENTORY, inventory);
    alert('Inventory updated based on purchase records.');
    refreshInventoryUI(inventory);
}

// Notify Suppliers for Restocking
function notifySuppliersForRestock() {
    const inventory = fetchDataFromLocalStorage(LOCAL_STORAGE_KEYS.INVENTORY);

    if (!inventory || inventory.length === 0) {
        alert('No inventory data available.');
        return;
    }

    const lowStockItems = inventory.filter(item => item.stock <= item.restockAlert);

    if (lowStockItems.length === 0) {
        alert('All inventory levels are sufficient.');
        return;
    }

    const notifications = lowStockItems.map(item => (
        `Notify supplier for ${item.name} - Current Stock: ${item.stock}, Reorder Level: ${item.restockAlert}`
    ));

    alert('Supplier Notifications Sent:\n' + notifications.join('\n'));
}

// Simulate Restocking
function simulateRestocking() {
    const inventory = fetchDataFromLocalStorage(LOCAL_STORAGE_KEYS.INVENTORY);

    if (!inventory || inventory.length === 0) {
        alert('No inventory data available.');
        return;
    }

    inventory.forEach(item => {
        if (item.stock <= item.restockAlert) {
            item.stock += item.restockAlert * 2; // Restock logic
        }
    });

    saveDataToLocalStorage(LOCAL_STORAGE_KEYS.INVENTORY, inventory);
    alert('Inventory restocked successfully.');
    refreshInventoryUI(inventory);
}

// Initialize Everything on Load
document.addEventListener('DOMContentLoaded', () => {
    initializeLocalStorageDefaults();
    refreshInventoryUI(fetchDataFromLocalStorage(LOCAL_STORAGE_KEYS.INVENTORY));
    refreshFinancialUI(fetchDataFromLocalStorage(LOCAL_STORAGE_KEYS.FINANCIAL));
});
