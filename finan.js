// Financial Analysis Module

// Save total income and expenses to localStorage
function saveIncomeAndExpensesToLocalStorage(totalIncome, totalExpenses) {
    localStorage.setItem('totalIncome', totalIncome);
    localStorage.setItem('totalExpenses', totalExpenses);
}

// Save tax amount to localStorage
function saveTaxAmountToLocalStorage(taxAmount) {
    localStorage.setItem('taxAmount', taxAmount);
}

// Save net profit to localStorage
function saveNetProfitToLocalStorage(netProfit) {
    localStorage.setItem('netProfit', netProfit);
}

// Function to calculate net income from total income and expenses
document.getElementById('income-expense-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const totalIncome = parseFloat(document.getElementById('total-income').value);
    const totalExpenses = parseFloat(document.getElementById('total-expenses').value);

    if (isNaN(totalIncome) || isNaN(totalExpenses)) {
        alert('Please enter valid numbers for income and expenses.');
        return;
    }

    const netIncome = totalIncome - totalExpenses;

    // Save data to localStorage
    saveIncomeAndExpensesToLocalStorage(totalIncome, totalExpenses);
    localStorage.setItem('netIncome', netIncome);

    const output = document.getElementById('income-expense-output');
    output.innerHTML = `<p><strong>Net Income:</strong> $${netIncome.toFixed(2)}</p>`;
});

// Function to calculate tax based on income and tax rate
document.getElementById('tax-calculation-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const incomeBeforeTax = parseFloat(document.getElementById('income-before-tax').value);
    const taxRate = parseFloat(document.getElementById('tax-rate').value);

    if (isNaN(incomeBeforeTax) || isNaN(taxRate)) {
        alert('Please enter valid numbers for income and tax rate.');
        return;
    }

    const taxAmount = (incomeBeforeTax * taxRate) / 100;

    // Save tax amount to localStorage
    saveTaxAmountToLocalStorage(taxAmount);

    const output = document.getElementById('tax-output');
    output.innerHTML = `<p><strong>Tax Amount:</strong> $${taxAmount.toFixed(2)}</p>`;
});

// Function to calculate net profit from revenue, expenses, and tax
document.getElementById('net-profit-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const totalRevenue = parseFloat(document.getElementById('total-revenue').value);
    const totalExpenses = parseFloat(document.getElementById('total-expenses-net').value);
    const totalTax = parseFloat(document.getElementById('total-tax').value);

    if (isNaN(totalRevenue) || isNaN(totalExpenses) || isNaN(totalTax)) {
        alert('Please enter valid numbers for revenue, expenses, and tax.');
        return;
    }

    const netProfit = totalRevenue - totalExpenses - totalTax;

    // Save net profit to localStorage
    saveNetProfitToLocalStorage(netProfit);

    const output = document.getElementById('net-profit-output');
    output.innerHTML = `<p><strong>Net Profit:</strong> $${netProfit.toFixed(2)}</p>`;
});

// Load and display stored financial data on page load
document.addEventListener('DOMContentLoaded', function () {
    const storedTotalIncome = localStorage.getItem('totalIncome');
    const storedTotalExpenses = localStorage.getItem('totalExpenses');
    const storedNetIncome = localStorage.getItem('netIncome');
    const storedTaxAmount = localStorage.getItem('taxAmount');
    const storedNetProfit = localStorage.getItem('netProfit');

    if (storedNetIncome) {
        document.getElementById('income-expense-output').innerHTML = `<p><strong>Net Income:</strong> $${parseFloat(storedNetIncome).toFixed(2)}</p>`;
    }

    if (storedTaxAmount) {
        document.getElementById('tax-output').innerHTML = `<p><strong>Tax Amount:</strong> $${parseFloat(storedTaxAmount).toFixed(2)}</p>`;
    }

    if (storedNetProfit) {
        document.getElementById('net-profit-output').innerHTML = `<p><strong>Net Profit:</strong> $${parseFloat(storedNetProfit).toFixed(2)}</p>`;
    }

    if (storedTotalIncome && storedTotalExpenses) {
        document.getElementById('income-expense-output').innerHTML += `<p><strong>Total Income:</strong> $${parseFloat(storedTotalIncome).toFixed(2)}</p>`;
        document.getElementById('income-expense-output').innerHTML += `<p><strong>Total Expenses:</strong> $${parseFloat(storedTotalExpenses).toFixed(2)}</p>`;
    }
});
