// Sample jewelry inventory data
const jewelryInventory = [
    {
        id: 1,
        type: 'diamond',
        description: '2 Carat Diamond Ring',
        details: 'VS1 Clarity, E Color',
        purchaseDate: '2023-12-15',
        purchasePrice: 850000,
        currentValue: 920000,
        certificate: 'GIA2384762'
    },
    // Add more items...
];

// Function to populate inventory table
function populateInventoryTable() {
    const tableBody = document.getElementById('jewelryInventoryList');
    tableBody.innerHTML = '';

    jewelryInventory.forEach(item => {
        const appreciation = item.currentValue - item.purchasePrice;
        const appreciationPercent = ((appreciation / item.purchasePrice) * 100).toFixed(2);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.description}</td>
            <td>${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</td>
            <td>${item.details}</td>
            <td>${item.purchaseDate}</td>
            <td>₹${item.purchasePrice.toLocaleString()}</td>
            <td>₹${item.currentValue.toLocaleString()}</td>
            <td class="${appreciation >= 0 ? 'text-success' : 'text-danger'}">
                ${appreciation >= 0 ? '+' : ''}₹${appreciation.toLocaleString()} (${appreciationPercent}%)
            </td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editJewelry(${item.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteJewelry(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Initialize value chart
let valueChart = null;
function initializeValueChart() {
    const ctx = document.getElementById('jewelryValueChart').getContext('2d');
    
    // Sample data
    const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Diamond (₹/ct)',
            data: [42000, 43000, 43500, 44000, 44500, 45000],
            borderColor: '#17a2b8',
            tension: 0.4
        }, {
            label: 'Ruby (₹/ct)',
            data: [25000, 26000, 26500, 27000, 27500, 28000],
            borderColor: '#dc3545',
            tension: 0.4
        }]
    };

    valueChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: value => '₹' + value.toLocaleString()
                    }
                }
            }
        }
    });
}

// Function to update chart timeframe
function updateChart(timeframe) {
    document.querySelectorAll('.btn-group .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update chart data based on timeframe
    alert(`Updating chart for ${timeframe} timeframe`);
}

// Function to show jewelry details
function showJewelryDetails(type) {
    alert(`Showing details for ${type} jewelry`);
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    populateInventoryTable();
    initializeValueChart();

    // Handle form submission
    document.getElementById('addJewelryForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Jewelry item added successfully!');
        const modal = bootstrap.Modal.getInstance(document.getElementById('addJewelryModal'));
        modal.hide();
    });
}); 