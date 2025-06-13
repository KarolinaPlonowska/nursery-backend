import { useState, useEffect } from "react";
import { Card, Table, Select, Button, Form, message, Layout, Menu } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  AppstoreOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Option } = Select;
const { Header, Content } = Layout;
const API_URL = "http://localhost:3000";

function getToken() {
  return localStorage.getItem("token");
}

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [users, setUsers] = useState<any[]>([]);
  const [children, setChildren] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleUpdating, setRoleUpdating] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("users");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = getToken();
        const [usersRes, childrenRes, groupsRes] = await Promise.all([
          axios.get(`${API_URL}/users`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/children`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/groups`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setUsers(usersRes.data);
        setChildren(childrenRes.data);
        setGroups(groupsRes.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setRoleUpdating(userId);
    try {
      const token = getToken();
      await axios.patch(
        `${API_URL}/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      message.success("Role updated");
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to update role");
    } finally {
      setRoleUpdating(null);
    }
  };

  const handleAssign = async () => {
    if (!selectedChild || !selectedGroup) return;
    setAssigning(true);
    try {
      const token = getToken();
      await axios.post(
        `${API_URL}/groups/${selectedGroup}/assign-child`,
        { childId: selectedChild },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success("Child assigned to group");
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to assign child");
    } finally {
      setAssigning(false);
    }
  };

  if (loading)
    return <Card loading style={{ maxWidth: 800, margin: "auto" }} />;
  if (error)
    return (
      <Card style={{ maxWidth: 800, margin: "auto" }}>
        <p style={{ color: "red" }}>{error}</p>
      </Card>
    );

  return (
    <Layout style={{ background: "#fff", minHeight: "100vh" }}>
      <Header
        style={{
          background: "#001529",
          position: "fixed",
          zIndex: 100,
          width: "100%",
          top: 0,
          left: 0,
          right: 0,
          boxShadow: "0 2px 8px #00000022",
          padding: 0,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[activeTab]}
          onClick={({ key }) => {
            if (key === "logout") onLogout();
            else setActiveTab(key);
          }}
          style={{ flex: 1, minWidth: 0, display: "flex" }}
        >
          <Menu.Item key="users" icon={<UserOutlined />}>
            Użytkownicy
          </Menu.Item>
          <Menu.Item key="children" icon={<TeamOutlined />}>
            Dzieci
          </Menu.Item>
          <Menu.Item key="groups" icon={<AppstoreOutlined />}>
            Grupy
          </Menu.Item>
          <Menu.Item
            key="logout"
            icon={<LogoutOutlined />}
            style={{ marginLeft: "auto" }}
          >
            Wyloguj
          </Menu.Item>
        </Menu>
      </Header>
      <Content
        style={{
          //maxWidth: 1200,
          margin: "96px auto 32px auto", // 96px top margin for fixed nav
          width: "100%",
          padding: "0 16px",
          //transition: "max-width 0.2s",
        }}
      >
        {activeTab === "users" && (
          <div style={{ width: "100%" }}>
            <h3>Użytkownicy</h3>
            <Table
              dataSource={users}
              rowKey="id"
              pagination={false}
              scroll={{ x: true }}
              columns={[
                { title: "Email", dataIndex: "email" },
                {
                  title: "Rola",
                  dataIndex: "role",
                  render: (role, record) => (
                    <Select
                      value={role}
                      style={{ width: 120 }}
                      onChange={(val) => handleRoleChange(record.id, val)}
                      loading={roleUpdating === record.id}
                      disabled={roleUpdating === record.id}
                    >
                      <Option value="ADMIN">Admin</Option>
                      <Option value="PARENT">Rodzic</Option>
                      <Option value="CAREGIVER">Opiekun</Option>
                    </Select>
                  ),
                },
              ]}
            />
          </div>
        )}
        {activeTab === "children" && (
          <div style={{ width: "100%" }}>
            <h3>Dzieci</h3>
            <Table
              dataSource={children}
              rowKey="id"
              pagination={false}
              scroll={{ x: true }}
              columns={[
                { title: "Imię i nazwisko", dataIndex: "name" },
                {
                  title: "Grupa",
                  dataIndex: ["group", "name"],
                  render: (_: any, record: any) => record.group?.name || "-",
                },
              ]}
            />
            <h3 style={{ marginTop: 32 }}>Przypisz dziecko do grupy</h3>
            <Form
              layout="inline"
              onFinish={handleAssign}
              style={{ marginBottom: 24 }}
            >
              <Form.Item label="Dziecko">
                <Select
                  style={{ width: 200 }}
                  value={selectedChild}
                  onChange={setSelectedChild}
                  placeholder="Wybierz dziecko"
                >
                  {children.map((child) => (
                    <Option key={child.id} value={child.id}>
                      {child.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label="Grupa">
                <Select
                  style={{ width: 200 }}
                  value={selectedGroup}
                  onChange={setSelectedGroup}
                  placeholder="Wybierz grupę"
                >
                  {groups.map((group) => (
                    <Option key={group.id} value={group.id}>
                      {group.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={assigning}>
                  Przypisz
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}
        {activeTab === "groups" && (
          <div style={{ width: "100%" }}>
            <h3>Grupy</h3>
            <Table
              dataSource={groups}
              rowKey="id"
              pagination={false}
              scroll={{ x: true }}
              columns={[
                { title: "Nazwa", dataIndex: "name" },
                {
                  title: "Dzieci",
                  dataIndex: "children",
                  render: (children) =>
                    children?.map((c: any) => c.name).join(", ") || "-",
                },
              ]}
            />
          </div>
        )}
      </Content>
    </Layout>
  );
}
