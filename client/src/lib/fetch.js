
async function apiRequest(route, method = 'GET', payload = null) {
  const options = {
    method: method.toUpperCase(),
    headers: {
      'Content-Type': 'application/json',
    },
  };


  if (payload && !['GET', 'HEAD'].includes(options.method)) {
    options.body = JSON.stringify(payload);
  }

  try {
    const response = await fetch(route, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})); 
      throw new Error(errorData.message || `HTTP Error: ${response.status} ${response.statusText}`);
    }

    if (response.status === 204) {
      return null;
    }


    return await response.json();
    
  } catch (error) {
    console.error(`[API Request Failed] ${method} ${route}:`, error.message);
    throw error; 
  }
}

export default apiRequest;