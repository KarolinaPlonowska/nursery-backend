import React from 'react';
import { Card, Table, Select, Button, Form, Input, DatePicker, message, App } from 'antd';
import { TeamOutlined, PlusOutlined, LinkOutlined, ExclamationCircleOutlined, WarningOutlined, CloseOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
import { API_URL } from "../../config/api";

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  parent?: {
    email: string;
  };
  group?: {
    id: string;
    name: string;
  };
}

interface Group {
  id: string;
  name: string;
}

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'ADMIN' | 'PARENT' | 'CAREGIVER';
}

interface ChildManagementProps {
  children: Child[];
  groups: Group[];
  users: User[];
  isDark: boolean;
  creatingChild: boolean;
  setCreatingChild: (loading: boolean) => void;
  assigning: boolean;
  setAssigning: (loading: boolean) => void;
  selectedChild: string | null;
  setSelectedChild: (childId: string | null) => void;
  selectedGroup: string | null;
  setSelectedGroup: (groupId: string | null) => void;
  updatingChildGroupId: string | null;
  setUpdatingChildGroupId: (childId: string | null) => void;
  setConfirmDeleteChild: (data: { id: string; name: string } | null) => void;
  onChildUpdate: () => Promise<void>;
}

const ChildManagement: React.FC<ChildManagementProps> = ({
  children,
  groups,
  users,
  isDark,
  creatingChild,
  setCreatingChild,
  assigning,
  setAssigning,
  selectedChild,
  setSelectedChild,
  selectedGroup,
  setSelectedGroup,
  updatingChildGroupId,
  setUpdatingChildGroupId,
  setConfirmDeleteChild,
  onChildUpdate
}) => {
  const [childForm] = Form.useForm();
  const { modal } = App.useApp();

  const handleAddChild = async (values: any) => {
    setCreatingChild(true);
    try {
      await axios.post(
        `${API_URL}/children`,
        {
          firstName: values.firstName,
          lastName: values.lastName,
          birthDate: values.birthDate?.format("YYYY-MM-DD"),
          parentId: values.parentId || undefined,
          groupId: values.groupId || undefined,
        },
        { withCredentials: true }
      );
      message.success("Dodano dziecko!");
      childForm.resetFields();
      await onChildUpdate();
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Błąd dodawania dziecka");
    } finally {
      setCreatingChild(false);
    }
  };

  const handleSetChildGroup = async (childId: string, groupId: string | null) => {
    setUpdatingChildGroupId(childId);
    try {
      await axios.patch(
        `${API_URL}/children/${childId}/group`,
        { groupId },
        { withCredentials: true }
      );
      await onChildUpdate();
      message.success(groupId ? 'Zmieniono grupę dziecka' : 'Usunięto dziecko z grupy');
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Błąd zmiany grupy');
    } finally {
      setUpdatingChildGroupId(null);
    }
  };

  const confirmGroupChange = (childId: string, groupId: string | null) => {
    const child = children.find(c => c.id === childId);
    const currentGroupName = child?.group?.name;
    const newGroupName = groupId ? groups.find(g => g.id === groupId)?.name : null;
    const childName = child ? `${child.firstName} ${child.lastName}` : 'dziecko';

    modal.confirm({
      title: 'Zmiana grupy dziecka',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Czy na pewno chcesz zmienić grupę dla dziecka <strong>{childName}</strong>?</p>
          {currentGroupName && (
            <div style={{ 
              background: '#fff7e6', 
              border: '1px solid #ffd591', 
              borderRadius: 6, 
              padding: 12, 
              marginTop: 12 
            }}>
              <p style={{ color: '#d46b08', margin: 0, fontWeight: 600 }}>
                <WarningOutlined style={{ color: '#d46b08', marginRight: 8 }} />Aktualna grupa: {currentGroupName}
              </p>
            </div>
          )}
          {newGroupName ? (
            <p style={{ color: '#52c41a', marginTop: 12 }}>
              <strong>Nowa grupa:</strong> {newGroupName}
            </p>
          ) : (
            <p style={{ color: '#ff4d4f', marginTop: 12 }}>
              <strong>Dziecko zostanie usunięte z grupy</strong>
            </p>
          )}
          <p style={{ color: '#8c8c8c', fontSize: '12px', marginTop: 12 }}>
            Ta operacja może wpłynąć na obecność, komunikaty i inne funkcje związane z grupą.
          </p>
        </div>
      ),
      okText: 'Zmień grupę',
      okType: 'primary',
      cancelText: 'Anuluj',
      onOk: async () => {
        await handleSetChildGroup(childId, groupId);
      },
      onCancel: () => {
        // Reset select value to current group
        // This will be handled by the component re-render
      }
    });
  };

  const handleAssign = async () => {
    if (!selectedChild || !selectedGroup) return;
    setAssigning(true);
    try {
      await axios.post(
        `${API_URL}/groups/${selectedGroup}/assign-child`,
        { childId: selectedChild },
        { withCredentials: true }
      );
      await onChildUpdate();
      message.success("Child assigned to group");
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to assign child");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <Card
        style={{
          marginBottom: 24,
          borderRadius: 12,
          boxShadow: isDark ? "0 0 20px rgba(251,191,36,0.15), 0 0 40px rgba(124,58,237,0.1)" : "0 2px 8px rgba(0,0,0,0.08)",
          border: isDark ? "1px solid #4a3a5a" : "1px solid #E5E7EB",
          background: isDark ? "linear-gradient(135deg, #1a1230 0%, #1f1838 100%)" : undefined
        }}
        title={
          <span style={{ fontSize: 20, fontWeight: 700, background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            <TeamOutlined style={{ color: "#FBBF24", marginRight: 8 }} /> Dzieci
          </span>
        }
      >
        <Table
          dataSource={children}
          rowKey="id"
          pagination={false}
          scroll={{ x: true }}
          onRow={() => ({
            style: {
              transition: 'all 0.3s ease',
              cursor: 'default'
            },
            onMouseEnter: (e) => {
              if (isDark) {
                e.currentTarget.style.background = 'rgba(251,191,36,0.08)';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(251,191,36,0.2)';
              }
            },
            onMouseLeave: (e) => {
              e.currentTarget.style.background = '';
              e.currentTarget.style.boxShadow = '';
            }
          })}
          columns={[
            {
              title: "Imię i nazwisko",
              render: (_: any, record: Child) =>
                <span style={{ fontWeight: 600, color: isDark ? "#FBBF24" : "#1F2937" }}>{`${record.firstName} ${record.lastName}`}</span>,
            },
            {
              title: "Rodzic",
              render: (_: any, record: Child) => <span style={{ color: isDark ? "#E5E7EB" : "#1F2937" }}>{record.parent?.email || "-"}</span>,
            },
            {
              title: "Grupa",
              render: (_: any, record: Child) => (
                <Select
                  value={record.group?.id}
                  style={{ width: 180 }}
                  placeholder="Wybierz grupę"
                  allowClear
                  loading={updatingChildGroupId === record.id}
                  disabled={updatingChildGroupId === record.id}
                  onChange={(val) => confirmGroupChange(record.id, val || null)}
                >
                  <Option value={null} style={{ color: '#ff4d4f' }}>
                    <CloseOutlined style={{ marginRight: 4 }} />Usuń z grupy
                  </Option>
                  {groups.map((group: Group) => (
                    <Option key={group.id} value={group.id}>{group.name}</Option>
                  ))}
                </Select>
              ),
            },
            {
              title: "Akcje",
              render: (_: any, record: Child) => (
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
          boxShadow: isDark ? "0 0 20px rgba(251,191,36,0.15), 0 0 40px rgba(124,58,237,0.1)" : "0 2px 8px rgba(0,0,0,0.08)",
          border: isDark ? "1px solid #4a3a5a" : "1px solid #E5E7EB",
          background: isDark ? "linear-gradient(135deg, #1a1230 0%, #1f1838 100%)" : undefined
        }}
        title={
          <span style={{ fontSize: 18, fontWeight: 700, color: isDark ? "#FBBF24" : "#7C3AED" }}>
            <PlusOutlined style={{ marginRight: 8 }} /> Dodaj nowe dziecko
          </span>
        }
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
                .filter((u: User) => u.role === "PARENT")
                .map((parent: User) => (
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
              {groups.map((group: Group) => (
                <Option key={group.id} value={group.id}>
                  {group.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={creatingChild} 
              style={{ 
                background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)", 
                border: "none", 
                fontWeight: 600, 
                boxShadow: "0 4px 12px rgba(251,191,36,0.4)" 
              }}
            >
              Dodaj dziecko
            </Button>
          </Form.Item>
        </Form>
      </Card>
      
      <Card
        style={{
          borderRadius: 12,
          boxShadow: isDark ? "0 0 20px rgba(251,191,36,0.15), 0 0 40px rgba(124,58,237,0.1)" : "0 2px 8px rgba(0,0,0,0.08)",
          border: isDark ? "1px solid #4a3a5a" : "1px solid #E5E7EB",
          background: isDark ? "linear-gradient(135deg, #1a1230 0%, #1f1838 100%)" : undefined
        }}
        title={
          <span style={{ fontSize: 18, fontWeight: 700, color: isDark ? "#FBBF24" : "#7C3AED" }}>
            <LinkOutlined style={{ marginRight: 8 }} /> Przypisz dziecko do grupy
          </span>
        }
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
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={assigning} 
              style={{ 
                background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)", 
                border: "none", 
                fontWeight: 600, 
                boxShadow: "0 4px 12px rgba(251,191,36,0.4)" 
              }}
            >
              Przypisz
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ChildManagement;