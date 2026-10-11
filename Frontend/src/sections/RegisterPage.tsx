
import { useState } from "react";
import Logo from "../components/Logo";
import InputField from "../components/Inputfield";
import Button from "../components/Button";
import { registerUser } from "../services/auth";

type RegisterPageProps = {
  onLoginClick: () => void;
};

const colleges = [
  "Ambala College of Engineering and Applied Research",
  "Maharishi Markandeshwar University",
  "Chandigarh University",
  "Chitkara University",
  "Kurukshetra University",
  "Chandigarh Engineering College",
];

const departments = [
  { label: "Artificial Intelligence & Machine Learning", value: "AIML" },
  { label: "Computer Science & Engineering", value: "CSE" },
  { label: "Mechanical Engineering", value: "ME" },
  { label: "Electrical Engineering", value: "EE" },
  { label: "Automation", value: "AUTO" },
  { label: "Business Administration (BBA)", value: "BBA" },
];

export default function RegisterPage({
  onLoginClick,
}: RegisterPageProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredColleges = colleges.filter((item) =>
    item.toLowerCase().includes(college.trim().toLowerCase())
  );

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!colleges.some(
      (item) => item.toLowerCase() === college.trim().toLowerCase()
    )) {
      setError("Please select a college from the suggestions.");
      return;
    }

    if (!department || !academicYear) {
      setError("Please select your department and academic year.");
      return;
    }

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
      await registerUser({
        name,
        email,
        password,
        department,
        college,
        academicYear,
      });

      setSuccess("Account created! You can now sign in.");
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setCollege("");
      setDepartment("");
      setAcademicYear("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/60 sm:p-10">
        <div className="mb-8">
          <Logo />

          <h2 className="mt-8 text-2xl font-bold text-slate-900">
            Create your account
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Join CampusFlow AI to manage your campus journey.
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

          <div>
            <label
              htmlFor="college"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              College name
            </label>

            <input
              id="college"
              type="text"
              list="college-options"
              autoComplete="off"
              placeholder="Start typing your college name..."
              value={college}
              onChange={(event) => setCollege(event.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />

            <datalist id="college-options">
              {filteredColleges.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>

            <p className="mt-1 text-xs text-slate-500">
              Type a few letters and choose a matching college.
            </p>
          </div>

          <div>
            <label
              htmlFor="department"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Department
            </label>

            <select
              id="department"
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="">Select your department</option>
              {departments.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="academicYear"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Current academic year
            </label>

            <select
              id="academicYear"
              value={academicYear}
              onChange={(event) => setAcademicYear(event.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="">Select your year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

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
