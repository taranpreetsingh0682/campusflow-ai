
import LoginPage from "./sections/LoginPage";

export default function App() {
  return <LoginPage
    onLoginSuccess={(user) => {
      console.log("Login successful:", user);
    }}
    onRegisterClick={() => {
      console.log("Register page will be added next.");
    }}
  />;
}
