
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

type Student = {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
  college?: string;
  department?: string;
  academicYear?: number | string;
  rollNumber?: string;
};

type FeeStructure = {
  semester?: number;
  academicYear?: string;
  tuitionFee?: number;
  examFee?: number;
  libraryFee?: number;
  otherFee?: number;
  totalFee?: number;
  name?: string;
};

type Scholarship = {
  name?: string;
  title?: string;
  percentage?: number;
};

type StudentFee = {
  _id: string;
  academicYear: string;
  totalFee: number;
  scholarshipAmount: number;
  fine: number;
  payableAmount: number;
  paidAmount: number;
  pendingAmount: number;
  status: "pending" | "partial" | "paid";
  noDues: boolean;
  feeStructure?: FeeStructure;
  scholarship?: Scholarship | null;
};

type DashboardPageProps = {
  user: Student;
  onLogout: () => void;
};

type ProfileResponse = {
  success: boolean;
  message?: string;
  user?: Student;
};

type FeesResponse = {
  success: boolean;
  message?: string;
  count?: number;
  data?: StudentFee[];
};

const API_BASE_URL = "http://localhost:5000/api";

function formatCurrency(amount: number | undefined) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount ?? 0);
}

function StatCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: string;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-xl">
          {icon}
        </span>
      </div>
      <p className="mt-4 text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}

