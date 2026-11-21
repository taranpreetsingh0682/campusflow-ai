
import { useState } from "react";
import LoginPage from "./sections/LoginPage";
import RegisterPage from "./sections/RegisterPage";
import DashboardPage from "./sections/DashboardPage";
import AttendancePage from "./sections/AttendancePage";
import StudentModulePage from "./sections/StudentModulePage";

type AppUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  college?: string;
  department?: string;
  academicYear?: number | string;
  rollNumber?: string;
  studentId?: string;
  student?: {
    _id?: string;
    id?: string;
  };
};

type ModulePage =
  | "fees"
  | "scholarships"
  | "results"
  | "complaints"
  | "notifications";

type Page =
  | "login"
  | "register"
  | "dashboard"
  | "attendance"
  | ModulePage;

function getSavedUser(): AppUser | null {
  try {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!token || !savedUser) return null;

    return JSON.parse(savedUser) as AppUser;
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return null;
  }
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(
    () => getSavedUser()
  );

  const [currentPage, setCurrentPage] = useState<Page>(() =>
    getSavedUser() ? "dashboard" : "login"
  );

  function handleLoginSuccess(user: AppUser) {
    setCurrentUser(user);
    setCurrentPage("dashboard");
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    setCurrentPage("login");
  }

  if (currentUser && currentPage === "attendance") {
    return (
      <AttendancePage
        user={currentUser}
        onBack={() => setCurrentPage("dashboard")}
        onLogout={handleLogout}
      />
    );
  }

  const modulePages: ModulePage[] = [
    "fees",
    "scholarships",
    "results",
    "complaints",
    "notifications",
  ];

  if (currentUser && modulePages.includes(currentPage as ModulePage)) {
    return (
      <StudentModulePage
        page={currentPage as ModulePage}
        user={currentUser}
        onBack={() => setCurrentPage("dashboard")}
        onLogout={handleLogout}
      />
    );
  }

  if (currentUser && currentPage === "dashboard") {
    return (
      <DashboardPage
        user={currentUser}
        onLogout={handleLogout}
        onAttendanceClick={() => setCurrentPage("attendance")}
        onFeesClick={() => setCurrentPage("fees")}
        onScholarshipsClick={() => setCurrentPage("scholarships")}
        onResultsClick={() => setCurrentPage("results")}
        onComplaintsClick={() => setCurrentPage("complaints")}
        onNotificationsClick={() => setCurrentPage("notifications")}
      />
    );
  }

  if (currentPage === "register") {
    return <RegisterPage onLoginClick={() => setCurrentPage("login")} />;
  }

  return (
    <LoginPage
      onLoginSuccess={handleLoginSuccess}
      onRegisterClick={() => setCurrentPage("register")}
    />
  );
}
