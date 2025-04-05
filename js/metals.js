const metalInventory = [
    {
        id: 1,
        type: 'gold',
        weight: 100,
        unit: 'g',
        purity: '24k',
        purchaseDate: '2023-12-15',
        purchasePrice: 550000,
        currentPrice: 635000
    },
    // Add more items...
];

// Function to populate inventory table
function populateInventoryTable() {
    const tableBody = document.getElementById('metalInventoryList');
    tableBody.innerHTML = '';

    metalInventory.forEach(item => {
        const gainLoss = item.currentPrice - item.purchasePrice;
        const gainLossPercent = ((gainLoss / item.purchasePrice) * 100).toFixed(2);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</td>
            <td>${item.weight}${item.unit}</td>
            <td>${item.purity}</td>
            <td>${item.purchaseDate}</td>
            <td>₹${item.purchasePrice.toLocaleString()}</td>
            <td>₹${item.currentPrice.toLocaleString()}</td>
            <td class="${gainLoss >= 0 ? 'text-success' : 'text-danger'}">
                ${gainLoss >= 0 ? '+' : ''}₹${gainLoss.toLocaleString()} (${gainLossPercent}%)
            </td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editMetal(${item.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteMetal(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Price chart initialization
let priceChart = null;
function initializePriceChart() {
    const ctx = document.getElementById('metalPriceChart').getContext('2d');
    
    // Sample data
    const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Gold (₹/10g)',
            data: [61000, 62000, 62500, 63000, 63200, 63500],
            borderColor: '#ffc107',
            tension: 0.4
        }, {
            label: 'Silver (₹/kg)',
            data: [72000, 73000, 74000, 74500, 75000, 75800],
            borderColor: '#6c757d',
            tension: 0.4
        }]
    };

    priceChart = new Chart(ctx, {
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
    // Update active button
    document.querySelectorAll('.btn-group .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Update chart data based on timeframe
    // This would typically fetch new data from your backend
    alert(`Updating chart for ${timeframe} timeframe`);
}

// Function to show metal details
function showMetalDetails(metal) {
    // This would typically open a detailed view or modal
    alert(`Showing details for ${metal}`);
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    populateInventoryTable();
    initializePriceChart();

    // Handle form submission
    document.getElementById('addMetalForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Metal added successfully!');
        const modal = bootstrap.Modal.getInstance(document.getElementById('addMetalModal'));
        modal.hide();
    });
});
