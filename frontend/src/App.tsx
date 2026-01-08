import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, ConfigProvider, theme as antTheme, App as AntApp, Modal } from "antd";
import { UserOutlined, HomeOutlined, LogoutOutlined } from "@ant-design/icons";
import "antd/dist/reset.css";
import "./App.css";
import LandingPage from "./views/LandingPage";
import LoginPage from "./views/LoginPage";
import RegisterPage from "./views/RegisterPage";
import VerifyEmailPage from "./views/VerifyEmailPage";
import ForgotPasswordPage from "./views/ForgotPasswordPage";
import AdminDashboard from "./views/AdminDashboard";
import ParentDashboard from "./views/ParentDashboard";
import CaregiverDashboard from "./views/CaregiverDashboard";
import PrivateRoute from "./components/PrivateRoute";
import ThemeToggle from "./components/ThemeToggle";
import { logout, getUserRole, getToken } from "./utils/auth";
import { useTheme } from "./hooks/useTheme";
import { useEffect, useRef, useState } from "react";

  const { Header, Content, Footer } = Layout;

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme: currentTheme } = useTheme();
  const isLandingPage = location.pathname === "/";
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/verify-email" || location.pathname === "/forgot-password";
  const isLoggedIn = !!getToken();
  const userRole = getUserRole();

  // Stan dla ostrzeżenia o bezczynności
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const isWarningShownRef = useRef(false);

  const IDLE_TIME = 5 * 60 * 1000; // 5 minut do testów
  const WARNING_TIME = 1 * 60 * 1000; // Ostrzeżenie 1 minutę przed wylogowaniem

  const resetIdleTimer = () => {
    // Nie resetuj jeśli ostrzeżenie już się pokazuje
    if (isWarningShownRef.current) return;

    // Wyczyść wszystkie timery
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    setShowWarning(false);

    // Tylko dla zalogowanych użytkowników
    if (!isLoggedIn) return;

    // Timer ostrzeżenia
    warningTimeoutRef.current = setTimeout(() => {
      console.log('Pokazuję ostrzeżenie o bezczynności');
      isWarningShownRef.current = true;
      setShowWarning(true);
      setTimeLeft(WARNING_TIME / 1000);

      // Odliczanie
      countdownRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, IDLE_TIME - WARNING_TIME);

    // Timer wylogowania
    timeoutRef.current = setTimeout(() => {
      console.log('Automatyczne wylogowanie z powodu bezczynności');
      setShowWarning(false);
      logout(navigate, 'Zostałeś wylogowany z powodu braku aktywności.');
    }, IDLE_TIME);
  };

  // Monitorowanie aktywności użytkownika
  useEffect(() => {
    if (!isLoggedIn) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      // Ignoruj aktywność gdy modal jest widoczny
      if (isWarningShownRef.current) return;
      resetIdleTimer();
    };

    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    resetIdleTimer();

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [isLoggedIn]);

  const handleContinue = () => {
    console.log('Użytkownik kliknął "Kontynuuj pracę"');
    isWarningShownRef.current = false;
    setShowWarning(false);
    if (countdownRef.current) clearInterval(countdownRef.current);
    resetIdleTimer();
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: currentTheme === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
      }}
    >
      <AntApp>
        <Layout style={{ width: "100%", minHeight: "100%" }}>
          {/* Theme Toggle - visible on all pages */}
          <div style={{ 
            position: "fixed", 
            top: isLandingPage || isAuthPage ? "20px" : "80px",
            right: "20px", 
            zIndex: 1000,
            background: isLandingPage || isAuthPage ? "rgba(255,255,255,0.9)" : "transparent",
            borderRadius: "50%",
            padding: isLandingPage || isAuthPage ? "8px" : "0"
          }}>
            <ThemeToggle />
          </div>
          
          {!isLandingPage && !isAuthPage && isLoggedIn && (
            <Header style={{ background: "#5B21B6", display: "flex", alignItems: "center" }}>
              <Menu theme="dark" mode="horizontal" selectable={false} style={{ background: "#5B21B6", flex: 1 }}>
                <Menu.Item
                  key="home"
                  icon={<HomeOutlined />}
                  onClick={() => {
                    if (userRole === "ADMIN") navigate("/admin");
                    else if (userRole === "PARENT") navigate("/parent");
                    else if (userRole === "CAREGIVER") navigate("/caregiver");
                    else navigate("/");
                  }}
                >
                  Home
                </Menu.Item>
                {userRole === "ADMIN" && (
                  <Menu.Item key="admin" icon={<UserOutlined />}>
                    <Link to="/admin">Admin Panel</Link>
                  </Menu.Item>
                )}
                {userRole === "PARENT" && (
                  <Menu.Item key="parent" icon={<UserOutlined />}>
                    <Link to="/parent">My Children</Link>
                  </Menu.Item>
                )}
                {userRole === "CAREGIVER" && (
                  <Menu.Item key="caregiver" icon={<UserOutlined />}>
                    <Link to="/caregiver">Attendance</Link>
                  </Menu.Item>
                )}
                <Menu.Item
                  key="logout"
                  icon={<LogoutOutlined />}
                  onClick={() => logout(navigate)}
                  style={{ marginLeft: "auto" }}
                >
                  Logout
                </Menu.Item>
              </Menu>
            </Header>
          )}
          <Content style={{ padding: isLandingPage ? "0" : "2rem" }}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route
                path="/admin"
                element={
                  <PrivateRoute roles={["ADMIN"]}>
                    <AdminDashboard onLogout={() => logout(navigate)} />
                  </PrivateRoute>
                }
              />
              <Route
                path="/parent"
                element={
                  <PrivateRoute roles={["PARENT"]}>
                    <ParentDashboard onLogout={() => logout(navigate)} />
                  </PrivateRoute>
                }
              />
              <Route
                path="/caregiver"
                element={
                  <PrivateRoute roles={["CAREGIVER"]}>
                    <CaregiverDashboard onLogout={() => logout(navigate)} />
                  </PrivateRoute>
                }
              />
            </Routes>
          </Content>
          <Footer style={{ textAlign: "center" }}>
            Nursery Management System ©2025
          </Footer>
        </Layout>

        {/* Modal ostrzeżenia o bezczynności */}
        <Modal
          open={showWarning}
          title="⚠️ Ostrzeżenie o bezczynności"
          onOk={handleContinue}
          onCancel={handleContinue}
          okText="Kontynuuj pracę"
          cancelButtonProps={{ style: { display: 'none' } }}
          closable={false}
          maskClosable={false}
        >
          <p>
            Z powodu braku aktywności zostaniesz automatycznie wylogowany za{' '}
            <strong>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</strong>.
          </p>
          <p>Kliknij "Kontynuuj pracę" aby pozostać zalogowanym.</p>
        </Modal>
      </AntApp>
    </ConfigProvider>
  );
}
