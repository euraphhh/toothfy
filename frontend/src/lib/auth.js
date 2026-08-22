export const setToken = (token) => localStorage.setItem('saas_token', token);
export const getToken = () => localStorage.getItem('saas_token');
export const removeToken = () => localStorage.removeItem('saas_token');
export const isAuthenticated = () => !!getToken();

// Wrapper helper para chamadas de API autenticadas
export const fetchApi = async (url, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Remove /api prefix since backend routes are mounted at root
  let apiPath = url;
  if (apiPath.startsWith('/api/')) {
    apiPath = apiPath.replace('/api/', '/');
  }

  const fullUrl = apiPath.startsWith('/') ? `http://localhost:3000${apiPath}` : apiPath;
  const response = await fetch(fullUrl, { ...options, headers });
  
  if (response.status === 401) {
    removeToken();
    window.location.href = '/login';
  }

  return response;
};
