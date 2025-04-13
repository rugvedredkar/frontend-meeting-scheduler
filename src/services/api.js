const API_BASE = "http://10.0.0.243:8080"; // Change this if you're deployed

export async function verifyUser(idToken) {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id_token: idToken }),
  });

  if (!res.ok) throw new Error("Login failed");
  return await res.json(); // this contains user info from the backend
}