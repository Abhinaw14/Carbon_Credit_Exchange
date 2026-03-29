const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getToken = () => localStorage.getItem('jwt');

const authHeaders = () => {
    const h = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
};

// ---- Credits ----

export async function submitCredit(data) {
    const res = await fetch(`${API_URL}/api/credits/submit`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function getAllCredits(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_URL}/api/credits${params ? `?${params}` : ''}`);
    return res.json();
}

export async function getCreditById(id) {
    const res = await fetch(`${API_URL}/api/credits/${id}`);
    return res.json();
}

export async function getPendingCredits() {
    const res = await fetch(`${API_URL}/api/credits/pending`, {
        headers: authHeaders(),
    });
    return res.json();
}

export async function approveCredit(id) {
    const res = await fetch(`${API_URL}/api/credits/${id}/approve`, {
        method: 'PATCH',
        headers: authHeaders(),
    });
    return res.json();
}

export async function rejectCredit(id, reason) {
    const res = await fetch(`${API_URL}/api/credits/${id}/reject`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ reason }),
    });
    return res.json();
}

export async function markCreditMinted(id, tokenId) {
    const res = await fetch(`${API_URL}/api/credits/${id}/mint`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ tokenId }),
    });
    return res.json();
}

// ---- Auctions ----

export async function getAuctions(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_URL}/api/auctions${params ? `?${params}` : ''}`);
    return res.json();
}

export async function getAuctionById(auctionId) {
    const res = await fetch(`${API_URL}/api/auctions/${auctionId}`);
    return res.json();
}
