import apiBaseUrl from '../config/apiBaseUrl';

const TOKEN_KEY = 'simonstorp_admin_token';

/** localStorage can throw in private mode — never let that break the page. */
export function getAdminToken() {
  try {
    return window.localStorage.getItem(TOKEN_KEY) || '';
  } catch (err) {
    return '';
  }
}

export function setAdminToken(token) {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch (err) {
    /* ignore — the session simply will not survive a reload */
  }
}

export async function adminLogin(email, password, rememberMe = false) {
  const res = await fetch(`${apiBaseUrl}/api/site-admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, rememberMe }),
  });

  if (!res.ok) {
    if (res.status === 429) {
      const minutes = Math.max(1, Math.ceil(Number(res.headers.get('Retry-After') || 900) / 60));
      throw new Error(`För många inloggningsförsök. Försök igen om ${minutes} minuter.`);
    }

    const message =
      res.status === 401
        ? 'Fel e-post eller lösenord.'
        : 'Kunde inte logga in just nu. Försök igen.';
    throw new Error(message);
  }

  const data = await res.json();
  setAdminToken(data.token);
  return data.user;
}

/** Confirms a stored token is still valid; returns null instead of throwing when it is not. */
export async function fetchAdminMe() {
  const token = getAdminToken();
  if (!token) return null;

  try {
    const res = await fetch(`${apiBaseUrl}/api/site-admin/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      setAdminToken('');
      return null;
    }

    const data = await res.json();

    // The server slides the expiry as the session is used; keep the fresher token.
    if (data.token) setAdminToken(data.token);

    return data.user;
  } catch (err) {
    return null;
  }
}

export async function fetchAdminUsers() {
  const token = getAdminToken();
  if (!token) return [];

  const res = await fetch(`${apiBaseUrl}/api/site-admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error('Kunde inte hämta användare.');

  const data = await res.json();
  return Array.isArray(data.users) ? data.users : [];
}

export async function createAdminInvite({ firstname, lastname, email }) {
  const token = getAdminToken();
  const res = await fetch(`${apiBaseUrl}/api/site-admin/invites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ firstname, lastname, email }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.error?.message || 'Kunde inte skapa inbjudan.');
  }

  return data.inviteUrl;
}

export async function readInvite(token) {
  const res = await fetch(`${apiBaseUrl}/api/site-admin/invites/${encodeURIComponent(token)}`);
  if (!res.ok) throw new Error('Länken är ogiltig eller redan använd.');
  return (await res.json()).invite;
}

export async function completeInvite(token, { password, firstname, lastname, privateEmail }) {
  const res = await fetch(
    `${apiBaseUrl}/api/site-admin/invites/${encodeURIComponent(token)}/complete`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, firstname, lastname, privateEmail }),
    }
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.error?.message || 'Kunde inte slutföra registreringen.');
  }

  return data;
}

export async function fetchPeople() {
  const token = getAdminToken();
  if (!token) return { people: [], mailConfigured: false };

  const res = await fetch(`${apiBaseUrl}/api/site-admin/people`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error('Kunde inte hämta personer.');

  return res.json();
}

export async function setBoardMember(userId, { roll, boardId } = {}) {
  const token = getAdminToken();
  const res = await fetch(`${apiBaseUrl}/api/site-admin/people/${userId}/styrelse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ roll, boardId }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || 'Kunde inte spara.');
  return true;
}

export async function removeBoardMember(userId) {
  const token = getAdminToken();
  const res = await fetch(`${apiBaseUrl}/api/site-admin/people/${userId}/styrelse`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || 'Kunde inte spara.');
  return true;
}

export async function setProfileOnBoard(boardId, onBoard) {
  const token = getAdminToken();
  const res = await fetch(`${apiBaseUrl}/api/site-admin/board/${boardId}`, {
    method: onBoard ? 'POST' : 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || 'Kunde inte flytta personen.');
  return true;
}

export async function activateMail(alias, destination) {
  const token = getAdminToken();
  const res = await fetch(`${apiBaseUrl}/api/site-admin/mail/activate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ alias, destination }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || 'Kunde inte aktivera adressen.');
  return data;
}

export function adminLogout() {
  setAdminToken('');
}
