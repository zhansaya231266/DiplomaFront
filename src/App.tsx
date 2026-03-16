import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WelcomePage } from "./pages/WelcomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterOrgPage } from "./pages/RegisterOrgPage";
import { JoinPage } from "./pages/JoinPage";
import { InvitationCodePage } from "./pages/InvitationCodePage";
import { ActivateAccountPage } from "./pages/ActivateAccountPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { AdminDashboard } from "./pages/DashboardPage";
import { EmployeesPage } from "./pages/EmployeesPage";
import { AttendancePage } from "./pages/AttendancePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register-org" element={<RegisterOrgPage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/enter-code" element={<InvitationCodePage />} />
        <Route path="/activate-account" element={<ActivateAccountPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
