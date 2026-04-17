// auth.js — Shared authentication utilities for the Spark Idea System
// Loaded in base.html; available on every protected page.

// ─── Token & User Storage ─────────────────────────────────────────────────────

function getToken() {
    return localStorage.getItem('spark_auth_token');
}

function getUser() {
    const raw = localStorage.getItem('spark_user');
    return raw ? JSON.parse(raw) : null;
}

function setSession(token, user) {
    localStorage.setItem('spark_auth_token', token);
    localStorage.setItem('spark_user', JSON.stringify(user));
}

function clearSession() {
    localStorage.removeItem('spark_auth_token');
    localStorage.removeItem('spark_user');
}

// ─── API Fetch Helper ──────────────────────────────────────────────────────────
// Uses same-origin relative paths (e.g. '/ideas/') — no CORS needed.

async function apiFetch(path, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(path, { ...options, headers });
    if (res.status === 401) {
        clearSession();
        window.location.href = '/login';
    }
    return res;
}

// ─── Session Restore ───────────────────────────────────────────────────────────
// Call at the top of each protected page's DOMContentLoaded.
// Validates the token, refreshes cached user, then calls onSuccess(user).
// If adminRequired=true, non-admin users are bounced to '/'.

async function restoreSession(onSuccess, { adminRequired = false } = {}) {
    const token = getToken();
    if (!token) {
        window.location.href = '/login';
        return;
    }

    try {
        const res = await fetch('/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            clearSession();
            window.location.href = '/login';
            return;
        }

        const user = await res.json();
        // Refresh the cached user so role/display_name is always current
        localStorage.setItem('spark_user', JSON.stringify(user));

        if (adminRequired && user.role !== 'admin') {
            window.location.href = '/';
            return;
        }

        updateHeaderUser(user);

        if (typeof onSuccess === 'function') {
            onSuccess(user);
        }
    } catch (e) {
        console.error('Session restore failed:', e);
        clearSession();
        window.location.href = '/login';
    }
}

// ─── Header UI ────────────────────────────────────────────────────────────────

function updateHeaderUser(user) {
    const nameEl    = document.getElementById('user-display-name');
    const roleEl    = document.getElementById('user-role');
    const avatarEl  = document.getElementById('user-avatar');
    const adminLinks = document.querySelectorAll('.admin-only');

    const displayName = user.display_name || user.email.split('@')[0];

    if (nameEl)   nameEl.textContent   = displayName;
    if (roleEl)   roleEl.textContent   = user.role;
    if (avatarEl) avatarEl.textContent = displayName.charAt(0).toUpperCase();

    if (user.role === 'admin') {
        adminLinks.forEach(el => el.classList.remove('hidden'));
    }

    // Highlight the current page's nav link
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        link.classList.remove('active');
        if (href === '/' && currentPath === '/') {
            link.classList.add('active');
        } else if (href !== '/' && currentPath.startsWith(href)) {
            link.classList.add('active');
        }
    });
}

// ─── Logout ───────────────────────────────────────────────────────────────────

function doLogout() {
    const token = getToken();
    if (token) {
        // Fire-and-forget the server-side session invalidation
        apiFetch('/auth/logout', { method: 'POST' }).catch(() => {});
    }
    clearSession();
    window.location.href = '/login';
}

// ─── User Menu Dropdown ───────────────────────────────────────────────────────

function toggleUserMenu() {
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) dropdown.classList.toggle('hidden');
}

// Close the dropdown if the user clicks anywhere outside it
document.addEventListener('click', (e) => {
    const menuBtn  = document.getElementById('user-menu-btn');
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown && menuBtn && !menuBtn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
    }
});

// ─── Toast Notifications ──────────────────────────────────────────────────────

function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-banner';
    toast.textContent = message;
    container.appendChild(toast);

    // Use double-rAF so the browser paints the element before adding the class
    requestAnimationFrame(() => {
        requestAnimationFrame(() => toast.classList.add('toast-visible'));
    });

    setTimeout(() => {
        toast.classList.remove('toast-visible');
        setTimeout(() => toast.remove(), 350);
    }, 3200);
}

// ─── Achievement Check ────────────────────────────────────────────────────────
// Call after submit and vote. Shows a toast if a new badge was just earned.

let _cachedAchievementIds = null;

async function checkNewAchievements() {
    const token = getToken();
    if (!token) return;

    try {
        const res = await apiFetch('/users/me/achievements');
        if (!res.ok) return;

        const data = await res.json();
        const currentIds = new Set(
            data.badges.filter(b => b.achieved).map(b => b.id)
        );

        if (_cachedAchievementIds !== null) {
            currentIds.forEach(id => {
                if (!_cachedAchievementIds.has(id)) {
                    const badge = data.badges.find(b => b.id === id);
                    if (badge) showToast(`Badge Earned: ${badge.name}`);
                }
            });
        }

        _cachedAchievementIds = currentIds;
    } catch (e) {
        // Non-critical — silent fail
    }
}

// ─── Shared Utilities ─────────────────────────────────────────────────────────

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatDate(isoString) {
    return new Date(isoString).toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric'
    });
}
