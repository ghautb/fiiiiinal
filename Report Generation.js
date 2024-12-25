// Comprehensive Report Module Script
document.getElementById('generate-comprehensive-report').addEventListener('click', generateComprehensiveReport);
document.getElementById('export-report-csv').addEventListener('click', exportComprehensiveReport);

// Fetch data safely from localStorage
function fetchData(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

// Generate Comprehensive Report
function generateComprehensiveReport() {
    const financial = fetchData('financial') || { income: 0, expenses: 0, tax: 0, profit: 0 };
    const inventory = fetchData('inventory').filter(item => item.name && item.stock !== undefined && item.restockAlert !== undefined);
    const orders = fetchData('orders');
    const purchases = fetchData('purchases');

    // Calculate total income from sales
    let totalIncome = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    // Calculate total expenses from purchases
    let totalExpenses = purchases.reduce((sum, purchase) => sum + (purchase.totalCost || 0), 0);

    // Apply tax
    const taxRate = 0.2; // Example tax rate of 20%
    const tax = totalIncome * taxRate;

    // Calculate net profit
    const netProfit = totalIncome - totalExpenses - tax;

    // Generate Financial Summary
    const financialSummary = `
        <p><strong>Total Income:</strong> $${totalIncome.toFixed(2)}</p>
        <p><strong>Total Expenses:</strong> $${totalExpenses.toFixed(2)}</p>
        <p><strong>Tax Applied:</strong> $${tax.toFixed(2)}</p>
        <p><strong>Net Profit:</strong> $${netProfit.toFixed(2)}</p>
    `;
    document.getElementById('financial-summary-output').innerHTML = financialSummary;

    // Generate Sales Summary
    const salesSummary = orders.reduce((summary, order) => {
        summary[order.productCategory] = (summary[order.productCategory] || 0) + (order.quantityOrdered || 0);
        return summary;
    }, {});

    const salesSummaryHTML = `
        <p><strong>Total Revenue:</strong> $${totalIncome.toFixed(2)}</p>
        <ul>
            ${Object.entries(salesSummary).map(([category, quantity]) => `<li>${category}: ${quantity} units</li>`).join('')}
        </ul>
    `;
    document.getElementById('sales-summary-output').innerHTML = salesSummaryHTML;

    // Generate Inventory Summary
    const inventorySummaryHTML = `
        <ul>
            ${inventory.map(item => `
                <li>${item.name}: ${item.stock} units (Reorder Level: ${item.restockAlert})</li>
            `).join('')}
        </ul>
    `;
    document.getElementById('inventory-summary-output').innerHTML = inventorySummaryHTML;

    const comprehensiveOutput = document.getElementById('comprehensive-report-output');
    comprehensiveOutput.innerHTML = `
        <h3>Comprehensive Report</h3>
        <div>
            <h4>Financial Summary</h4>
            ${financialSummary}
        </div>
        <div>
            <h4>Sales Summary</h4>
            ${salesSummaryHTML}
        </div>
        <div>
            <h4>Inventory Summary</h4>
            ${inventorySummaryHTML}
        </div>
    `;
}

// Export Comprehensive Report to CSV
function exportComprehensiveReport() {
    const financial = fetchData('financial') || { income: 0, expenses: 0, tax: 0, profit: 0 };
    const inventory = fetchData('inventory');
    const orders = fetchData('orders');
    const purchases = fetchData('purchases');

    let csvContent = "data:text/csv;charset=utf-8,\n";

    // Financial Summary
    const totalIncome = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const totalExpenses = purchases.reduce((sum, purchase) => sum + (purchase.totalCost || 0), 0);
    const taxRate = 0.2;
    const tax = totalIncome * taxRate;
    const netProfit = totalIncome - totalExpenses - tax;

    csvContent += "Section,Details\n";
    csvContent += `Financial,Income: $${totalIncome.toFixed(2)}\n`;
    csvContent += `Financial,Expenses: $${totalExpenses.toFixed(2)}\n`;
    csvContent += `Financial,Tax: $${tax.toFixed(2)}\n`;
    csvContent += `Financial,Net Profit: $${netProfit.toFixed(2)}\n`;

    // Sales Summary
    csvContent += "\nSales,Category,Quantity\n";
    const salesSummary = orders.reduce((summary, order) => {
        summary[order.productCategory] = (summary[order.productCategory] || 0) + (order.quantityOrdered || 0);
        return summary;
    }, {});
    Object.entries(salesSummary).forEach(([category, quantity]) => {
        csvContent += `Sales,${category},${quantity}\n`;
    });

    // Inventory Summary
    csvContent += "\nInventory,Category,Stock,Reorder Level\n";
    inventory.forEach(item => {
        csvContent += `Inventory,${item.name},${item.stock},${item.restockAlert}\n`;
    });

    // Prepare the CSV file
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "comprehensive_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Initialize the module
document.addEventListener('DOMContentLoaded', () => {
    generateComprehensiveReport(); // Generate report on page load
});
