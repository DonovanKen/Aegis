// Gestion de la navigation
let currentRoute = 'dashboard';
let currentParams = {};

function navigateTo(route, params = {}) {
    currentRoute = route;
    currentParams = params;
    
    // Mettre à jour l'URL sans recharger
    const url = new URL(window.location.href);
    url.searchParams.set('route', route);
    if (params.id) url.searchParams.set('id', params.id);
    window.history.pushState({ route, params }, '', url);
    
    // Rendre la vue correspondante
    renderCurrentView();
    
    // Mettre à jour les liens actifs dans la navigation
    updateActiveNavLink(route);
}

function updateActiveNavLink(route) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('onclick');
        if (href && href.includes(route)) {
            link.style.opacity = '1';
            link.style.fontWeight = 'bold';
        } else {
            link.style.opacity = '0.7';
            link.style.fontWeight = 'normal';
        }
    });
}

function renderCurrentView() {
    if (!isAuthenticated()) {
        return;
    }
    
    const contentDiv = document.getElementById('content');
    const loadingDiv = document.getElementById('loading');
    
    switch (currentRoute) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'patients':
            // Vue liste des patients (similaire dashboard)
            renderDashboard();
            break;
        case 'patient':
            if (currentParams.id) {
                renderPatientProfile(currentParams.id);
            } else {
                navigateTo('dashboard');
            }
            break;
        case 'interventions':
            // Vue liste des interventions
            renderInterventionsList();
            break;
        case 'intervention':
            if (currentParams.id) {
                renderIntervention(currentParams.id);
            } else {
                navigateTo('dashboard');
            }
            break;
        default:
            renderDashboard();
    }
}

async function renderInterventionsList() {
    const contentDiv = document.getElementById('content');
    const loadingDiv = document.getElementById('loading');
    
    try {
        loadingDiv.classList.remove('hidden');
        const interventions = await apiGet('/interventions');
        loadingDiv.classList.add('hidden');
        
        if (!interventions || interventions.length === 0) {
            contentDiv.innerHTML = '<p>Aucune intervention enregistrée.</p>';
            return;
        }
        
        let html = '<div class="dashboard-header"><h1>Historique des interventions</h1></div>';
        html += '<div class="cards-grid">';
        
        for (const interv of interventions) {
            const patient = await apiGet(`/patients/${interv.patientId}`);
            html += `
                <div class="patient-card" onclick="viewIntervention(${interv.id})">
                    <div class="patient-name">${patient ? escapeHtml(patient.firstName) + ' ' + escapeHtml(patient.lastName) : 'Patient inconnu'}</div>
                    <div>📅 ${new Date(interv.createdAt).toLocaleDateString()}</div>
                    <div>${interv.status === 'active' ? '🟢 En cours' : '🔴 Clôturée'}</div>
                    ${interv.orientation ? `<div>📍 ${interv.orientation}</div>` : ''}
                </div>
            `;
        }
        
        html += '</div>';
        contentDiv.innerHTML = html;
        
    } catch (error) {
        loadingDiv.classList.add('hidden');
        contentDiv.innerHTML = '<p>Erreur de chargement</p>';
    }
}

// Fonction utilitaire pour échapper le HTML
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Gestion du retour arrière du navigateur
window.addEventListener('popstate', (event) => {
    if (event.state) {
        currentRoute = event.state.route;
        currentParams = event.state.params || {};
        renderCurrentView();
    } else {
        // Reconstruire depuis l'URL
        const urlParams = new URLSearchParams(window.location.search);
        const route = urlParams.get('route') || 'dashboard';
        const id = urlParams.get('id');
        navigateTo(route, id ? { id } : {});
    }
});

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier l'authentification
    if (!isAuthenticated() && !window.location.pathname.includes('login.html')) {
        window.location.href = '/login.html';
        return;
    }
    
    // Mettre à jour l'affichage utilisateur
    updateUserDisplay();
    
    // Initialiser la navigation
    const urlParams = new URLSearchParams(window.location.search);
    const route = urlParams.get('route') || 'dashboard';
    const id = urlParams.get('id');
    navigateTo(route, id ? { id } : {});
});

// Exposer les fonctions globalement pour les appels HTML
window.navigateTo = navigateTo;
window.viewPatient = viewPatient;
window.viewIntervention = viewIntervention;
window.startIntervention = startIntervention;
window.closeIntervention = closeIntervention;
window.saveInterventionNotes = saveInterventionNotes;
window.setOrientation = setOrientation;
window.showAddPatientForm = showAddPatientForm;
window.closeModal = closeModal;
window.logout = logout;