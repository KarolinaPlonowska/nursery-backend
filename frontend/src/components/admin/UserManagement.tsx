import React from 'react';
import { Card, Table, Select, Button, message, Tooltip } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
import { API_URL } from "../../config/api";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'ADMIN' | 'PARENT' | 'CAREGIVER';
  emailVerified: boolean;
}

interface UserManagementProps {
  users: User[];
  currentUserId?: string;
  isDark: boolean;
  roleUpdating: string | null;
  setRoleUpdating: (userId: string | null) => void;
  deletingUser: string | null;
  setDeletingUser: (userId: string | null) => void;
  setConfirmRoleChange: (data: {
    userId: string;
    newRole: 'ADMIN' | 'PARENT' | 'CAREGIVER';
    email: string;
    currentRole: 'ADMIN' | 'PARENT' | 'CAREGIVER';
  } | null) => void;
  setConfirmDeleteUser: (userId: string | null) => void;
  setUserToDeleteEmail: (email: string) => void;
  onUserUpdate: () => Promise<void>;
}

const UserManagement: React.FC<UserManagementProps> = ({
  users,
  currentUserId,
  isDark,
  roleUpdating,
  deletingUser,
  setConfirmRoleChange,
  setConfirmDeleteUser,
  setUserToDeleteEmail,
  onUserUpdate
}) => {
  const handleVerifyEmail = async (userId: string) => {
    try {
      await axios.patch(
        `${API_URL}/users/${userId}/verify-email`,
        {},
        { withCredentials: true }
      );
      await onUserUpdate();
      message.success("Email zweryfikowany");
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Błąd weryfikacji");
    }
  };

  return (
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
          <UserOutlined style={{ color: "#FBBF24", marginRight: 8 }} /> Użytkownicy
        </span>
      }
    >
      <Table
        dataSource={users}
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
            title: "Email", 
            dataIndex: "email", 
            render: (text: string) => <span style={{ color: isDark ? "#E5E7EB" : "#1F2937", fontWeight: 500 }}>{text}</span> 
          },
          {
            title: "Imię i nazwisko",
            render: (_: any, record: User) =>
              <span style={{ fontWeight: 600, color: isDark ? "#FBBF24" : "#1F2937" }}>{`${record.firstName || "-"} ${record.lastName || "-"}`}</span>,
          },
          {
            title: "Email zweryfikowany",
            dataIndex: "emailVerified",
            render: (verified: boolean) => (
              <span style={{ fontWeight: 600, color: verified ? "#F59E0B" : "#6B7280" }}>
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
            render: (_: any, record: User) => {
              const isSelf = record.id === currentUserId;
              const isAdmin = record.role === 'ADMIN';
              const canDelete = !isSelf && !isAdmin;
              const deleteTooltip = isSelf 
                ? "Nie możesz usunąć swojego własnego konta" 
                : isAdmin 
                  ? "Nie możesz usunąć konta administratora" 
                  : "";
              
              return (
                <div style={{ display: "flex", gap: 8 }}>
                  {!record.emailVerified && (
                    <Button
                      size="small"
                      onClick={() => handleVerifyEmail(record.id)}
                    >
                      Zweryfikuj email
                    </Button>
                  )}
                  <Tooltip title={deleteTooltip}>
                    <Button
                      size="small"
                      danger
                      loading={deletingUser === record.id}
                      disabled={!canDelete || deletingUser === record.id}
                      onClick={() => {
                        setConfirmDeleteUser(record.id);
                        setUserToDeleteEmail(record.email);
                      }}
                    >
                      Usuń użytkownika
                    </Button>
                  </Tooltip>
                </div>
              );
            },
          },
        ]}
      />
    </Card>
  );
};

export default UserManagement;