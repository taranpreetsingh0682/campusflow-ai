
const API_BASE_URL = "https://campusflow-ai-khet.onrender.com/api";

export type RegisterData = {
  name: string;
  email: string;
  password: string;
  college: string;
  department: string;
  academicYear: string;
};

export type LoginData = {
  email: string;
  password: string;
};

export async function registerUser(data: RegisterData) {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Registration failed");
  }

  return result;
}

export async function loginUser(data: LoginData) {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  console.log("Login HTTP status:", response.status);

  // Read the response safely, including an unexpected empty response.
  const responseText = await response.text();

  let result: any;

  try {
    result = responseText ? JSON.parse(responseText) : null;
  } catch {
    console.error("Login returned invalid JSON:", responseText);
    throw new Error("The server returned an invalid response.");
  }

  console.log("Login API response:", {
    ...result,
    token: result?.token ? "[REDACTED]" : undefined,
  });

  if (!response.ok) {
    throw new Error(
      result?.message || `Login failed with status ${response.status}`
    );
  }

  if (response.status === 204 || !result) {
    throw new Error(
      "The login server returned an empty response. Check the backend login route."
    );
  }

  if (!result.token || !result.user) {
    throw new Error(
      result.message ||
        "Login response is missing the authentication token or user details."
    );
  }

  return result;
}
