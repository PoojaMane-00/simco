// =======================
// Password Toggle Script
// =======================

document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', function () {
        const input = this.closest('tr').querySelector('.password-field');
        if (input.type === 'password') {
            input.type = 'text';
            this.innerHTML = '<i class="bi bi-eye-slash"></i> Hide';
            setTimeout(() => {
                input.type = 'password';
                this.innerHTML = '<i class="bi bi-eye"></i> Show';
            }, 5000);
        } else {
            input.type = 'password';
            this.innerHTML = '<i class="bi bi-eye"></i> Show';
        }
    });
});

// =======================
// Reusable Table Search
// =======================

function setupTableSearch(inputId, tableId) {
    const input = document.getElementById(inputId);
    const rows = document.querySelectorAll(`#${tableId} tbody tr`);

    if (input) {
        input.addEventListener('keyup', function () {
            const query = this.value.toLowerCase();
            rows.forEach(row => {
                const rowText = row.textContent.toLowerCase();
                row.style.display = rowText.includes(query) ? '' : 'none';
            });
        });
    }
}

// =======================
// DOM Ready Initializer
// =======================

document.addEventListener('DOMContentLoaded', function () {
    // Setup search for multiple tables
    setupTableSearch('userSearchInput', 'usersTable');
    setupTableSearch('searchInput', 'clientsTable');
    setupTableSearch('errorSearchInput', 'errorTable');
    setupTableSearch('formSearchInput', 'formsTable');

    // Mobile number validation
    const mobileInput = document.querySelector('input[name="mobile"]');
    if (mobileInput) {
        mobileInput.addEventListener('input', function () {
            this.value = this.value.replace(/\D/g, '').slice(0, 10);
        });
    }

    // Single password toggle (non-table)
    const toggleBtn = document.getElementById('togglePassword');
    const passwordField = document.getElementById('passwordField');
    if (toggleBtn && passwordField) {
        toggleBtn.addEventListener('click', function () {
            const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordField.setAttribute('type', type);
            this.innerHTML = type === 'password'
                ? '<i class="bi bi-eye"></i>'
                : '<i class="bi bi-eye-slash"></i>';
        });
    }

    // Auto-dismiss alerts
    setTimeout(() => {
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(alert => {
            alert.classList.remove('show');
            alert.classList.add('fade');
        });
    }, 4000);
});


// =======================
// Excel Export Code
// =======================

document.addEventListener('DOMContentLoaded', function () {
    const exportBtn = document.getElementById('exportExcelBtn');
    const table = document.getElementById('formsTable');

    if (exportBtn && table) {
        exportBtn.addEventListener('click', function () {
            // Clone the table to avoid modifying the original
            const clonedTable = table.cloneNode(true);

            // Remove the "Action" column (7th column, index 6)
            clonedTable.querySelectorAll('tr').forEach(row => {
                const cells = row.querySelectorAll('th, td');
                if (cells.length > 6) {
                    cells[6].remove(); // Remove the 7th cell (Action)
                }
            });

            // Convert the modified table to Excel
            const wb = XLSX.utils.table_to_book(clonedTable, { sheet: "Service Forms" });
            XLSX.writeFile(wb, "ServiceForms.xlsx");
        });
    }
});

