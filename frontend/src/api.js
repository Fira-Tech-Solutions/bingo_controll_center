const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

function buildHeaders(token, extra = {}) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  }
}

async function request(path, { method = 'GET', token, body, headers } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: buildHeaders(token, headers),
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Request failed')
  }
  return data
}

export const api = {
  // Auth
  login: (body) => request('/auth/login', { method: 'POST', body }),
  me: (token) => request('/auth/me', { token }),
  logout: (token) => request('/auth/logout', { method: 'POST', token }),

  // Analytics
  getAnalytics: (token) => request('/analytics', { token }),

  // Centers
  getCenters: (token, createdBy) => request(`/bingo-centers${createdBy ? `?createdBy=${encodeURIComponent(createdBy)}` : ''}`, { token }),
  createCenter: (token, body) => request('/bingo-centers', { method: 'POST', token, body }),
  rechargeCenter: (token, body) => request('/bingo-centers/recharge', { method: 'POST', token, body }),
  regenerateUserFile: (token, body) => request('/bingo-centers/regenerate-user-file', { method: 'POST', token, body }),
  deleteCenter: (token, username) => request(`/bingo-centers/${encodeURIComponent(username)}`, { method: 'DELETE', token }),
  addOnlineTopup: (token, body) => request('/bingo-centers/online-topup', { method: 'POST', token, body }),

  // Transactions
  getTransactions: (token, debitedBy) => request(`/transactions${debitedBy ? `?debitedBy=${encodeURIComponent(debitedBy)}` : ''}`, { token }),

  // Operators (Agents)
  getOperators: (token) => request('/operators', { token }),
  createOperator: (token, body) => request('/operators', { method: 'POST', token, body }),
  toggleOperatorBan: (token, username) => request(`/operators/${encodeURIComponent(username)}/ban`, { method: 'PUT', token }),
  resetOperatorPassword: (token, username, body) => request(`/operators/${encodeURIComponent(username)}/reset-password`, { method: 'PUT', token, body }),
  deleteOperator: (token, username) => request(`/operators/${encodeURIComponent(username)}`, { method: 'DELETE', token }),

  // Admins (SUPER_ADMIN only)
  getAdmins: (token) => request('/admins', { token }),
  createAdmin: (token, body) => request('/admins', { method: 'POST', token, body }),
  toggleAdminBan: (token, username) => request(`/admins/${encodeURIComponent(username)}/ban`, { method: 'PUT', token }),
  resetAdminPassword: (token, username, body) => request(`/admins/${encodeURIComponent(username)}/reset-password`, { method: 'PUT', token, body }),
  deleteAdmin: (token, username) => request(`/admins/${encodeURIComponent(username)}`, { method: 'DELETE', token }),

  // Packages
  getPackages: (token, page, limit) => request(`/packages?page=${page || 1}&limit=${limit || 20}`, { token }),
  getActivePackages: (token) => request('/packages/active', { token }),
  createPackage: (token, body) => request('/packages', { method: 'POST', token, body }),
  updatePackage: (token, id, body) => request(`/packages/${id}`, { method: 'PUT', token, body }),
  togglePackage: (token, id) => request(`/packages/${id}/toggle`, { method: 'PATCH', token }),
  getPackageUsage: (token, id) => request(`/packages/${id}/usage`, { token }),

  // Profile
  updateProfile: (token, body) => request('/users/profile', { method: 'PUT', token, body }),
}

export { API_BASE }
