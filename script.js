document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("transaction-form");
    const transactionList = document.getElementById("transaction-list");
    const totalIncomeEl = document.getElementById("total-income");
    const totalExpensesEl = document.getElementById("total-expenses");
    const netBalanceEl = document.getElementById("net-balance");
    const addIncomeBtn = document.getElementById("add-income");
    const addExpenseBtn = document.getElementById("add-expense");
    
    let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    
    function saveTransactions() {
        localStorage.setItem("transactions", JSON.stringify(transactions));
    }
    
    function addTransaction(type) {
        const date = document.getElementById("date").value;
        const description = document.getElementById("description").value;
        const category = document.getElementById("category").value;
        const amount = parseFloat(document.getElementById("amount").value);

        if (!date || !description || isNaN(amount)) return;

        const transaction = {
            date,
            description,
            category,
            amount: type === "income" ? amount : -amount
        };

        transactions.push(transaction);
        saveTransactions();
        updateUI();
        form.reset();
    }

    function removeTransaction(index) {
        transactions.splice(index, 1);
        saveTransactions();
        updateUI();
    }
    
    addIncomeBtn.addEventListener("click", () => addTransaction("income"));
    addExpenseBtn.addEventListener("click", () => addTransaction("expense"));
    
    function updateUI() {
        transactionList.innerHTML = "";
        let totalIncome = 0;
        let totalExpenses = 0;
        let incomeCategories = {};
        let expenseCategories = {};
    
        transactions.forEach((transaction, index) => {
            const li = document.createElement("li");
            li.innerHTML = `${transaction.date} - ${transaction.description} - ${transaction.category} - $${transaction.amount} 
                <button onclick="removeTransaction(${index})">X</button>`;
            
            if (transaction.amount >= 0) {
                totalIncome += transaction.amount;
                incomeCategories[transaction.category] = (incomeCategories[transaction.category] || 0) + transaction.amount;
            } else {
                totalExpenses += Math.abs(transaction.amount);
                expenseCategories[transaction.category] = (expenseCategories[transaction.category] || 0) + Math.abs(transaction.amount);
            }
            
            transactionList.appendChild(li);
        });
    
        totalIncomeEl.textContent = `$${totalIncome}`;
        totalExpensesEl.textContent = `$${totalExpenses}`;
        netBalanceEl.textContent = `$${totalIncome - totalExpenses}`;
    
        updateCharts(incomeCategories, expenseCategories);
    }
    
    let incomeChart, expenseChart;

    function createChart(ctx, data, label) {
        return new Chart(ctx, {
            type: "pie",
            data: {
                labels: Object.keys(data),
                datasets: [{
                    data: Object.values(data),
                    backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#9966FF", "#FF9F40", "#C9CBCF", "#00A896"],
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: "bottom" },
                    title: { display: true, text: label }
                }
            }
        });
    }
    
    function logout() {
        localStorage.removeItem("loggedInUser");  // Clear stored login data
        window.location.href = "index.html"; // Redirect to login
    }
    
    
    function updateCharts(incomeData, expenseData) {
        const incomeCtx = document.getElementById("income-chart").getContext("2d");
        const expenseCtx = document.getElementById("expense-chart").getContext("2d");
    
        if (incomeChart) incomeChart.destroy();
        if (expenseChart) expenseChart.destroy();
    
        incomeChart = createChart(incomeCtx, incomeData, "Income by Category");
        expenseChart = createChart(expenseCtx, expenseData, "Expenses by Category");
    }
    
    updateUI();

    window.removeTransaction = removeTransaction;
});