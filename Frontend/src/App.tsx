
import { useState } from "react";
import LoginPage from "./sections/LoginPage";
import RegisterPage from "./sections/RegisterPage";

export default function App() {
  const [currentPage, setCurrentPage] = useState<
    "login" | "register"
  >("login");

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
        console.log("Login successful:", user);
      }}
      onRegisterClick={() => setCurrentPage("register")}
    />
  );
}
