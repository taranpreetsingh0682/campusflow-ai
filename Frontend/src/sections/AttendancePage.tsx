
import { useEffect, useState } from "react";

type User = {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
  studentId?: string;
  student?: {
    _id?: string;
    id?: string;
  };
};

type AttendanceRecord = {
  _id: string;
  date: string;
  status: "present" | "absent";
  subject?: {
    name?: string;
    code?: string;
  };
  faculty?: {
    employeeId?: string;
  };
};

type AttendanceResult = {
  success: boolean;
  message?: string;
  summary?: {
    totalClasses?: number;
    presentClasses?: number;
    absentClasses?: number;
    attendancePercentage?: number;
  };
  data?: AttendanceRecord[];
};

type Props = {
  user: User;
  onBack: () => void;
  onLogout: () => void;
};

const API = "https://campusflow-ai-khet.onrender.com/api";

export default function AttendancePage({
  user,
  onBack,
  onLogout,
}: Props) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [percentage, setPercentage] = useState(0);
  const [total, setTotal] = useState(0);
  const [present, setPresent] = useState(0);
  const [absent, setAbsent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadAttendance() {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Please login again.");
        }

        // Fetch the latest profile to resolve the Student ID.
        const profileResponse = await fetch(`${API}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const profileResult = await profileResponse.json();

        if (!profileResponse.ok || !profileResult.success) {
          throw new Error(
            profileResult.message || "Could not load your profile."
          );
        }

        const profile =
          profileResult.user ||
          profileResult.student ||
          profileResult.data ||
          {};

        const savedUser = localStorage.getItem("user");
        const storedUser = savedUser ? JSON.parse(savedUser) : {};

        const studentId =
          profile.studentId ||
          profile.student?._id ||
          profile.student?.id ||
          user.studentId ||
          user.student?._id ||
          user.student?.id ||
          storedUser.studentId ||
          storedUser.student?._id ||
          storedUser.student?.id;

        if (!studentId) {
          throw new Error("Student ID is missing from your profile.");
        }

        const response = await fetch(
          `${API}/attendance/student/${encodeURIComponent(studentId)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result: AttendanceResult = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Could not load attendance."
          );
        }

        if (!cancelled) {
          setRecords(Array.isArray(result.data) ? result.data : []);
          setTotal(result.summary?.totalClasses ?? 0);
          setPresent(result.summary?.presentClasses ?? 0);
          setAbsent(result.summary?.absentClasses ?? 0);
          setPercentage(result.summary?.attendancePercentage ?? 0);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadAttendance();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const displayName = user.name || user.email?.split("@")[0] || "Student";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-8">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            CampusFlow AI
          </h1>
          <p className="text-xs text-slate-500">Attendance Management</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm font-semibold sm:block">
            {displayName}
          </span>
          <button
            onClick={onLogout}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-100"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 p-5 sm:p-8">
        <button
          onClick={onBack}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          ← Back to Dashboard
        </button>

        <section>
          <p className="text-sm font-semibold text-indigo-600">
            ACADEMIC RECORDS
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            Attendance
          </h2>
          <p className="mt-2 text-slate-500">
            Track your class attendance and subject-wise records.
          </p>
        </section>

        {loading && (
          <div className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-sm">
            Loading attendance...
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white shadow-sm">
                <p className="text-sm text-indigo-100">
                  Overall Attendance
                </p>
                <p className="mt-3 text-4xl font-bold">
                  {percentage}%
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Total Classes</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {total}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Present</p>
                <p className="mt-3 text-3xl font-bold text-emerald-600">
                  {present}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Absent</p>
                <p className="mt-3 text-3xl font-bold text-red-600">
                  {absent}
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900">
                  Attendance Progress
                </h3>
                <span className="font-bold text-indigo-600">
                  {percentage}%
                </span>
              </div>

              <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all"
                  style={{
                    width: `${Math.min(100, Math.max(0, percentage))}%`,
                  }}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-5 text-lg font-bold text-slate-900">
                Attendance History
              </h3>

              {records.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                  No attendance records found.
                </p>
              ) : (
                <div className="space-y-3">
                  {records.map((record) => (
                    <article
                      key={record._id}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"
                    >
                      <div>
                        <h4 className="font-semibold text-slate-900">
                          {record.subject?.name || "Class"}
                        </h4>
                        <p className="mt-1 text-sm text-slate-500">
                          {record.subject?.code || "Subject code unavailable"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {new Date(record.date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            timeZone: "UTC",
                          })}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-4 py-2 text-xs font-bold capitalize ${
                          record.status === "present"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {record.status}
                      </span>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
