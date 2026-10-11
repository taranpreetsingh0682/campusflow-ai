
import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import Logo from "../components/Logo";
import InputField from "../components/Inputfield";
import Button from "../components/Button";
import { loginUser } from "../services/auth";

type AppUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  college?: string;
  department?: string;
  academicYear?: number | string;
  rollNumber?: string;
};

type LoginPageProps = {
  onLoginSuccess: (user: AppUser) => void;
  onRegisterClick: () => void;
};

type GoogleProfile = {
  name: string;
  email: string;
};

const API_BASE_URL = "http://localhost:5000/api/auth";

export default function LoginPage({
  onLoginSuccess,
  onRegisterClick,
}: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [googleCredential, setGoogleCredential] = useState("");
  const [googleProfile, setGoogleProfile] =
    useState<GoogleProfile | null>(null);
  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");
  const [academicYear, setAcademicYear] = useState("1");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await loginUser({
        email: email.trim(),
        password,
      });

      if (!result?.token || !result?.user) {
        throw new Error("Login response is missing the token or user.");
      }

      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));

      onLoginSuccess(result.user as AppUser);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login failed."
      );
    } finally {
      setLoading(false);
    }
  }

  async function authenticateWithGoogle(
    credential: string,
    profile?: {
      college: string;
      department: string;
      academicYear: string;
    }
  ) {
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential,
          ...(profile ?? {}),
        }),
      });

      const result = await response.json();

      if (result.needsProfile) {
        setGoogleCredential(credential);
        setGoogleProfile(result.googleUser);
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Google sign-in failed."
        );
      }

      if (!result.token || !result.user) {
        throw new Error(
          "Google sign-in response is missing the token or user."
        );
      }

      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));

      setGoogleCredential("");
      setGoogleProfile(null);
      onLoginSuccess(result.user as AppUser);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Google sign-in failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleProfileSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!googleCredential) {
      setError("Please start Google sign-in again.");
      setGoogleProfile(null);
      return;
    }

    await authenticateWithGoogle(googleCredential, {
      college: college.trim(),
      department: department.trim(),
      academicYear,
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/60 sm:p-10">
        <div className="mb-8">
          <Logo />
          <h2 className="mt-8 text-2xl font-bold text-slate-900">
            {googleProfile ? "Complete your profile" : "Welcome back!"}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {googleProfile
              ? "Add your student details to finish creating your account."
              : "Sign in to your CampusFlow AI account."}
          </p>
        </div>

        {googleProfile ? (
          <form
            onSubmit={handleGoogleProfileSubmit}
            className="space-y-5"
          >
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-sm font-semibold text-slate-800">
                {googleProfile.name}
              </p>
              <p className="break-all text-sm text-slate-500">
                {googleProfile.email}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Verified with Google
              </p>
            </div>

            <InputField
              label="College"
              type="text"
              placeholder="Enter your college name"
              value={college}
              onChange={setCollege}
            />

            <div>
              <label
                htmlFor="google-department"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Department
              </label>
              <select
                id="google-department"
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">Select department</option>
                <option value="AIML">Artificial Intelligence & ML</option>
                <option value="CSE">Computer Science Engineering</option>
                <option value="ME">Mechanical Engineering</option>
                <option value="EE">Electrical Engineering</option>
                <option value="AUTO">Automation</option>
                <option value="BBA">BBA</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="google-academic-year"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Academic year
              </label>
              <select
                id="google-academic-year"
                value={academicYear}
                onChange={(event) => setAcademicYear(event.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>

            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <Button disabled={loading}>
              {loading ? "Creating account..." : "Complete registration"}
            </Button>

            <button
              type="button"
              onClick={() => {
                setGoogleProfile(null);
                setGoogleCredential("");
                setError("");
              }}
              className="w-full text-sm font-semibold text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
          </form>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-5">
              <InputField
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={setEmail}
              />

              <InputField
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={setPassword}
              />

              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}

              <Button disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs text-slate-400">OR</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={(response) => {
                  if (!response.credential) {
                    setError("Google did not return a credential. Try again.");
                    return;
                  }

                  void authenticateWithGoogle(response.credential);
                }}
                onError={() => {
                  setError("Google sign-in was cancelled or failed.");
                }}
                text="continue_with"
                shape="rectangular"
                theme="outline"
                width="320"
              />
            </div>

            {loading && (
              <p className="mt-3 text-center text-sm text-slate-500">
                Verifying your account...
              </p>
            )}

            {error && (
              <p className="mt-3 text-center text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
          </>
        )}

        {!googleProfile && (
          <p className="mt-6 text-center text-sm text-slate-600">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={onRegisterClick}
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Create account
            </button>
          </p>
        )}

        <p className="mt-8 text-center text-xs text-slate-400">
          CampusFlow AI · Smart Campus Management
        </p>
      </div>
    </div>
  );
}
