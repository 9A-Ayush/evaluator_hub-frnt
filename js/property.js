// Sample property inventory data
const propertyInventory = [
    {
        id: 1,
        type: 'apartment',
        name: 'Luxury 3BHK Apartment',
        location: 'Bandra West, Mumbai',
        area: '1500 sq.ft',
        purchaseDate: '2022-06-15',
        purchasePrice: 15000000,
        currentValue: 17500000,
        regNumber: 'REG123456'
    },
    {
        id: 2,
        type: 'office',
        name: 'Commercial Office Space',
        location: 'Cyber City, Gurugram',
        area: '2000 sq.ft',
        purchaseDate: '2021-03-20',
        purchasePrice: 20000000,
        currentValue: 24000000,
        regNumber: 'REG789012'
    }
];

// Function to populate inventory table
function populateInventoryTable() {
    const tableBody = document.getElementById('propertyInventoryList');
    tableBody.innerHTML = '';

    propertyInventory.forEach(property => {
        const roi = ((property.currentValue - property.purchasePrice) / property.purchasePrice * 100).toFixed(2);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${property.name}</td>
            <td>${property.type.charAt(0).toUpperCase() + property.type.slice(1)}</td>
            <td>${property.location}</td>
            <td>${property.area}</td>
            <td>${property.purchaseDate}</td>
            <td>₹${property.purchasePrice.toLocaleString()}</td>
            <td>₹${property.currentValue.toLocaleString()}</td>
            <td class="${roi >= 0 ? 'text-success' : 'text-danger'}">
                ${roi}%
            </td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editProperty(${property.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProperty(${property.id})">
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
    const ctx = document.getElementById('propertyValueChart').getContext('2d');
    
    // Sample data (property price index)
    const data = {
        labels: ['2019', '2020', '2021', '2022', '2023', '2024'],
        datasets: [{
            label: 'Residential (Index)',
            data: [100, 105, 112, 120, 128, 135],
            borderColor: '#0d6efd',
            tension: 0.4
        }, {
            label: 'Commercial (Index)',
            data: [100, 102, 108, 115, 125, 132],
            borderColor: '#198754',
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
                    title: {
                        display: true,
                        text: 'Price Index (Base: 2019 = 100)'
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

// Function to show property details
function showPropertyDetails(type) {
    alert(`Showing details for ${type} properties`);
}

// Function to edit property
function editProperty(id) {
    const property = propertyInventory.find(p => p.id === id);
    if (property) {
        alert(`Editing property: ${property.name}`);
    }
}

// Function to delete property
function deleteProperty(id) {
    if (confirm('Are you sure you want to delete this property?')) {
        const index = propertyInventory.findIndex(p => p.id === id);
        if (index !== -1) {
            propertyInventory.splice(index, 1);
            populateInventoryTable();
            alert('Property deleted successfully');
        }
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    populateInventoryTable();
    initializeValueChart();

    // Handle form submission
    document.getElementById('addPropertyForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Property added successfully!');
        const modal = bootstrap.Modal.getInstance(document.getElementById('addPropertyModal'));
        modal.hide();
    });
}); 