// Global assets array
let assets = [];

// Function to fetch assets from backend
async function fetchAssets(type = null) {
    if (!userContext.requireAuth()) return;

    try {
        let url = API_ENDPOINTS.assets;
        if (type && type !== 'all') {
            url += `?type=${type}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                ...getAuthHeader(),
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                userContext.handleUnauthorized();
                return;
            }
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch assets');
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch assets');
        }

        console.log('Fetched assets:', data.assets); // Debug log
        assets = data.assets;
        populateAssetsTable();
        updateAssetStats();
    } catch (error) {
        console.error('Error:', error);
        showToast('error', error.message || 'Failed to load assets');
    }
}

// Function to update asset statistics
function updateAssetStats() {
    const stats = {
        total: assets.length,
        active: assets.filter(a => a.condition === 'excellent' || a.condition === 'good').length,
        underEvaluation: assets.filter(a => a.condition === 'fair').length,
        archived: assets.filter(a => a.condition === 'poor').length
    };

    // Update stats in the UI
    Object.keys(stats).forEach(key => {
        const el = document.getElementById(`${key}Count`);
        if (el) el.textContent = stats[key];
    });
}

// Function to populate assets table
function populateAssetsTable(type = null) {
    const tbody = document.getElementById('assetsList');
    if (!tbody) return;

    const filteredAssets = type && type !== 'all' ? assets.filter(a => a.type === type) : assets;

    tbody.innerHTML = filteredAssets.map(asset => `
        <tr>
            <td>${asset.title}</td>
            <td>${asset.type}</td>
            <td>${formatCurrency(asset.value)}</td>
            <td><span class="badge bg-${getConditionColor(asset.condition)}">${formatCondition(asset.condition)}</span></td>
            <td>${new Date(asset.createdAt).toLocaleDateString()}</td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-sm btn-info" onclick="viewAsset('${asset._id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="editAsset('${asset._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteAsset('${asset._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Function to format currency
function formatCurrency(value) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(value);
}

// Function to format condition
function formatCondition(condition) {
    return condition.charAt(0).toUpperCase() + condition.slice(1);
}

// Function to get condition color
function getConditionColor(condition) {
    switch (condition) {
        case 'excellent':
            return 'success';
        case 'good':
            return 'info';
        case 'fair':
            return 'warning';
        case 'poor':
            return 'danger';
        default:
            return 'secondary';
    }
}

// Function to show specific asset type
function showAssetType(type) {
    fetchAssets(type);
}

// Function to view asset details
async function viewAsset(id) {
    if (!id) return;

    try {
        const response = await fetch(`${API_ENDPOINTS.assets}/${id}`, {
            headers: getAuthHeader()
        });

        if (!response.ok) {
            if (response.status === 401) {
                userContext.handleUnauthorized();
                return;
            }
            throw new Error('Failed to fetch asset details');
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch asset details');
        }

        const asset = data.asset;
        
        // Show asset details in modal
        const modalContent = `
            <div class="modal-header">
                <h5 class="modal-title">Asset Details</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="mb-3">
                    <strong>Title:</strong> ${asset.title}
                </div>
                <div class="mb-3">
                    <strong>Type:</strong> ${asset.type}
                </div>
                <div class="mb-3">
                    <strong>Value:</strong> ${formatCurrency(asset.value)}
                </div>
                <div class="mb-3">
                    <strong>Condition:</strong> <span class="badge bg-${getConditionColor(asset.condition)}">${formatCondition(asset.condition)}</span>
                </div>
                <div class="mb-3">
                    <strong>Owner Name:</strong> ${asset.ownerName}
                </div>
                <div class="mb-3">
                    <strong>Owner Phone:</strong> ${asset.ownerPhone}
                </div>
                ${asset.ownerEmail ? `
                <div class="mb-3">
                    <strong>Owner Email:</strong> ${asset.ownerEmail}
                </div>` : ''}
                <div class="mb-3">
                    <strong>Location:</strong> ${asset.location}
                </div>
                <div class="mb-3">
                    <strong>Created:</strong> ${new Date(asset.createdAt).toLocaleDateString()}
                </div>
                ${asset.description ? `
                <div class="mb-3">
                    <strong>Description:</strong>
                    <p class="mt-2">${asset.description}</p>
                </div>` : ''}
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
        `;

        // Get or create modal
        let modalElement = document.getElementById('assetDetailsModal');
        if (!modalElement) {
            modalElement = document.createElement('div');
            modalElement.id = 'assetDetailsModal';
            modalElement.className = 'modal fade';
            modalElement.setAttribute('tabindex', '-1');
            document.body.appendChild(modalElement);
        }

        modalElement.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    ${modalContent}
                </div>
            </div>
        `;

        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Failed to load asset details');
    }
}

// Function to create new asset
async function createAsset(formData) {
    if (!userContext.requireAuth()) return;

    try {
        const response = await fetch(API_ENDPOINTS.assets, {
            method: 'POST',
            headers: {
                ...getAuthHeader(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            if (response.status === 401) {
                userContext.handleUnauthorized();
                return;
            }
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create asset');
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to create asset');
        }

        showToast('success', 'Asset created successfully');
        $('#addAssetModal').modal('hide');
        await fetchAssets(); // Refresh the assets list
    } catch (error) {
        console.error('Error:', error);
        showToast('error', error.message || 'Failed to create asset');
    }
}

// Function to edit asset
async function editAsset(id) {
    try {
        const response = await fetch(`${API_ENDPOINTS.assets}/${id}`, {
            headers: getAuthHeader()
        });

        if (!response.ok) {
            if (response.status === 401) {
                userContext.handleUnauthorized();
                return;
            }
            throw new Error('Failed to fetch asset details');
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch asset details');
        }

        const asset = data.asset;
        
        // Populate edit form
        const form = document.getElementById('editAssetForm');
        if (!form) {
            throw new Error('Edit form not found');
        }

        form.elements['title'].value = asset.title;
        form.elements['type'].value = asset.type;
        form.elements['value'].value = asset.value;
        form.elements['condition'].value = asset.condition;
        form.elements['ownerName'].value = asset.ownerName;
        form.elements['ownerPhone'].value = asset.ownerPhone;
        form.elements['ownerEmail'].value = asset.ownerEmail || '';
        form.elements['location'].value = asset.location;
        form.elements['description'].value = asset.description || '';
        form.dataset.assetId = id;

        // Show edit modal
        const modal = new bootstrap.Modal(document.getElementById('editAssetModal'));
        modal.show();
    } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Failed to load asset for editing');
    }
}

// Function to update asset
async function updateAsset(formData, id) {
    try {
        const response = await fetch(`${API_ENDPOINTS.assets}/${id}`, {
            method: 'PUT',
            headers: getAuthHeader(),
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            if (response.status === 401) {
                userContext.handleUnauthorized();
                return;
            }
            throw new Error('Failed to update asset');
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to update asset');
        }

        showToast('success', 'Asset updated successfully');
        await fetchAssets(); // Refresh the assets list
        
        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editAssetModal'));
        if (modal) modal.hide();
    } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Failed to update asset');
    }
}

// Function to delete asset
async function deleteAsset(id) {
    if (!confirm('Are you sure you want to delete this asset?')) {
        return;
    }

    try {
        const response = await fetch(`${API_ENDPOINTS.assets}/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        });

        if (!response.ok) {
            if (response.status === 401) {
                userContext.handleUnauthorized();
                return;
            }
            throw new Error('Failed to delete asset');
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to delete asset');
        }

        showToast('success', 'Asset deleted successfully');
        await fetchAssets(); // Refresh the assets list
    } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Failed to delete asset');
    }
}

// Function to show toast notification
function showToast(type, message) {
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    const container = document.getElementById('toastContainer') || createToastContainer();
    container.appendChild(toast);

    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();

    // Remove toast after it's hidden
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

// Function to create toast container
function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    document.body.appendChild(container);
    return container;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // First check authentication
    if (!userContext.requireAuth()) return;

    // Initialize user data
    const currentUser = userContext.getCurrentUser();
    if (currentUser) {
        document.getElementById('currentUserName').textContent = currentUser.name || currentUser.email;
    }

    // Fetch initial assets
    fetchAssets();

    // Setup new asset form
    const newAssetForm = document.getElementById('newAssetForm');
    if (newAssetForm) {
        newAssetForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = Object.fromEntries(new FormData(newAssetForm));
            await createAsset(formData);
        });
    }

    // Setup edit asset form
    const editAssetForm = document.getElementById('editAssetForm');
    if (editAssetForm) {
        editAssetForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = editAssetForm.dataset.assetId;
            const formData = Object.fromEntries(new FormData(editAssetForm));
            await updateAsset(formData, id);
        });
    }

    // Setup asset type filter
    const typeFilter = document.getElementById('typeFilter');
    if (typeFilter) {
        typeFilter.addEventListener('change', (e) => {
            const type = e.target.value;
            showAssetType(type === 'all' ? null : type);
        });
    }
});