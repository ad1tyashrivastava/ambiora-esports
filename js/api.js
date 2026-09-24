async function apiRequest(path, method = 'GET', body) {
  const options = {
    method: method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(path, options);
  } catch (networkError) {
    throw new Error('Cannot reach the server. Check your internet connection.');
  }

  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    throw new Error('The server did not send JSON. Run the site with "vercel dev", not Live Server.');
  }

  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status}).`);
  }
  return data;
}