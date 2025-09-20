document.addEventListener('DOMContentLoaded', function() {
    // Modal functionality
    const addExpenseBtn = document.getElementById('add-expense-btn');
    const expenseModal = document.getElementById('expense-modal');
    const closeBtn = document.querySelector('.close-btn');
    const cancelBtn = document.getElementById('cancel-expense');
    const expenseForm = document.getElementById('expense-form');
    const expenseList = document.querySelector('.expense-table tbody');
    
    // Function to fetch and render expenses
    async function fetchExpenses() {
        try {
            const response = await fetch('http://localhost:3000/api/budgets');
            const result = await response.json();
            
            if (response.ok) {
                const expenses = result.expenses;
                expenseList.innerHTML = ''; // Clear existing table rows

                if (expenses && expenses.length > 0) {
                    expenses.forEach(expense => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${expense.date}</td>
                            <td><span class="badge category-badge ${expense.category.toLowerCase()}">${expense.category}</span></td>
                            <td>${expense.description}</td>
                            <td>$${parseFloat(expense.amount).toFixed(2)}</td>
                            <td>${expense.payment_method}</td>
                            <td>${expense.status}</td>
                            <td>
                                <button class="btn btn-sm btn-info edit-btn" data-id="${expense.id}">Edit</button>
                                <button class="btn btn-sm btn-danger delete-btn" data-id="${expense.id}">Delete</button>
                            </td>
                        `;
                        expenseList.appendChild(row);
                    });
                } else {
                    expenseList.innerHTML = '<tr><td colspan="7">No expenses recorded.</td></tr>';
                }
            } else {
                console.error('Failed to fetch expenses:', result.message);
            }
        } catch (error) {
            console.error('Error fetching expenses:', error);
            alert('An error occurred while fetching expenses.');
        }
    }
    
    // Open modal
    addExpenseBtn.addEventListener('click', function() {
        expenseModal.style.display = 'block';
        document.getElementById('expense-date').valueAsDate = new Date();
    });
    
    // Close modal
    function closeModal() {
        expenseModal.style.display = 'none';
        expenseForm.reset();
    }
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    // Close when clicking outside modal
    window.addEventListener('click', function(event) {
        if (event.target === expenseModal) {
            closeModal();
        }
    });
    
    // Handle form submission for adding a new expense
    expenseForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form values
        const newExpense = {
            date: document.getElementById('expense-date').value,
            category: document.getElementById('expense-category').value,
            description: document.getElementById('expense-description').value,
            amount: parseFloat(document.getElementById('expense-amount').value),
            paymentMethod: document.getElementById('expense-payment').value,
            status: document.getElementById('expense-status').value,
            notes: document.getElementById('expense-notes').value
        };
        
        try {
            const response = await fetch('http://localhost:3000/api/budgets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newExpense)
            });
            
            const result = await response.json();

            if (response.ok) {
                alert('Expense added successfully!');
                closeModal();
                fetchExpenses(); // Refresh the list with the new data
            } else {
                alert(`Error: ${result.message}`);
                console.error('Error adding expense:', result);
            }
        } catch (error) {
            console.error('Server error:', error);
            alert('An internal server error occurred.');
        }
    });
    
    // Initial fetch of expenses when the page loads
    fetchExpenses();
});