// Vérifier si l'utilisateur est authentifié
function isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
}

// Rediriger vers login si non authentifié
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

// Login
async function login(username, password) {
    try {
        const data = await apiPost('/auth/login', { username, password });
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user || { username }));
            showToast('Connexion réussie', 'success');
            return true;
        }
        return false;
    } catch (error) {
        showToast('Identifiants incorrects', 'error');
        return false;
    }
}

// Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showToast('Déconnexion réussie', 'info');
    window.location.href = '/login.html';
}

// Récupérer l'utilisateur connecté
function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Mettre à jour l'affichage du nom utilisateur
function updateUserDisplay() {
    const user = getCurrentUser();
    const userNameSpan = document.getElementById('userName');
    if (userNameSpan && user) {
        userNameSpan.textContent = user.username || 'Utilisateur';
    }
}