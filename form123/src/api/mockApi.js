const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").trim();

function getApiBaseUrl() {
  if (rawBaseUrl) {
    return rawBaseUrl.replace(/\/+$/, "");
  }

  // Helpful local default so `npm run dev` works without extra setup.
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:3002";
  }

  throw new Error(
    "Missing API configuration. Set VITE_API_BASE_URL to your backend HTTPS URL."
  );
}

export const registerUser = async (userData) => {
  const apiBaseUrl = getApiBaseUrl();
  const response = await fetch(`${apiBaseUrl}/register`, {
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

