// Sample vehicle inventory data
const vehicleInventory = [
    {
        id: 1,
        type: 'luxury_car',
        name: 'BMW 7 Series',
        modelYear: 2023,
        registration: 'MH02AB1234',
        purchaseDate: '2023-06-15',
        purchasePrice: 12000000,
        currentValue: 10800000,
        fuelType: 'petrol',
        odometer: 15000,
        insurance: '2024-06-14'
    },
    {
        id: 2,
        type: 'commercial',
        name: 'Tata Prima Truck',
        modelYear: 2022,
        registration: 'MH04CD5678',
        purchaseDate: '2022-03-20',
        purchasePrice: 3500000,
        currentValue: 3000000,
        fuelType: 'diesel',
        odometer: 50000,
        insurance: '2024-03-19'
    }
];

// Function to populate inventory table
function populateInventoryTable() {
    const tableBody = document.getElementById('vehicleInventoryList');
    tableBody.innerHTML = '';

    vehicleInventory.forEach(vehicle => {
        const depreciation = ((vehicle.purchasePrice - vehicle.currentValue) / vehicle.purchasePrice * 100).toFixed(2);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${vehicle.name}</td>
            <td>${vehicle.type.replace('_', ' ').charAt(0).toUpperCase() + vehicle.type.slice(1)}</td>
            <td>${vehicle.modelYear}</td>
            <td>${vehicle.registration}</td>
            <td>${vehicle.purchaseDate}</td>
            <td>₹${vehicle.purchasePrice.toLocaleString()}</td>
            <td>₹${vehicle.currentValue.toLocaleString()}</td>
            <td class="text-danger">
                -${depreciation}%
            </td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editVehicle(${vehicle.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteVehicle(${vehicle.id})">
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
    const ctx = document.getElementById('vehicleValueChart').getContext('2d');
    
    // Sample data (vehicle depreciation trends)
    const data = {
        labels: ['Year 0', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
        datasets: [{
            label: 'Luxury Cars',
            data: [100, 85, 75, 65, 58, 52],
            borderColor: '#0d6efd',
            tension: 0.4
        }, {
            label: 'Commercial Vehicles',
            data: [100, 90, 82, 75, 70, 65],
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
                        text: 'Value Retention (%)'
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

// Function to show vehicle details
function showVehicleDetails(type) {
    alert(`Showing details for ${type} vehicles`);
}

// Function to edit vehicle
function editVehicle(id) {
    const vehicle = vehicleInventory.find(v => v.id === id);
    if (vehicle) {
        alert(`Editing vehicle: ${vehicle.name}`);
    }
}

// Function to delete vehicle
function deleteVehicle(id) {
    if (confirm('Are you sure you want to delete this vehicle?')) {
        const index = vehicleInventory.findIndex(v => v.id === id);
        if (index !== -1) {
            vehicleInventory.splice(index, 1);
            populateInventoryTable();
            alert('Vehicle deleted successfully');
        }
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    populateInventoryTable();
    initializeValueChart();

    // Handle form submission
    document.getElementById('addVehicleForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Vehicle added successfully!');
        const modal = bootstrap.Modal.getInstance(document.getElementById('addVehicleModal'));
        modal.hide();
    });
}); 