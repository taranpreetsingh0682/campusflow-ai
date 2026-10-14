
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

type AuthResponse = {
  success?: boolean;
  message?: string;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    college?: string;
    department?: string;
    academicYear?: string | number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

async function parseResponse(response: Response): Promise<AuthResponse> {
  const responseText = await response.text();

  let result: AuthResponse;

  try {
    result = responseText ? JSON.parse(responseText) : {};
  } catch {
    console.error(
      "API returned a non-JSON response:",
      response.status,
      responseText.slice(0, 300)
    );

    throw new Error(
      `The server returned an invalid response (HTTP ${response.status}). Check the API URL and backend route.`
    );
  }

  if (!response.ok) {
    throw new Error(
      typeof result.message === "string"
        ? result.message
        : `Request failed with status ${response.status}`
    );
  }

  if (response.status === 204 || !responseText) {
    throw new Error(
      "The server returned an empty response. Check the backend route."
    );
  }

  return result;
}

export async function registerUser(
  data: RegisterData
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await parseResponse(response);

  if (result.success === false) {
    throw new Error(
      typeof result.message === "string"
        ? result.message
        : "Registration failed"
    );
  }

  return result;
}

export async function loginUser(
  data: LoginData
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  console.log("Login HTTP status:", response.status);

  const result = await parseResponse(response);

  if (!result.token || !result.user) {
    throw new Error(
      typeof result.message === "string"
        ? result.message
        : "Login response is missing the authentication token or user details."
    );
  }

  // Never print the authentication token to the console.
  console.log("Login successful:", {
    email: result.user.email,
    role: result.user.role,
  });

  return result;
}
