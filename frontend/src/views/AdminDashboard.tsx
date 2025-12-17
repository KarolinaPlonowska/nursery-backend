import { useState, useEffect } from "react";
import { Card, Table, Select, Button, Form, Input, message, Layout, Menu } from "antd";
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
  const [editingGroup, setEditingGroup] = useState<any | null>(null);
  const [groupForm] = Form.useForm();
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [adminForm] = Form.useForm();
  const [showInviteCode, setShowInviteCode] = useState(false);

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
      
      // Update invite code visibility
      const adminCount = usersRes.data.filter((u: any) => u.role === 'ADMIN').length;
      setShowInviteCode(adminCount === 0);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  const handleVerifyEmail = async (userId: string) => {
    try {
      const token = getToken();
      await axios.patch(
        `${API_URL}/users/${userId}/verify-email`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, emailVerified: true } : u))
      );
      message.success("Email zweryfikowany");
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Błąd weryfikacji");
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
      await fetchData();
      message.success("Child assigned to group");
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to assign child");
    } finally {
      setAssigning(false);
    }
  };

  const handleCreateGroup = async (values: any) => {
    try {
      const token = getToken();
      const res = await axios.post(
        `${API_URL}/groups`,
        values,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGroups((prev) => [...prev, res.data]);
      groupForm.resetFields();
      message.success("Grupa utworzona");
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Błąd tworzenia grupy");
    }
  };

  const handleUpdateGroup = async (values: any) => {
    if (!editingGroup) return;
    try {
      const token = getToken();
      const res = await axios.patch(
        `${API_URL}/groups/${editingGroup.id}`,
        values,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGroups((prev) =>
        prev.map((g) => (g.id === editingGroup.id ? res.data : g))
      );
      setEditingGroup(null);
      groupForm.resetFields();
      message.success("Grupa zaktualizowana");
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Błąd aktualizacji grupy");
    }
  };

  const startEditGroup = (group: any) => {
    setEditingGroup(group);
    groupForm.setFieldsValue({ name: group.name });
  };

  const cancelEditGroup = () => {
    setEditingGroup(null);
    groupForm.resetFields();
  };

  const handleCreateAdminUser = async (values: any) => {
    setCreatingAdmin(true);
    try {
      const token = getToken();
      await axios.post(
        `${API_URL}/auth/create-admin`,
        values,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success("Admin account created successfully");
      adminForm.resetFields();
      await fetchData();
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to create admin");
    } finally {
      setCreatingAdmin(false);
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
                  title: "Imię i nazwisko",
                  render: (_: any, record: any) =>
                    `${record.firstName || "-"} ${record.lastName || "-"}`,
                },
                {
                  title: "Email zweryfikowany",
                  dataIndex: "emailVerified",
                  render: (verified: boolean) => (verified ? "Tak" : "Nie"),
                },
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
                {
                  title: "Akcje",
                  render: (_: any, record: any) =>
                    !record.emailVerified ? (
                      <Button
                        size="small"
                        onClick={() => handleVerifyEmail(record.id)}
                      >
                        Zweryfikuj email
                      </Button>
                    ) : null,
                },
              ]}
            />
            <h3 style={{ marginTop: 32 }}>Utwórz konto administratora</h3>
            <Form
              form={adminForm}
              layout="inline"
              onFinish={handleCreateAdminUser}
              style={{ marginBottom: 24 }}
            >
              <Form.Item
                name="firstName"
                label="Imię"
                rules={[{ required: true, message: "Podaj imię" }]}
              >
                <Input placeholder="Imię" />
              </Form.Item>
              <Form.Item
                name="lastName"
                label="Nazwisko"
                rules={[{ required: true, message: "Podaj nazwisko" }]}
              >
                <Input placeholder="Nazwisko" />
              </Form.Item>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, type: "email", message: "Podaj email" },
                ]}
              >
                <Input placeholder="email@example.com" type="email" />
              </Form.Item>
              <Form.Item
                name="password"
                label="Hasło"
                rules={[{ required: true, min: 6, message: "Min. 6 znaków" }]}
              >
                <Input.Password placeholder="Min. 6 znaków" />
              </Form.Item>
              {showInviteCode && (
                <Form.Item
                  name="inviteCode"
                  label="Kod zaproszenia"
                  rules={[{ required: true, message: "Podaj kod zaproszenia" }]}
                  tooltip="Wymagany do utworzenia pierwszego konta administratora"
                >
                  <Input placeholder="Kod zaproszenia" />
                </Form.Item>
              )}
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={creatingAdmin}>
                  Utwórz administratora
                </Button>
              </Form.Item>
            </Form>
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
                {
                  title: "Imię i nazwisko",
                  render: (_: any, record: any) =>
                    `${record.firstName} ${record.lastName}`,
                },
                {
                  title: "Rodzic",
                  render: (_: any, record: any) => record.parent?.email || "-",
                },
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
                      {`${child.firstName} ${child.lastName}`}
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
                    children
                      ?.map((c: any) => `${c.firstName} ${c.lastName}`)
                      .join(", ") || "-",
                },
                {
                  title: "Akcje",
                  render: (_: any, record: any) => (
                    <Button size="small" onClick={() => startEditGroup(record)}>
                      Edytuj
                    </Button>
                  ),
                },
              ]}
            />
            <h3 style={{ marginTop: 32 }}>
              {editingGroup ? "Edytuj grupę" : "Utwórz nową grupę"}
            </h3>
            <Form
              form={groupForm}
              layout="inline"
              onFinish={editingGroup ? handleUpdateGroup : handleCreateGroup}
              style={{ marginBottom: 24 }}
            >
              <Form.Item
                name="name"
                label="Nazwa grupy"
                rules={[{ required: true, message: "Podaj nazwę grupy" }]}
              >
                <Input placeholder="np. Żabki, Motylki" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  {editingGroup ? "Zapisz" : "Utwórz"}
                </Button>
                {editingGroup && (
                  <Button
                    style={{ marginLeft: 8 }}
                    onClick={cancelEditGroup}
                  >
                    Anuluj
                  </Button>
                )}
              </Form.Item>
            </Form>
          </div>
        )}
      </Content>
    </Layout>
  );
}
