
import type { ReactNode } from "react";

type Student = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  college?: string;
  department?: string;
  academicYear?: number | string;
  rollNumber?: string;
};

type DashboardPageProps = {
  user: Student;
  onLogout: () => void;
};

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
  const firstName = user.name?.trim().split(/\s+/)[0] || "Student";
  const initials = (user.name || "Student")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const academicYear = user.academicYear
    ? `Year ${user.academicYear}`
    : "Student";

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
            Student menu
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
              Raise a complaint to get support from your campus team.
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
                Student Portal
              </h2>
              <p className="text-xs text-slate-500">
                Your campus, all in one place
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold">{user.name || "Student"}</p>
                <p className="text-xs text-slate-500">{user.role || "student"}</p>
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
            <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 p-6 text-white shadow-lg sm:p-8">
              <p className="text-sm font-medium text-indigo-100">
                YOUR STUDENT DASHBOARD
              </p>
              <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
                Welcome back, {firstName}! 👋
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">
                Stay on top of your attendance, fees, academic progress, and
                campus updates — all from one place.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm">
                <span className="rounded-full bg-white/15 px-4 py-2">
                  {user.department || "Department not set"}
                </span>
                <span className="rounded-full bg-white/15 px-4 py-2">
                  {academicYear}
                </span>
                {user.rollNumber && (
                  <span className="rounded-full bg-white/15 px-4 py-2">
                    Roll No: {user.rollNumber}
                  </span>
                )}
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  Academic overview
                </h2>
                <span className="text-xs text-slate-500">Student summary</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  icon="📅"
                  label="Attendance"
                  value="--"
                  detail="Waiting for attendance data"
                />
                <StatCard
                  icon="💳"
                  label="Semester fees"
                  value="--"
                  detail="View your fee breakdown"
                />
                <StatCard
                  icon="🎓"
                  label="Scholarships"
                  value="--"
                  detail="Check eligibility and status"
                />
                <StatCard
                  icon="📝"
                  label="Academic results"
                  value="--"
                  detail="Your marks will appear here"
                />
              </div>
            </section>

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

              <Section title="Your student profile">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500">Full name</p>
                    <p className="mt-1 text-sm font-semibold">
                      {user.name || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Email address</p>
                    <p className="mt-1 break-all text-sm font-semibold">
                      {user.email || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">College</p>
                    <p className="mt-1 text-sm font-semibold">
                      {user.college || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Department</p>
                    <p className="mt-1 text-sm font-semibold">
                      {user.department || "Not provided"}
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
