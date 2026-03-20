// Configuration API
const API_BASE_URL = '/api';

// Helper pour les requêtes API
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const config = {
        ...options,
        headers
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        if (response.status === 401) {
            // Token expiré ou invalide
            localStorage.removeItem('token');
            window.location.href = '/login.html';
            return null;
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Erreur serveur');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        showToast(error.message, 'error');
        throw error;
    }
}

// Helper GET
async function apiGet(endpoint) {
    return apiRequest(endpoint, { method: 'GET' });
}

// Helper POST
async function apiPost(endpoint, body) {
    return apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(body)
    });
}

// Helper PUT
async function apiPut(endpoint, body) {
    return apiRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify(body)
    });
}

// Helper DELETE
async function apiDelete(endpoint) {
    return apiRequest(endpoint, { method: 'DELETE' });
}

// Toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}