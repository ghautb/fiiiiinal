

const orders = JSON.parse(localStorage.getItem('orders')) || [];

// Save orders to localStorage
function saveOrdersToLocalStorage() {
    localStorage.setItem('orders', JSON.stringify(orders));
}

// Function to log new customer orders
function handleOrderSubmission(event) {
    event.preventDefault();

    const orderId = document.getElementById('order-id').value.trim();
    const customerDetails = document.getElementById('customer-details').value.trim();
    const productCategory = document.getElementById('product-category').value.trim();
    const quantityOrdered = parseInt(document.getElementById('quantity-ordered').value, 10);
    const unitPrice = parseFloat(document.getElementById('unit-price').value);
    const orderStatus = document.getElementById('order-status').value;

    if (!orderId || !customerDetails || !productCategory || isNaN(quantityOrdered) || isNaN(unitPrice)) {
        alert('Please fill in all fields correctly.');
        return;
    }

    // Fetch inventory from localStorage
    const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    const category = inventory.find(item => item.name === productCategory);

    if (!category) {
        alert(`Category "${productCategory}" not found in inventory.`);
        return;
    }

    if (category.stock < quantityOrdered) {
        alert(`Insufficient stock for "${productCategory}". Available stock: ${category.stock}.`);
        return;
    }

    // Deduct stock
    category.stock -= quantityOrdered;
    localStorage.setItem('inventory', JSON.stringify(inventory));

    const totalPrice = quantityOrdered * unitPrice;

    const newOrder = {
        orderId,
        customerDetails,
        productCategory,
        quantityOrdered,
        unitPrice,
        totalPrice,
        orderStatus,
        date: new Date().toISOString()
    };

    orders.push(newOrder);
    saveOrdersToLocalStorage();
    alert(`Order ${orderId} logged successfully! Stock for "${productCategory}" updated to ${category.stock}.`);
    displayOrders();
}

// Function to display orders
function displayOrders() {
    const orderContainer = document.getElementById('order-container');
    orderContainer.innerHTML = '';

    if (orders.length === 0) {
        orderContainer.innerHTML = '<p>No orders found.</p>';
        return;
    }

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Total Price</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            ${orders.map(order => `
                <tr>
                    <td>${order.orderId}</td>
                    <td>${order.customerDetails}</td>
                    <td>${order.productCategory}</td>
                    <td>${order.quantityOrdered}</td>
                    <td>$${order.totalPrice.toFixed(2)}</td>
                    <td>${order.orderStatus}</td>
                    <td>${new Date(order.date).toLocaleDateString()}</td>
                    <td>
                        <button onclick="updateOrderStatus('${order.orderId}')">Update Status</button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;
    orderContainer.appendChild(table);
}

// Function to update order status
function updateOrderStatus(orderId) {
    const order = orders.find(o => o.orderId === orderId);
    if (order) {
        const newStatus = prompt('Enter new status (Pending, Processed, Shipped, Delivered):', order.orderStatus);
        if (newStatus) {
            order.orderStatus = newStatus;
            saveOrdersToLocalStorage();
            alert(`Order ${orderId} status updated to ${newStatus}.`);
            displayOrders();
        }
    } else {
        alert('Order not found.');
    }
}

// Function to filter and search orders
function filterOrders() {
    const filterField = document.getElementById('filter-field').value.trim().toLowerCase();
    const filteredOrders = orders.filter(order =>
        order.customerDetails.toLowerCase().includes(filterField) ||
        order.productCategory.toLowerCase().includes(filterField) ||
        order.orderStatus.toLowerCase().includes(filterField)
    );
    displayFilteredOrders(filteredOrders);
}

function displayFilteredOrders(filteredOrders) {
    const orderContainer = document.getElementById('order-container');
    orderContainer.innerHTML = '';

    if (filteredOrders.length === 0) {
        orderContainer.innerHTML = '<p>No matching orders found.</p>';
        return;
    }

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Total Price</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            ${filteredOrders.map(order => `
                <tr>
                    <td>${order.orderId}</td>
                    <td>${order.customerDetails}</td>
                    <td>${order.productCategory}</td>
                    <td>${order.quantityOrdered}</td>
                    <td>$${order.totalPrice.toFixed(2)}</td>
                    <td>${order.orderStatus}</td>
                    <td>${new Date(order.date).toLocaleDateString()}</td>
                    <td>
                        <button onclick="updateOrderStatus('${order.orderId}')">Update Status</button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;
    orderContainer.appendChild(table);
}

// Function to calculate revenue
function calculateRevenue() {
    const productCategory = document.getElementById('product-category-revenue').value.trim();
    const quantitySold = parseInt(document.getElementById('quantity-sold').value, 10);
    const unitPrice = parseFloat(document.getElementById('unit-price-revenue').value);

    if (!productCategory || isNaN(quantitySold) || isNaN(unitPrice)) {
        alert('Please fill in all fields correctly.');
        return;
    }

    const revenue = quantitySold * unitPrice;
    document.getElementById('revenue-output').innerText = `Revenue for ${productCategory}: $${revenue.toFixed(2)}`;
}

// Function to generate reports by category
function generateReportsByCategory() {
    const categoryWise = orders.reduce((acc, order) => {
        if (!acc[order.productCategory]) {
            acc[order.productCategory] = { unitsSold: 0, revenue: 0 };
        }
        acc[order.productCategory].unitsSold += order.quantityOrdered;
        acc[order.productCategory].revenue += order.totalPrice;
        return acc;
    }, {});

    const reportContainer = document.getElementById('sales-report');
    reportContainer.innerHTML = '<h3>Sales Report by Category</h3>';
    Object.entries(categoryWise).forEach(([category, data]) => {
        const reportDiv = document.createElement('div');
        reportDiv.innerHTML = `
            <p><strong>Category:</strong> ${category}</p>
            <p><strong>Units Sold:</strong> ${data.unitsSold}</p>
            <p><strong>Revenue:</strong> $${data.revenue.toFixed(2)}</p>
            <hr>
        `;
        reportContainer.appendChild(reportDiv);
    });
}

// Function to export sales reports
function exportReports() {
    let csvContent = "data:text/csv;charset=utf-8,Order ID,Customer,Category,Quantity,Total Price,Status,Date\n";

    orders.forEach(order => {
        const row = [
            order.orderId,
            order.customerDetails,
            order.productCategory,
            order.quantityOrdered,
            order.totalPrice.toFixed(2),
            order.orderStatus,
            new Date(order.date).toLocaleDateString()
        ].join(",");
        csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sales_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Initialize the module
function initializeOrderManagement() {
    document.getElementById('order-form').addEventListener('submit', handleOrderSubmission);
    document.getElementById('filter-button').addEventListener('click', filterOrders);
    document.getElementById('calculate-revenue').addEventListener('click', calculateRevenue);
    document.getElementById('generate-reports-category').addEventListener('click', generateReportsByCategory);
    document.getElementById('export-reports').addEventListener('click', exportReports);

    displayOrders();
}

document.addEventListener('DOMContentLoaded', initializeOrderManagement);
