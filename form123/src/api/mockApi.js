const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").trim();

export const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data?.message || "Request failed.");
    if (data?.code) error.code = data.code;
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

