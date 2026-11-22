
import { useEffect, useState } from "react";

type ModuleName =
  | "fees"
  | "scholarships"
  | "results"
  | "complaints"
  | "notifications";

type Props = {
  page: ModuleName;
  user: {
    name?: string;
    email?: string;
    department?: string;
    rollNumber?: string;
  };
  onBack: () => void;
  onLogout: () => void;
};

type SemesterResult = {
  _id: string;
  semester: number;
  sgpa: number;
};

type ResultsResponse = {
  success: boolean;
  student?: {
    rollNumber: string;
    currentSemester: number;
  };
  summary?: {
    totalSemesters: number;
    averageSGPA: number;
  };
  data?: SemesterResult[];
  message?: string;
};

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const pageInfo = {
  fees: {
    title: "Fees & Payments",
    subtitle: "View your semester fee details and payment status.",
    icon: "💳",
  },
  scholarships: {
    title: "Scholarships",
    subtitle: "Explore financial assistance and scholarship updates.",
    icon: "🎓",
  },
  results: {
    title: "Academic Results",
    subtitle: "Track your semester performance and academic progress.",
    icon: "📝",
  },
  complaints: {
    title: "Complaints & Support",
    subtitle: "Raise an issue and track your campus support requests.",
    icon: "💬",
  },
  notifications: {
    title: "Notifications",
    subtitle: "Stay updated with important campus announcements.",
    icon: "🔔",
  },
};

