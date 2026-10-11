
import { useState } from "react";
import Logo from "../components/Logo";
import InputField from "../components/Inputfield";
import Button from "../components/Button";
import { loginUser } from "../services/auth";

type LoginPageProps = {
  onLoginSuccess: (user: {
    id: string;
    name: string;
    email: string;
    role: string;
    department?: string;
  }) => void;
  onRegisterClick: () => void;
};

export default function LoginPage({
  onLoginSuccess,
  onRegisterClick,
}: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

      // Debug: inspect the actual backend response.
      console.log("Full login response:", result);

      if (!result || !result.token || !result.user) {
        throw new Error(
          "Login response is missing the token or user. Check the backend response in the Console."
        );
      }

      // Save authentication details.
      localStorage.setItem("token", result.token);
      localStorage.setItem(
        "user",
        JSON.stringify(result.user)
      );

      console.log("Login successful. User:", result.user);

      // Notify the parent component to open the dashboard.
      onLoginSuccess(result.user);
    } catch (err) {
      console.error("Login error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/60 sm:p-10">
        <div className="mb-8">
          <Logo />

          <h2 className="mt-8 text-2xl font-bold text-slate-900">
            Welcome back!
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Sign in to your CampusFlow AI account.
          </p>
        </div>

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
            <p
              className="text-sm text-red-600"
              role="alert"
            >
              {error}
            </p>
          )}

          <Button disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

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

        <p className="mt-8 text-center text-xs text-slate-400">
          CampusFlow AI · Smart Campus Management
        </p>
      </div>
    </div>
  );
}
