
'use client';

const BASE = "https://fin-box-60055976513.development.catalystserverless.in/server/user_authentication/";

async function fetchJson(url: string, opts: RequestInit = {}) {
    const response = await fetch(url, {
        ...opts,
        headers: {
            ...(opts.headers || {}),
            "ZCFKEY": "d7ba0471c01800ec829288136f25d664",
            "Content-Type": "application/json"
        }
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred.' }));
        throw new Error(errorData.message || 'Request failed');
    }
    return response.json();
}

export async function signInWithEmailAndPassword(email: string, password: string) {
  return fetchJson(BASE + "login", {
    method: "POST",
    body: JSON.stringify({ email_address: email, password: password }),
  });
}

export async function createUserWithEmailAndPassword(name: string, email: string, password: string) {
  return fetchJson(BASE + "register", {
    method: "POST",
    body: JSON.stringify({ name: name, email_address: email, password: password }),
  });
}

export async function signOut() {
  // Zoho Catalyst logout might not need a specific endpoint call from client,
  // often it's just clearing client-side session.
  // If a server call is needed, it would be here.
  // For now, we'll just clear client state.
  return Promise.resolve();
}

export async function signInWithZoho() {
  // This is a placeholder. In a real app, this would redirect
  // to the Zoho authentication URL. The backend would handle the callback.
  console.log('Redirecting to Zoho for authentication...');
  // Example: window.location.href = 'https://accounts.zoho.com/oauth/v2/auth?scope=...&client_id=...&redirect_uri=...';
  
  // For now, we'll simulate a failed login for demonstration purposes.
  return Promise.reject(new Error("Zoho Sign-In is not configured yet. This is a placeholder."));
}
