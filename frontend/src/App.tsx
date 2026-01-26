import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, ConfigProvider, theme as antTheme, App as AntApp, Modal } from "antd";
import { UserOutlined, HomeOutlined, LogoutOutlined, WarningOutlined } from "@ant-design/icons";
import "antd/dist/reset.css";
import "./App.css";
import LandingPage from "./views/LandingPage";
import LoginPage from "./views/LoginPage";
import RegisterPage from "./views/RegisterPage";
import VerifyEmailPage from "./views/VerifyEmailPage";
import ForgotPasswordPage from "./views/ForgotPasswordPage";
import AdminInvitationPage from "./views/AdminInvitationPage";
import AdminDashboard from "./views/AdminDashboard";
import ParentDashboard from "./views/ParentDashboard";
import CaregiverDashboard from "./views/CaregiverDashboard";
import PrivateRoute from "./components/PrivateRoute";
import ThemeToggle from "./components/ThemeToggle";
import { logout, getUserRole, getUser } from "./utils/auth";
import { useTheme } from "./hooks/useTheme";
import { useEffect, useRef, useState } from "react";
import apiClient from "./utils/axiosConfig";

  const { Header, Content, Footer } = Layout;

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme: currentTheme } = useTheme();
  const isLandingPage = location.pathname === "/";
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/verify-email" || location.pathname === "/forgot-password" || location.pathname.startsWith("/admin-invitation");
  
  // State dla sprawdzania sesji
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Sprawdzanie ważności sesji przy ładowaniu
  useEffect(() => {
    const checkSession = async () => {
      const user = getUser();
      const role = getUserRole();
      
      if (user && role) {
        try {
          // Sprawdź czy sesja jest nadal ważna
          await apiClient.get('/auth/profile', {
            timeout: 5000
          });
          
          setIsLoggedIn(true);
          setUserRole(role);
        } catch (error: any) {
          // Sesja nieważna - wyloguj
          console.log('Sesja nieważna, wylogowuję...');
          sessionStorage.removeItem('user');
          sessionStorage.removeItem('userRole');
          sessionStorage.setItem('logoutReason', 'Sesja wygasła. Zaloguj się ponownie.');
          setIsLoggedIn(false);
          setUserRole(null);
          
          if (!isAuthPage && !isLandingPage) {
            navigate('/login');
          }
        }
      }
      setSessionChecked(true);
    };
    
    checkSession();
  }, [location.pathname, navigate, isAuthPage, isLandingPage]);

  // AUTOMATYCZNE WYLOGOWANIE PO BEZCZYNNOŚCI
  // Stan dla ostrzeżenia o bezczynności
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timeoutRef = useRef<number | null>(null);
  const warningTimeoutRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);
  const isWarningShownRef = useRef(false);

  const IDLE_TIME = 30 * 60 * 1000; // 30 minut bezczynności
  const WARNING_TIME = 5 * 60 * 1000; // Ostrzeżenie 5 minut przed wylogowaniem

  const resetIdleTimer = () => {
    // Nie resetuj jeśli ostrzeżenie już się pokazuje
    if (isWarningShownRef.current) return;

    // Wyczyść wszystkie timery
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    setShowWarning(false);

    // Tylko dla zalogowanych użytkowników
    if (!isLoggedIn || !sessionChecked) return;

    // Timer ostrzeżenia
    warningTimeoutRef.current = window.setTimeout(() => {
      console.log('Pokazuję ostrzeżenie o bezczynności');
      isWarningShownRef.current = true;
      setShowWarning(true);
      setTimeLeft(WARNING_TIME / 1000);

      // Odliczanie
      countdownRef.current = window.setInterval(() => {
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
    timeoutRef.current = window.setTimeout(() => {
      console.log('Automatyczne wylogowanie z powodu bezczynności');
      setShowWarning(false);
      logout(navigate, 'Zostałeś wylogowany z powodu braku aktywności.');
    }, IDLE_TIME);
  };

  // Monitorowanie aktywności użytkownika
  useEffect(() => {
    if (!isLoggedIn || !sessionChecked) return;

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
  }, [isLoggedIn, sessionChecked]);

  const handleContinue = () => {
    console.log('Użytkownik kliknął "Kontynuuj pracę"');
    isWarningShownRef.current = false;
    setShowWarning(false);
    if (countdownRef.current) clearInterval(countdownRef.current);
    resetIdleTimer();
  };

  // Pokaż loader podczas sprawdzania sesji
  if (!sessionChecked) {
    return (
      <ConfigProvider
        theme={{
          algorithm: currentTheme === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          fontSize: '16px',
          color: currentTheme === 'dark' ? '#fff' : '#000'
        }}>
          Sprawdzanie sesji...
        </div>
      </ConfigProvider>
    );
  }

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
              <Menu 
                theme="dark" 
                mode="horizontal" 
                selectable={false} 
                style={{ background: "#5B21B6", flex: 1 }}
                items={[
                  {
                    key: "home",
                    icon: <HomeOutlined />,
                    label: "Home",
                    onClick: () => {
                      if (userRole === "ADMIN") navigate("/admin");
                      else if (userRole === "PARENT") navigate("/parent");
                      else if (userRole === "CAREGIVER") navigate("/caregiver");
                      else navigate("/");
                    }
                  },
                  ...(userRole === "ADMIN" ? [{
                    key: "admin",
                    icon: <UserOutlined />,
                    label: <Link to="/admin">Admin Panel</Link>
                  }] : []),
                  ...(userRole === "PARENT" ? [{
                    key: "parent",
                    icon: <UserOutlined />,
                    label: <Link to="/parent">My Children</Link>
                  }] : []),
                  ...(userRole === "CAREGIVER" ? [{
                    key: "caregiver",
                    icon: <UserOutlined />,
                    label: <Link to="/caregiver">Attendance</Link>
                  }] : []),
                  {
                    key: "logout",
                    icon: <LogoutOutlined />,
                    label: "Logout",
                    onClick: () => logout(navigate),
                    style: { marginLeft: "auto" }
                  }
                ]}
              />
            </Header>
          )}
          <Content style={{ padding: isLandingPage ? "0" : "2rem" }}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/admin-invitation/:token" element={<AdminInvitationPage />} />
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
            Żłobek Online ©2026 - System zarządzania żłobkiem
          </Footer>
        </Layout>

        {/* Modal ostrzeżenia o bezczynności */}
        <Modal
          open={showWarning}
          title={<span><WarningOutlined style={{ color: '#faad14', marginRight: 8 }} />Ostrzeżenie o bezczynności</span>}
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