export default function DashboardPage({
  user,
  onLogout,
}: DashboardPageProps) {
  const [profile, setProfile] = useState<Student>(user);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");

  const [fees, setFees] = useState<StudentFee[]>([]);
  const [feesLoading, setFeesLoading] = useState(true);
  const [feesError, setFeesError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchProfile() {
      const token = localStorage.getItem("token");

      if (!token) {
        setProfileError("Your login token is missing. Please sign in again.");
        setProfileLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result: ProfileResponse = await response.json();

        if (!response.ok || !result.success || !result.user) {
          if (response.status === 401) {
            throw new Error(
              "Your session is invalid or expired. Please sign in again."
            );
          }

          throw new Error(result.message || "Failed to load your profile.");
        }

        if (!cancelled) {
          setProfile(result.user);
          setProfileError("");
          localStorage.setItem("user", JSON.stringify(result.user));
        }
      } catch (error) {
        if (!cancelled) {
          setProfileError(
            error instanceof Error
              ? error.message
              : "Could not connect to the profile API."
          );
        }
      } finally {
        if (!cancelled) {
          setProfileLoading(false);
        }
      }
    }

    void fetchProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchMyFees() {
      const token = localStorage.getItem("token");

      if (!token) {
        setFeesError("Please sign in again to view your fees.");
        setFeesLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/student-fees/my-fees`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result: FeesResponse = await response.json();

        if (!response.ok || !result.success) {
          if (response.status === 401) {
            throw new Error(
              "Your session is invalid or expired. Please sign in again."
            );
          }

          throw new Error(result.message || "Could not load your fee records.");
        }

        if (!cancelled) {
          setFees(Array.isArray(result.data) ? result.data : []);
          setFeesError("");
        }
      } catch (error) {
        if (!cancelled) {
          setFeesError(
            error instanceof Error
              ? error.message
              : "Could not connect to the fees API."
          );
        }
      } finally {
        if (!cancelled) {
          setFeesLoading(false);
        }
      }
    }

    void fetchMyFees();

    return () => {
      cancelled = true;
    };
  }, []);

  const firstName = profile.name?.trim().split(/\s+/)[0] || "Student";

  const initials = (profile.name || "Student")
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const academicYear = profile.academicYear
    ? `Year ${profile.academicYear}`
    : "Year not set";

  const isAdmin = profile.role?.toLowerCase() === "admin";
  const portalTitle = isAdmin ? "Admin Portal" : "Student Portal";

  const totalPayable = fees.reduce(
    (sum, fee) => sum + (fee.payableAmount ?? 0),
    0
  );

  const totalPaid = fees.reduce(
    (sum, fee) => sum + (fee.paidAmount ?? 0),
    0
  );

  const totalPending = fees.reduce(
    (sum, fee) => sum + (fee.pendingAmount ?? 0),
    0
  );

  const totalScholarship = fees.reduce(
    (sum, fee) => sum + (fee.scholarshipAmount ?? 0),
    0
  );

  const totalFines = fees.reduce(
    (sum, fee) => sum + (fee.fine ?? 0),
    0
  );

  const quickLinks = [
    { icon: "📅", title: "Attendance", description: "Track your classes" },
    { icon: "💳", title: "Semester Fees", description: "View fee details" },
    { icon: "🎓", title: "Scholarships", description: "Explore assistance" },
    { icon: "📝", title: "Results", description: "View academic results" },
    { icon: "💬", title: "Complaints", description: "Get campus support" },
    { icon: "📄", title: "No-Dues", description: "Check clearance status" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col bg-slate-950 px-5 py-7 text-white md:flex">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500 text-xl font-bold">
              C
            </div>
            <div>
              <h1 className="text-lg font-bold">CampusFlow AI</h1>
              <p className="text-xs text-slate-400">Smart Campus Platform</p>
            </div>
          </div>

          <p className="mb-3 mt-10 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            {isAdmin ? "Admin menu" : "Student menu"}
          </p>

          <nav className="space-y-2">
            {[
              ["🏠", "Dashboard"],
              ["📅", "Attendance"],
              ["💳", "Fees & Payments"],
              ["🎓", "Scholarships"],
              ["📝", "Results"],
              ["💬", "Complaints"],
              ["🔔", "Notifications"],
            ].map(([icon, label], index) => (
              <div
                key={label}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm ${
                  index === 0
                    ? "bg-indigo-600 font-semibold text-white"
                    : "text-slate-300"
                }`}
              >
                <span>{icon}</span>
                {label}
              </div>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm font-semibold">Need help?</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              {isAdmin
                ? "Manage campus information and support requests."
                : "Raise a complaint to get support from your campus team."}
            </p>
            <p className="mt-3 text-xs font-semibold text-indigo-300">
              Campus support
            </p>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4 sm:px-8">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {portalTitle}
              </h2>
              <p className="text-xs text-slate-500">
                Your campus, all in one place
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold">
                  {profile.name || "User"}
                </p>
                <p className="text-xs capitalize text-slate-500">
                  {profile.role || "student"}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                {initials}
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                Log out
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-7xl space-y-7 p-5 sm:p-8">
            {profileLoading && (
              <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-700">
                Loading your latest profile...
              </div>
            )}

            {profileError && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                <p className="font-semibold">Could not refresh your profile</p>
                <p className="mt-1">{profileError}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-3 rounded-lg border border-red-200 bg-white px-3 py-2 font-semibold hover:bg-red-100"
                >
                  Try again
                </button>
              </div>
            )}

            <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 p-6 text-white shadow-lg sm:p-8">
              <p className="text-sm font-medium text-indigo-100">
                {isAdmin ? "YOUR ADMIN DASHBOARD" : "YOUR STUDENT DASHBOARD"}
              </p>
              <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
                Welcome back, {firstName}! 👋
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">
                {isAdmin
                  ? "Access your campus management tools and stay informed about campus activities."
                  : "Stay on top of your attendance, fees, academic progress, and campus updates — all from one place."}
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm">
                <span className="rounded-full bg-white/15 px-4 py-2">
                  {profile.department || "Department not set"}
                </span>
                <span className="rounded-full bg-white/15 px-4 py-2">
                  {academicYear}
                </span>
                {profile.rollNumber && (
                  <span className="rounded-full bg-white/15 px-4 py-2">
                    Roll No: {profile.rollNumber}
                  </span>
                )}
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  {isAdmin ? "Campus overview" : "Academic overview"}
                </h2>
                <span className="text-xs text-slate-500">
                  {isAdmin ? "Administrator summary" : "Student summary"}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  icon="📅"
                  label="Attendance"
                  value="--"
                  detail="Attendance data not connected yet"
                />

                <StatCard
                  icon="💳"
                  label="Total payable"
                  value={
                    feesLoading
                      ? "Loading..."
                      : feesError
                        ? "--"
                        : formatCurrency(totalPayable)
                  }
                  detail={
                    feesLoading
                      ? "Fetching your fee records"
                      : feesError
                        ? "Unable to load fee data"
                        : `${fees.length} fee record(s)`
                  }
                />

                <StatCard
                  icon="💰"
                  label="Amount paid"
                  value={
                    feesLoading || feesError ? "--" : formatCurrency(totalPaid)
                  }
                  detail="Payments recorded in your fee records"
                />

                <StatCard
                  icon="⏳"
                  label="Amount pending"
                  value={
                    feesLoading || feesError
                      ? "--"
                      : formatCurrency(totalPending)
                  }
                  detail="Outstanding fee balance"
                />
              </div>
            </section>

            <Section title="Semester fees & payments">
              {feesLoading && (
                <p className="text-sm text-slate-500">
                  Loading your fee details from the server...
                </p>
              )}

              {feesError && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                  <p className="font-semibold">Could not load your fees</p>
                  <p className="mt-1">{feesError}</p>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-3 rounded-lg border border-red-200 bg-white px-3 py-2 font-semibold hover:bg-red-100"
                  >
                    Try again
                  </button>
                </div>
              )}

              {!feesLoading && !feesError && fees.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
                  <p className="font-semibold text-slate-800">
                    No fee records found
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Your account does not have any linked student fee records
                    yet. Contact the college accounts department if this seems
                    incorrect.
                  </p>
                </div>
              )}

              {!feesLoading && !feesError && fees.length > 0 && (
                <>
                  <div className="mb-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-indigo-50 p-4">
                      <p className="text-sm text-indigo-700">
                        Scholarship deduction
                      </p>
                      <p className="mt-2 text-xl font-bold text-indigo-950">
                        {formatCurrency(totalScholarship)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-amber-50 p-4">
                      <p className="text-sm text-amber-700">Total fines</p>
                      <p className="mt-2 text-xl font-bold text-amber-950">
                        {formatCurrency(totalFines)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-emerald-50 p-4">
                      <p className="text-sm text-emerald-700">No-dues status</p>
                      <p className="mt-2 text-xl font-bold text-emerald-950">
                        {fees.every((fee) => fee.noDues) ? "Cleared" : "Pending"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {fees.map((fee) => (
                      <article
                        key={fee._id}
                        className="rounded-xl border border-slate-200 p-4 sm:p-5"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-slate-900">
                              {fee.feeStructure?.semester
                                ? `Semester ${fee.feeStructure.semester}`
                                : "Semester fee"}
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                              Academic year: {fee.academicYear}
                            </p>
                            {fee.scholarship && (
                              <p className="mt-1 text-sm text-indigo-700">
                                Scholarship:{" "}
                                {fee.scholarship.name ||
                                  fee.scholarship.title ||
                                  "Applied"}
                              </p>
                            )}
                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                              fee.status === "paid"
                                ? "bg-emerald-100 text-emerald-700"
                                : fee.status === "partial"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {fee.status}
                          </span>
                        </div>

                        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <div>
                            <p className="text-xs text-slate-500">
                              Original fee
                            </p>
                            <p className="mt-1 font-semibold">
                              {formatCurrency(fee.totalFee)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">
                              Scholarship deduction
                            </p>
                            <p className="mt-1 font-semibold text-emerald-700">
                              − {formatCurrency(fee.scholarshipAmount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Fine</p>
                            <p className="mt-1 font-semibold">
                              {formatCurrency(fee.fine)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">
                              Total payable
                            </p>
                            <p className="mt-1 font-semibold">
                              {formatCurrency(fee.payableAmount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Amount paid</p>
                            <p className="mt-1 font-semibold text-emerald-700">
                              {formatCurrency(fee.paidAmount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">
                              Amount pending
                            </p>
                            <p className="mt-1 font-semibold text-red-700">
                              {formatCurrency(fee.pendingAmount)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5">
                          <div className="mb-2 flex justify-between text-xs text-slate-500">
                            <span>Payment progress</span>
                            <span>
                              {fee.payableAmount > 0
                                ? Math.min(
                                    100,
                                    Math.round(
                                      (fee.paidAmount / fee.payableAmount) *
                                        100
                                    )
                                  )
                                : 100}
                              %
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-indigo-600 transition-all"
                              style={{
                                width: `${
                                  fee.payableAmount > 0
                                    ? Math.min(
                                        100,
                                        (fee.paidAmount / fee.payableAmount) *
                                          100
                                      )
                                    : 100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </Section>

            <section>
              <h2 className="mb-4 text-xl font-bold text-slate-900">
                Quick access
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {quickLinks.map((item) => (
                  <button
                    type="button"
                    key={item.title}
                    onClick={() =>
                      window.alert(
                        `${item.title} will be connected to the backend next.`
                      )
                    }
                    className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-indigo-300 hover:shadow-md"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-2xl transition group-hover:bg-indigo-100">
                      {item.icon}
                    </span>
                    <span>
                      <span className="block font-bold text-slate-900">
                        {item.title}
                      </span>
                      <span className="mt-1 block text-sm text-slate-500">
                        {item.description}
                      </span>
                    </span>
                    <span className="ml-auto text-slate-400">→</span>
                  </button>
                ))}
              </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
              <Section title="Recent notifications">
                <div className="flex gap-3 rounded-xl bg-indigo-50 p-4">
                  <span className="text-xl">🔔</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Welcome to CampusFlow AI
                    </p>
                    <p className="mt-1 text-sm leading-5 text-slate-600">
                      Your account is ready. Campus announcements and updates
                      will appear here.
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-xs text-slate-400">
                  Live notifications will be connected next.
                </p>
              </Section>

              <Section title="Your profile">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500">Full name</p>
                    <p className="mt-1 text-sm font-semibold">
                      {profile.name || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Email address</p>
                    <p className="mt-1 break-all text-sm font-semibold">
                      {profile.email || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Role</p>
                    <p className="mt-1 text-sm font-semibold capitalize">
                      {profile.role || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">College</p>
                    <p className="mt-1 text-sm font-semibold">
                      {profile.college || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Department</p>
                    <p className="mt-1 text-sm font-semibold">
                      {profile.department || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Academic year</p>
                    <p className="mt-1 text-sm font-semibold">
                      {profile.academicYear || "Not provided"}
                    </p>
                  </div>
                </div>
              </Section>
            </div>

            <footer className="pb-2 text-center text-xs text-slate-400">
              © {new Date().getFullYear()} CampusFlow AI · Smart Campus
              Management
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
