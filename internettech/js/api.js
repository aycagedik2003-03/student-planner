// =============================================
// js/api.js — Shared Frontend Helper
// =============================================

const API = window.location.origin + '/api';

// ─── Auth Storage ─────────────────────────────
function getToken()  { return localStorage.getItem('vc_token'); }
function getUser()   { const u = localStorage.getItem('vc_user'); return u ? JSON.parse(u) : null; }
function setAuth(token, user) {
  localStorage.setItem('vc_token', token);
  localStorage.setItem('vc_user', JSON.stringify(user));
}
function clearAuth() {
  localStorage.removeItem('vc_token');
  localStorage.removeItem('vc_user');
}

// ─── Auth Guard ───────────────────────────────
function requireAuth(allowedRoles = []) {
  const token = getToken();
  const user  = getUser();
  if (!token || !user) {
    window.location.href = '/login.html';
    return null;
  }
  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    window.location.href = '/dashboard.html';
    return null;
  }
  return user;
}

function logout() {
  clearAuth();
  window.location.href = '/login.html';
}

// ─── API Fetch ────────────────────────────────
async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  try {
    const res = await fetch(API + endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
      }
    });

    if (res.status === 401) { clearAuth(); window.location.href = '/login.html'; return null; }

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed.');
    return data;
  } catch (err) {
    console.error('API error:', err.message);
    throw err;
  }
}

const api = {
  get:    (url)         => apiFetch(url),
  post:   (url, body)   => apiFetch(url, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (url, body)   => apiFetch(url, { method: 'PUT',    body: JSON.stringify(body) }),
  delete: (url)         => apiFetch(url, { method: 'DELETE' })
};

// ─── UI Helpers ───────────────────────────────
function renderNavUser() {
  const user = getUser();
  if (!user) return;
  const el = document.getElementById('nav-user');
  if (!el) return;
  const roleColors = { admin: '#dc2626', doctor: '#2563eb', receptionist: '#059669' };
  el.innerHTML = `
    <span class="nav-user-name">${user.name}</span>
    <span class="nav-role-badge" style="background:${roleColors[user.role] || '#6366f1'}">
      ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}
    </span>
    <button class="btn-logout" onclick="logout()">Logout</button>
  `;
}

function showToast(msg, type = 'success') {
  let toast = document.getElementById('vc-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'vc-toast';
    document.body.appendChild(toast);
  }
  toast.className = `vc-toast vc-toast-${type}`;
  toast.textContent = msg;
  toast.style.display = 'block';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.display = 'none'; }, 3200);
}

function showError(msg)   { showToast(msg, 'error'); }
function showSuccess(msg) { showToast(msg, 'success'); }

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function statusBadge(status) {
  const map = {
    pending:   { bg: '#fef3c7', color: '#92400e', label: 'Pending' },
    confirmed: { bg: '#dbeafe', color: '#1e40af', label: 'Confirmed' },
    completed: { bg: '#d1fae5', color: '#065f46', label: 'Completed' },
    cancelled: { bg: '#fee2e2', color: '#991b1b', label: 'Cancelled' }
  };
  const s = map[status] || { bg: '#f3f4f6', color: '#374151', label: status };
  return `<span style="background:${s.bg};color:${s.color};padding:2px 10px;border-radius:99px;font-size:0.75rem;font-weight:600;">${s.label}</span>`;
}

function openModal(id)  { const m = document.getElementById(id); if (m) m.style.display = 'flex'; }
function closeModal(id) { const m = document.getElementById(id); if (m) m.style.display = 'none'; }

// Close modal on backdrop click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) closeModal(e.target.id);
});
