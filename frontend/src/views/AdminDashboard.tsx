import { useState, useEffect } from "react";
import { Card, Table, Select, Button, Form, Input, message, Layout, Menu, DatePicker, Modal } from "antd";
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
  const [childForm] = Form.useForm();
  const [creatingChild, setCreatingChild] = useState(false);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [confirmRoleChange, setConfirmRoleChange] = useState<{
    userId: string;
    newRole: 'ADMIN' | 'PARENT' | 'CAREGIVER';
    email: string;
    currentRole: 'ADMIN' | 'PARENT' | 'CAREGIVER';
  } | null>(null);
  const [confirmDeleteChild, setConfirmDeleteChild] = useState<{ id: string; name: string } | null>(null);
  const [updatingChildGroupId, setUpdatingChildGroupId] = useState<string | null>(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<string | null>(null);
  const [userToDeleteEmail, setUserToDeleteEmail] = useState<string>("");
  const [assigningCaregiver, setAssigningCaregiver] = useState<string | null>(null);
  const [confirmChangeCaregiverModal, setConfirmChangeCaregiverModal] = useState<{
    groupId: string;
    groupName: string;
    newCaregiverId: string;
    currentCaregiver: string;
  } | null>(null);

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

  const handleAddChild = async (values: any) => {
    setCreatingChild(true);
    try {
      const token = getToken();
      await axios.post(
        `${API_URL}/children`,
        {
          firstName: values.firstName,
          lastName: values.lastName,
          birthDate: values.birthDate?.format("YYYY-MM-DD"),
          parentId: values.parentId || undefined,
          groupId: values.groupId || undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success("Dodano dziecko!");
      childForm.resetFields();
      await fetchData();
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Błąd dodawania dziecka");
    } finally {
      setCreatingChild(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setDeletingUser(userId);
    try {
      const token = getToken();
      await axios.delete(`${API_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      message.success("Użytkownik usunięty");
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Błąd usuwania użytkownika");
    } finally {
      setDeletingUser(null);
    }
  };

  const handleDeleteChild = async (childId: string) => {
    try {
      const token = getToken();
      await axios.delete(`${API_URL}/children/${childId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success('Dziecko usunięte');
      await fetchData();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Błąd usuwania dziecka');
    }
  };

  const handleSetChildGroup = async (childId: string, groupId: string | null) => {
    setUpdatingChildGroupId(childId);
    try {
      const token = getToken();
      await axios.patch(
        `${API_URL}/children/${childId}/group`,
        { groupId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchData();
      message.success(groupId ? 'Zmieniono grupę dziecka' : 'Usunięto dziecko z grupy');
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Błąd zmiany grupy');
    } finally {
      setUpdatingChildGroupId(null);
    }
  };

  const handleAssignCaregiver = async (groupId: string, caregiverId: string) => {
    const group = groups.find(g => g.id === groupId);
    const currentCaregiver = group?.caregiver 
      ? `${group.caregiver.firstName} ${group.caregiver.lastName} (${group.caregiver.email})`
      : 'Brak';
    
    if (group?.caregiver) {
      setConfirmChangeCaregiverModal({
        groupId,
        groupName: group.name,
        newCaregiverId: caregiverId,
        currentCaregiver
      });
      return;
    }

    await assignCaregiverToGroup(groupId, caregiverId);
  };

  const assignCaregiverToGroup = async (groupId: string, caregiverId: string) => {
    setAssigningCaregiver(groupId);
    try {
      const token = getToken();
      await axios.post(
        `${API_URL}/groups/${groupId}/assign-caregiver`,
        { caregiverId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchData();
      message.success('Opiekun przypisany do grupy');
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Błąd przypisywania opiekuna');
    } finally {
      setAssigningCaregiver(null);
    }
  };

  const handleRemoveCaregiver = async (groupId: string) => {
    setAssigningCaregiver(groupId);
    try {
      const token = getToken();
      await axios.delete(
        `${API_URL}/groups/${groupId}/remove-caregiver`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchData();
      message.success('Opiekun usunięty z grupy');
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Błąd usuwania opiekuna');
    } finally {
      setAssigningCaregiver(null);
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
    <Layout style={{ background: "#F9FAFB", minHeight: "100vh" }}>
      <Header
        style={{
          background: "#5B21B6",
          position: "fixed",
          zIndex: 100,
          width: "100%",
          top: 0,
          left: 0,
          right: 0,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
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
          style={{ flex: 1, minWidth: 0, display: "flex", background: "#5B21B6" }}
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
          margin: "96px auto 32px auto",
          width: "100%",
          padding: "24px",
          maxWidth: 1200,
        }}
      >
        {activeTab === "users" && (
          <div style={{ width: "100%" }}>
            <Card
              style={{
                marginBottom: 24,
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                border: "1px solid #E5E7EB"
              }}
              title={<span style={{ fontSize: 20, fontWeight: 700, color: "#1F2937" }}>👥 Użytkownicy</span>}
            >
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
                    <span style={{ fontWeight: 500, color: "#1F2937" }}>{`${record.firstName || "-"} ${record.lastName || "-"}`}</span>,
                },
                {
                  title: "Email zweryfikowany",
                  dataIndex: "emailVerified",
                  render: (verified: boolean) => (
                    <span style={{ fontWeight: 600, color: verified ? "#16A34A" : "#6B7280" }}>
                      {verified ? "✓ Tak" : "✗ Nie"}
                    </span>
                  ),
                },
                {
                  title: "Rola",
                  dataIndex: "role",
                  render: (role, record) => (
                    <Select
                      value={role}
                      style={{ width: 120 }}
                      onChange={(val) =>
                        setConfirmRoleChange({
                          userId: record.id,
                          newRole: val,
                          email: record.email,
                          currentRole: role,
                        })
                      }
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
                    <div style={{ display: "flex", gap: 8 }}>
                      {!record.emailVerified && (
                        <Button
                          size="small"
                          onClick={() => handleVerifyEmail(record.id)}
                        >
                          Zweryfikuj email
                        </Button>
                      )}
                      <Button
                        size="small"
                        danger
                        loading={deletingUser === record.id}
                        disabled={deletingUser === record.id}
                        onClick={() => {
                          setConfirmDeleteUser(record.id);
                          setUserToDeleteEmail(record.email);
                        }}
                      >
                        Usuń użytkownika
                      </Button>
                    </div>,
                },
              ]}
            />
            </Card>
            <Card
              style={{
                marginBottom: 24,
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                border: "1px solid #E5E7EB"
              }}
              title={<span style={{ fontSize: 18, fontWeight: 600, color: "#1F2937" }}>➕ Utwórz konto administratora</span>}
            >
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
                <Button type="primary" htmlType="submit" loading={creatingAdmin} style={{ background: "#7C3AED", borderColor: "#7C3AED", fontWeight: 600 }}>
                  Utwórz administratora
                </Button>
              </Form.Item>
            </Form>
            </Card>
          </div>
        )}
        {activeTab === "children" && (
          <div style={{ width: "100%" }}>
            <Card
              style={{
                marginBottom: 24,
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                border: "1px solid #E5E7EB"
              }}
              title={<span style={{ fontSize: 20, fontWeight: 700, color: "#1F2937" }}>👶 Dzieci</span>}
            >
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
                  render: (_: any, record: any) => (
                    <Select
                      value={record.group?.id}
                      style={{ width: 180 }}
                      placeholder="Wybierz grupę"
                      allowClear
                      loading={updatingChildGroupId === record.id}
                      disabled={updatingChildGroupId === record.id}
                      onChange={(val) => handleSetChildGroup(record.id, val || null)}
                    >
                      {groups.map((group: any) => (
                        <Option key={group.id} value={group.id}>{group.name}</Option>
                      ))}
                    </Select>
                  ),
                },
                {
                  title: "Akcje",
                  render: (_: any, record: any) => (
                    <Button
                      size="small"
                      danger
                      onClick={() => {
                        setConfirmDeleteChild({ id: record.id, name: `${record.firstName} ${record.lastName}` });
                      }}
                    >
                      Usuń dziecko
                    </Button>
                  ),
                },
              ]}
            />
            </Card>
            <Card
              style={{
                marginBottom: 24,
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                border: "1px solid #E5E7EB"
              }}
              title={<span style={{ fontSize: 18, fontWeight: 600, color: "#1F2937" }}>➕ Dodaj nowe dziecko</span>}
            >
            <Form
              form={childForm}
              layout="vertical"
              onFinish={handleAddChild}
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
                name="birthDate"
                label="Data urodzenia"
                rules={[{ required: true, message: "Podaj datę urodzenia" }]}
              >
                <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                name="parentId"
                label="Rodzic (opcjonalnie)"
              >
                <Select
                  placeholder="Wybierz rodzica"
                  allowClear
                >
                  {users
                    .filter((u: any) => u.role === "PARENT")
                    .map((parent: any) => (
                      <Option key={parent.id} value={parent.id}>
                        {parent.firstName} {parent.lastName} ({parent.email})
                      </Option>
                    ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="groupId"
                label="Grupa (opcjonalnie)"
              >
                <Select
                  placeholder="Wybierz grupę"
                  allowClear
                >
                  {groups.map((group: any) => (
                    <Option key={group.id} value={group.id}>
                      {group.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={creatingChild} style={{ background: "#7C3AED", borderColor: "#7C3AED", fontWeight: 600 }}>
                  Dodaj dziecko
                </Button>
              </Form.Item>
            </Form>
            </Card>
            <Card
              style={{
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                border: "1px solid #E5E7EB"
              }}
              title={<span style={{ fontSize: 18, fontWeight: 600, color: "#1F2937" }}>🎯 Przypisz dziecko do grupy</span>}
            >
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
                <Button type="primary" htmlType="submit" loading={assigning} style={{ background: "#7C3AED", borderColor: "#7C3AED", fontWeight: 600 }}>
                  Przypisz
                </Button>
              </Form.Item>
            </Form>
            </Card>
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
                  title: "Opiekun",
                  render: (_: any, record: any) => (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {record.caregiver ? (
                        <div>
                          <div style={{ fontWeight: 500 }}>
                            {record.caregiver.firstName} {record.caregiver.lastName}
                          </div>
                          <div style={{ fontSize: 12, color: '#6B7280' }}>
                            {record.caregiver.email}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: '#9CA3AF' }}>Brak opiekuna</span>
                      )}
                      <Select
                        value={record.caregiver?.id}
                        style={{ width: '100%' }}
                        placeholder="Przypisz opiekuna"
                        allowClear
                        loading={assigningCaregiver === record.id}
                        disabled={assigningCaregiver === record.id}
                        onChange={(val) => {
                          if (val) {
                            handleAssignCaregiver(record.id, val);
                          } else {
                            handleRemoveCaregiver(record.id);
                          }
                        }}
                      >
                        {users
                          .filter((u: any) => u.role === 'CAREGIVER')
                          .map((caregiver: any) => (
                            <Option key={caregiver.id} value={caregiver.id}>
                              {caregiver.firstName} {caregiver.lastName} ({caregiver.email})
                            </Option>
                          ))}
                      </Select>
                    </div>
                  ),
                },
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
                <Button type="primary" htmlType="submit" style={{ background: "#7C3AED", borderColor: "#7C3AED", fontWeight: 600 }}>
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
      
      {/* Confirm role change modal */}
      <Modal
        title="⚠️ Potwierdź zmianę roli"
        open={!!confirmRoleChange}
        onOk={async () => {
          if (confirmRoleChange) {
            await handleRoleChange(confirmRoleChange.userId, confirmRoleChange.newRole);
            setConfirmRoleChange(null);
          }
        }}
        onCancel={() => setConfirmRoleChange(null)}
        okText="Zmień rolę"
        cancelText="Anuluj"
      >
        <p style={{ fontSize: 16, marginBottom: 12 }}>
          Zmiana roli wpływa na uprawnienia i dostęp użytkownika. Ta operacja może mieć
          istotne konsekwencje.
        </p>
        {confirmRoleChange && (
          <div style={{ padding: 12, background: "#F3F4F6", borderRadius: 8 }}>
            <div><strong>Użytkownik:</strong> {confirmRoleChange.email}</div>
            <div><strong>Obecna rola:</strong> {confirmRoleChange.currentRole}</div>
            <div><strong>Nowa rola:</strong> {confirmRoleChange.newRole}</div>
          </div>
        )}
      </Modal>

      <Modal
        title="⚠️ Potwierdź usunięcie"
        open={!!confirmDeleteUser}
        onOk={() => {
          if (confirmDeleteUser) {
            handleDeleteUser(confirmDeleteUser);
            setConfirmDeleteUser(null);
            setUserToDeleteEmail("");
          }
        }}
        onCancel={() => {
          setConfirmDeleteUser(null);
          setUserToDeleteEmail("");
        }}
        okText="Usuń użytkownika"
        cancelText="Anuluj"
        okButtonProps={{ danger: true }}
      >
        <p style={{ fontSize: 16, marginBottom: 16 }}>
          Ta operacja jest <strong>nieodwracalna</strong>. Czy na pewno chcesz usunąć użytkownika?
        </p>
        <div style={{ padding: 12, background: "#FEE2E2", borderRadius: 8, borderLeft: "4px solid #DC2626" }}>
          <strong>{userToDeleteEmail}</strong>
        </div>
      </Modal>

      {/* Confirm child delete modal */}
      <Modal
        title="⚠️ Potwierdź usunięcie dziecka"
        open={!!confirmDeleteChild}
        onOk={async () => {
          if (confirmDeleteChild) {
            await handleDeleteChild(confirmDeleteChild.id);
            setConfirmDeleteChild(null);
          }
        }}
        onCancel={() => setConfirmDeleteChild(null)}
        okText="Usuń dziecko"
        cancelText="Anuluj"
        okButtonProps={{ danger: true }}
      >
        <p style={{ fontSize: 16, marginBottom: 16 }}>
          Ta operacja jest <strong>nieodwracalna</strong>. Czy na pewno chcesz usunąć dziecko?
        </p>
        {confirmDeleteChild && (
          <div style={{ padding: 12, background: '#FEE2E2', borderRadius: 8, borderLeft: '4px solid #DC2626' }}>
            <strong>{confirmDeleteChild.name}</strong>
          </div>
        )}
      </Modal>

      {/* Confirm caregiver change modal */}
      <Modal
        title="⚠️ Potwierdź zmianę opiekuna"
        open={!!confirmChangeCaregiverModal}
        onOk={async () => {
          if (confirmChangeCaregiverModal) {
            await assignCaregiverToGroup(
              confirmChangeCaregiverModal.groupId,
              confirmChangeCaregiverModal.newCaregiverId
            );
            setConfirmChangeCaregiverModal(null);
          }
        }}
        onCancel={() => setConfirmChangeCaregiverModal(null)}
        okText="Zmień opiekuna"
        cancelText="Anuluj"
      >
        <p style={{ fontSize: 16, marginBottom: 12 }}>
          Zmiana opiekuna grupy wpływa na zarządzanie dziećmi w tej grupie.
        </p>
        {confirmChangeCaregiverModal && (
          <div style={{ padding: 12, background: "#F3F4F6", borderRadius: 8 }}>
            <div><strong>Grupa:</strong> {confirmChangeCaregiverModal.groupName}</div>
            <div><strong>Obecny opiekun:</strong> {confirmChangeCaregiverModal.currentCaregiver}</div>
            <div><strong>Nowy opiekun:</strong> {
              users
                .filter((u: any) => u.id === confirmChangeCaregiverModal.newCaregiverId)
                .map((u: any) => `${u.firstName} ${u.lastName} (${u.email})`)[0]
            }</div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}