function Card({
  title,
  value,
  detail,
}: {
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

function DemoLabel() {
  return (
    <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
      UI preview · Demo data
    </span>
  );
}

export default function StudentModulePage({
  page,
  user,
  onBack,
  onLogout,
}: Props) {
  const [complaint, setComplaint] = useState("");
  const [category, setCategory] = useState("Academic");
  const [submitted, setSubmitted] = useState(false);

  const [semesterResults, setSemesterResults] = useState<SemesterResult[]>([]);
  const [averageSGPA, setAverageSGPA] = useState<number | null>(null);
  const [currentSemester, setCurrentSemester] = useState(7);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState("");

  const info = pageInfo[page];
  const name = user.name || "Student";

  useEffect(() => {
    if (page !== "results") return;

    const fetchSemesterResults = async () => {
      setResultsLoading(true);
      setResultsError("");

      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Please login again. Authentication token not found.");
        }

        const response = await fetch(
          `${API_BASE_URL}/semester-results/my-results`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const result: ResultsResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load semester results."
          );
        }

        setSemesterResults(result.data || []);
        setAverageSGPA(result.summary?.averageSGPA ?? null);
        setCurrentSemester(result.student?.currentSemester || 7);
      } catch (error) {
        console.error("Semester results error:", error);
        setResultsError(
          error instanceof Error
            ? error.message
            : "Something went wrong while loading results."
        );
      } finally {
        setResultsLoading(false);
      }
    };

    fetchSemesterResults();
  }, [page]);

  function submitComplaint() {
    if (!complaint.trim()) return;
    setSubmitted(true);
    setComplaint("");
  }

  const resultMap = new Map(
    semesterResults.map((result) => [result.semester, result])
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b border-slate-200 bg-white px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-xl font-bold text-white">
              C
            </div>
            <div>
              <h1 className="font-bold text-slate-900">CampusFlow AI</h1>
              <p className="text-xs text-slate-500">Smart Campus Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-100"
            >
              ← Dashboard
            </button>
            <button
              onClick={onLogout}
              className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-7 p-5 sm:p-8">
        <section className="rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 p-6 text-white shadow-lg sm:p-8">
          <p className="text-sm font-medium text-indigo-100">
            STUDENT PORTAL / {info.title.toUpperCase()}
          </p>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-4xl">{info.icon}</span>
            <h2 className="text-3xl font-bold">{info.title}</h2>
          </div>
          <p className="mt-3 max-w-2xl text-sm text-indigo-100">
            {info.subtitle}
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-white/15 px-4 py-2">
              {name}
            </span>
            <span className="rounded-full bg-white/15 px-4 py-2">
              {user.department || "Department not set"}
            </span>
            {user.rollNumber && (
              <span className="rounded-full bg-white/15 px-4 py-2">
                Roll No: {user.rollNumber}
              </span>
            )}
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-bold text-slate-900">
            {info.title} overview
          </h3>
          <DemoLabel />
        </div>

        {page === "fees" && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <Card title="Total semester fee" value="₹43,500" detail="Illustrative fee structure" />
              <Card title="Amount paid" value="Not available" detail="Requires verified fee record" />
              <Card title="Amount pending" value="Not available" detail="Requires verified fee record" />
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-bold">Semester fee breakdown</h3>
              {[
                ["Tuition Fee", "₹40,000"],
                ["Examination Fee", "₹2,000"],
                ["Library Fee", "₹1,000"],
                ["Other Charges", "₹500"],
              ].map(([label, amount]) => (
                <div key={label} className="flex justify-between border-b border-slate-100 py-4 text-sm">
                  <span className="text-slate-600">{label}</span>
                  <span className="font-semibold">{amount}</span>
                </div>
              ))}
              <div className="flex justify-between pt-5 text-lg font-bold">
                <span>Total</span>
                <span className="text-indigo-700">₹43,500</span>
              </div>
              <p className="mt-4 text-xs text-slate-500">
                This is a reference fee structure, not a verified personal invoice.
                Actual payable and pending amounts must come from the student's fee record.
              </p>
              <button
                disabled
                className="mt-6 w-full cursor-not-allowed rounded-xl bg-slate-300 px-5 py-3 font-semibold text-slate-600 sm:w-auto"
              >
                Pay Now · Payment integration pending
              </button>
            </section>
          </>
        )}

        {page === "scholarships" && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <Card title="Available programmes" value="03" detail="Illustrative opportunities" />
              <Card title="Application status" value="Not submitted" detail="No live application data" />
              <Card title="Awarded amount" value="Not verified" detail="Check with accounts department" />
            </div>
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="text-lg font-bold">Scholarship opportunities</h3>
              {[
                ["Merit-Based Scholarship", "Based on academic performance", "Eligibility review required"],
                ["Need-Based Scholarship", "Financial assistance programme", "Documents may be required"],
                ["Government Scholarship", "Government-supported assistance", "Check official eligibility"],
              ].map(([title, desc, status]) => (
                <article key={title} className="mt-4 rounded-xl border border-slate-200 p-5">
                  <div className="flex flex-wrap justify-between gap-2">
                    <h4 className="font-bold">{title}</h4>
                    <span className="text-xs font-semibold text-indigo-700">{status}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{desc}</p>
                </article>
              ))}
            </section>
          </>
        )}

        {page === "results" && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <Card
                title="Current semester"
                value={`Semester ${currentSemester}`}
                detail="Based on student profile"
              />
              <Card
                title="Average SGPA"
                value={
                  resultsLoading
                    ? "Loading..."
                    : averageSGPA !== null
                      ? averageSGPA.toFixed(2)
                      : "Not available"
                }
                detail="Average of available semester results"
              />
              <Card
                title="Published results"
                value={resultsLoading ? "..." : String(semesterResults.length)}
                detail="Semesters with available SGPA"
              />
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold">Semester-wise results</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Your academic performance across semesters.
                  </p>
                </div>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                  SGPA Scale: 10.0
                </span>
              </div>

              {resultsLoading && (
                <p className="mt-6 text-sm text-slate-500">
                  Loading your semester results...
                </p>
              )}

              {resultsError && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {resultsError}
                </div>
              )}

              {!resultsLoading && !resultsError && (
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="p-3">Semester</th>
                        <th className="p-3">SGPA</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from(
                        { length: Math.max(currentSemester, 7) },
                        (_, index) => index + 1
                      ).map((sem) => {
                        const result = resultMap.get(sem);
                        const isAwaited =
                          sem === currentSemester && !result;

                        return (
                          <tr key={sem} className="border-b border-slate-100">
                            <td className="p-3 font-medium">
                              Semester {sem}
                            </td>
                            <td className="p-3 font-semibold text-slate-900">
                              {result ? result.sgpa.toFixed(2) : "—"}
                            </td>
                            <td className="p-3">
                              {result ? (
                                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                  Published
                                </span>
                              ) : isAwaited ? (
                                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                                  Result Awaited
                                </span>
                              ) : (
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
                                  Not available
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {!resultsLoading &&
                !resultsError &&
                semesterResults.length === 0 && (
                  <p className="mt-5 text-sm text-slate-500">
                    No semester results have been published yet.
                  </p>
                )}

              <p className="mt-5 text-xs text-slate-400">
                Average SGPA is calculated from the available semester records.
                Semester 7 will show Result Awaited until its result is published.
              </p>
            </section>
          </>
        )}

        {page === "complaints" && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card title="Total complaints" value={submitted ? "1" : "0"} detail="This demo session" />
              <Card title="Resolved complaints" value="0" detail="No live complaint records" />
            </div>
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="text-lg font-bold">Raise a new complaint</h3>
              <p className="mt-1 text-sm text-slate-500">
                Describe your issue so the appropriate campus team can review it.
              </p>
              <label className="mt-5 block text-sm font-semibold">Complaint category</label>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 outline-none focus:border-indigo-500"
              >
                <option>Academic</option>
                <option>Accounts & Fees</option>
                <option>Infrastructure</option>
                <option>IT Support</option>
                <option>Other</option>
              </select>
              <label className="mt-5 block text-sm font-semibold">Describe your complaint</label>
              <textarea
                value={complaint}
                onChange={(event) => setComplaint(event.target.value)}
                rows={5}
                placeholder="Write your issue here..."
                className="mt-2 w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-indigo-500"
              />
              <button
                onClick={submitComplaint}
                className="mt-4 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
              >
                Submit complaint
              </button>
              {submitted && (
                <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                  Demo submission recorded in this page session only. Backend submission is not connected yet.
                </p>
              )}
              <p className="mt-3 text-xs text-slate-500">
                Selected category: {category}. This preview does not save complaints to the server.
              </p>
            </section>
          </>
        )}

        {page === "notifications" && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <Card title="Announcements" value="03" detail="Sample notifications" />
              <Card title="Unread" value="02" detail="Illustrative count" />
              <Card title="Latest update" value="Today" detail="Demo content" />
            </div>
            <section className="space-y-4">
              {[
                ["📢", "Campus announcement", "Important campus updates will be published here.", "General"],
                ["💳", "Fee reminder", "Check your semester fee status in Fees & Payments.", "Accounts"],
                ["📝", "Examination update", "Examination schedules and result updates will appear here.", "Academic"],
              ].map(([icon, title, message, category]) => (
                <article key={title} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                    {icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap justify-between gap-2">
                      <h4 className="font-bold text-slate-900">{title}</h4>
                      <span className="text-xs text-indigo-700">{category}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{message}</p>
                    <p className="mt-2 text-xs text-slate-400">Sample notification</p>
                  </div>
                </article>
              ))}
            </section>
          </>
        )}

        <footer className="pb-3 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} CampusFlow AI · Smart Campus Management
        </footer>
      </main>
    </div>
  );
}
