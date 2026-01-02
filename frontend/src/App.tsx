import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu } from "antd";
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
import { logout, getUserRole, getToken } from "./utils/auth";

  const { Header, Content, Footer } = Layout;

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLandingPage = location.pathname === "/";
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/verify-email" || location.pathname === "/forgot-password";
  const isLoggedIn = !!getToken();
  const userRole = getUserRole();

  return (
    <Layout style={{ width: "100%", minHeight: "100%" }}>
      {!isLandingPage && !isAuthPage && isLoggedIn && (
        <Header style={{ background: "#5B21B6" }}>
          <Menu theme="dark" mode="horizontal" selectable={false} style={{ background: "#5B21B6" }}>
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
  );
}
