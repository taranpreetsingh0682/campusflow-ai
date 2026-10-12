
import { useState } from "react";
import LoginPage from "./sections/LoginPage";
import RegisterPage from "./sections/RegisterPage";
import DashboardPage from "./sections/DashboardPage";

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

type Page = "login" | "register" | "dashboard";

function getSavedUser(): AppUser | null {
  try {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    // A user and token must both exist to restore the dashboard.
    if (!token || !savedUser) {
      return null;
    }

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

  if (currentPage === "dashboard" && currentUser) {
    return (
      <DashboardPage
        user={currentUser}
        onLogout={handleLogout}
      />
    );
  }

  if (currentPage === "register") {
    return (
      <RegisterPage
        onLoginClick={() => setCurrentPage("login")}
      />
    );
  }

  return (
    <LoginPage
      onLoginSuccess={handleLoginSuccess}
      onRegisterClick={() => setCurrentPage("register")}
    />
  );
}
