import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import { Layout, Menu } from "antd";
import { UserOutlined, LoginOutlined, HomeOutlined } from "@ant-design/icons";
import "antd/dist/reset.css";
import "./App.css";
import LoginPage from "./views/LoginPage";
import RegisterPage from "./views/RegisterPage";
import AdminDashboard from "./views/AdminDashboard";
import ParentDashboard from "./views/ParentDashboard";
import CaregiverDashboard from "./views/CaregiverDashboard";
import PrivateRoute from "./components/PrivateRoute";
import { logout } from "./utils/auth";

const { Header, Content, Footer } = Layout;

export default function App() {
  const navigate = useNavigate();
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header>
        <Menu theme="dark" mode="horizontal" selectable={false}>
          <Menu.Item key="home" icon={<HomeOutlined />}>
            <Link to="/">Home</Link>
          </Menu.Item>
          <Menu.Item key="login" icon={<LoginOutlined />}>
            <Link to="/login">Login</Link>
          </Menu.Item>
          <Menu.Item key="register" icon={<UserOutlined />}>
            <Link to="/register">Register</Link>
          </Menu.Item>
          <Menu.Item
            key="logout"
            onClick={() => logout(navigate)}
            style={{ float: "right" }}
          >
            Logout
          </Menu.Item>
        </Menu>
      </Header>
      <Content style={{ padding: "2rem" }}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
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
