
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

export default function App() {
  const [currentPage, setCurrentPage] = useState<
    "login" | "register" | "dashboard"
  >("login");

  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? (JSON.parse(savedUser) as AppUser) : null;
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });

  if (currentPage === "dashboard" && currentUser) {
    return (
      <DashboardPage
        user={currentUser}
        onLogout={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setCurrentUser(null);
          setCurrentPage("login");
        }}
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
      onLoginSuccess={(user) => {
        setCurrentUser(user as AppUser);
        setCurrentPage("dashboard");
      }}
      onRegisterClick={() => setCurrentPage("register")}
    />
  );
}
