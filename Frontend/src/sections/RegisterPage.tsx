
import { useState } from "react";
import Logo from "../components/Logo";
import InputField from "../components/Inputfield";
import Button from "../components/Button";
import { registerUser } from "../services/auth";

type RegisterPageProps = {
  onLoginClick: () => void;
};

export default function RegisterPage({
  onLoginClick,
}: RegisterPageProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      await registerUser({ name, email, password });
      setSuccess("Account created successfully! Please sign in.");
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Registration failed"
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
            Create your account
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Join CampusFlow AI to get started.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <InputField
            label="Full name"
            placeholder="Enter your full name"
            value={name}
            onChange={setName}
          />

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
            placeholder="At least 8 characters"
            value={password}
            onChange={setPassword}
          />

          <InputField
            label="Confirm password"
            type="password"
            placeholder="Enter your password again"
            value={confirmPassword}
            onChange={setConfirmPassword}
          />

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          {success && (
            <p className="text-sm text-green-700" role="status">
              {success}
            </p>
          )}

          <Button disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onLoginClick}
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
