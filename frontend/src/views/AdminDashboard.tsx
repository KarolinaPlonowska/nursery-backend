import { useState, useEffect } from "react";
import { Layout, Menu, Badge, message } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  AppstoreOutlined,
  LogoutOutlined,
  SettingOutlined,
  BarChartOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { getUser } from "../utils/auth";
import { useTheme } from "../hooks/useTheme";
import SettingsPage from "./SettingsPage";
import AttendanceStatistics from "../components/AttendanceStatistics";
import UserManagement from "../components/admin/UserManagement";
import AdminCreation from "../components/admin/AdminCreation";
import ChildManagement from "../components/admin/ChildManagement";
import GroupManagement from "../components/admin/GroupManagement";
import CommunicationTabs from "../components/admin/CommunicationTabs";
import ConfirmationModals from "../components/admin/ConfirmationModals";

const { Header, Content } = Layout;
import { API_URL } from "../config/api";

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const currentUser = getUser();
  const currentUserId = currentUser?.id;
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // State for data
  const [users, setUsers] = useState<any[]>([]);
  const [children, setChildren] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for UI
  const [activeTab, setActiveTab] = useState<string>("users");
  const [unviewedCount, setUnviewedCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [showInviteCode, setShowInviteCode] = useState(false);
  
  // State for user management
  const [roleUpdating, setRoleUpdating] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  
  // State for child management
  const [creatingChild, setCreatingChild] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [updatingChildGroupId, setUpdatingChildGroupId] = useState<string | null>(null);
  
  // State for group management
  const [editingGroup, setEditingGroup] = useState<any | null>(null);
  const [assigningCaregiver, setAssigningCaregiver] = useState<string | null>(null);
  
  // State for modals
  const [confirmRoleChange, setConfirmRoleChange] = useState<{
    userId: string;
    newRole: 'ADMIN' | 'PARENT' | 'CAREGIVER';
    email: string;
    currentRole: 'ADMIN' | 'PARENT' | 'CAREGIVER';
  } | null>(null);
  const [confirmDeleteChild, setConfirmDeleteChild] = useState<{ id: string; name: string } | null>(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<string | null>(null);
  const [userToDeleteEmail, setUserToDeleteEmail] = useState<string>("");
  const [confirmChangeCaregiverModal, setConfirmChangeCaregiverModal] = useState<{
    groupId: string;
    groupName: string;
    newCaregiverId: string;
    currentCaregiver: string;
  } | null>(null);

  const fetchUnviewedCount = async () => {
    try {
      const res = await axios.get(`${API_URL}/announcements/unviewed/count`, {
        withCredentials: true,
      });
      setUnviewedCount(res.data.count);
    } catch (err) {
      console.error('Failed to fetch unviewed count:', err);
    }
  };

  const fetchUnreadMessagesCount = async () => {
    try {
      const res = await axios.get(`${API_URL}/messages/unread-count`, {
        withCredentials: true,
      });
      setUnreadMessagesCount(res.data.count);
    } catch (err) {
      console.error('Failed to fetch unread messages count:', err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, childrenRes, groupsRes] = await Promise.all([
        axios.get(`${API_URL}/users`, {
          withCredentials: true,
        }),
        axios.get(`${API_URL}/children`, {
          withCredentials: true,
        }),
        axios.get(`${API_URL}/groups`, {
          withCredentials: true,
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
    fetchUnviewedCount();
    fetchUnreadMessagesCount();
    // Odśwież co minutę
    const interval = setInterval(() => {
      fetchUnviewedCount();
      fetchUnreadMessagesCount();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setRoleUpdating(userId);
    try {
      await axios.patch(
        `${API_URL}/users/${userId}/role`,
        { role: newRole },
        { withCredentials: true }
      );
      await fetchData();
      message.success("Role updated");
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to update role");
    } finally {
      setRoleUpdating(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setDeletingUser(userId);
    try {
      await axios.delete(`${API_URL}/users/${userId}`, {
        withCredentials: true,
      });
      await fetchData();
      message.success("Użytkownik usunięty");
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Błąd usuwania użytkownika");
    } finally {
      setDeletingUser(null);
    }
  };

  const handleDeleteChild = async (childId: string) => {
    try {
      await axios.delete(`${API_URL}/children/${childId}`, {
        withCredentials: true,
      });
      message.success('Dziecko usunięte');
      await fetchData();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Błąd usuwania dziecka');
    }
  };

  const assignCaregiverToGroup = async (groupId: string, caregiverId: string) => {
    setAssigningCaregiver(groupId);
    try {
      await axios.post(
        `${API_URL}/groups/${groupId}/assign-caregiver`,
        { caregiverId },
        { withCredentials: true }
      );
      await fetchData();
      message.success('Opiekun przypisany do grupy');
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Błąd przypisywania opiekuna');
    } finally {
      setAssigningCaregiver(null);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Ładowanie...</div>;
  if (error) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'red' }}>{error}</div>;

  return (
    <Layout style={{ background: isDark ? "linear-gradient(180deg, #0f0a1a 0%, #141414 50%, #0f0a1a 100%)" : "#F9FAFB", minHeight: "100vh", transition: "background-color 0.3s ease" }}>
      <Header
        style={{
          background: "linear-gradient(135deg, #5B21B6 0%, #7C3AED 50%, #FBBF24 100%)",
          position: "fixed",
          zIndex: 100,
          width: "100%",
          top: 0,
          left: 0,
          right: 0,
          boxShadow: "0 2px 12px rgba(251,191,36,0.3)",
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
          style={{ flex: 1, minWidth: 0, display: "flex", background: "transparent" }}
          items={[
            {
              key: "users",
              icon: <UserOutlined />,
              label: "Użytkownicy"
            },
            {
              key: "children",
              icon: <TeamOutlined />,
              label: "Dzieci"
            },
            {
              key: "groups",
              icon: <AppstoreOutlined />,
              label: "Grupy"
            },
            {
              key: "attendance",
              icon: <BarChartOutlined />,
              label: "Statystyki obecności"
            },
            {
              key: "communication",
              icon: <MessageOutlined />,
              label: (
                <Badge count={unviewedCount + unreadMessagesCount} offset={[10, 0]}>
                  <span style={{ color: "rgba(255, 255, 255, 0.85)" }}>Komunikacja</span>
                </Badge>
              )
            },
            {
              key: "settings",
              icon: <SettingOutlined />,
              label: "Ustawienia"
            },
            {
              key: "logout",
              icon: <LogoutOutlined />,
              label: "Wyloguj",
              style: { marginLeft: "auto" }
            }
          ]}
        />
      </Header>
      <Content
        style={{
          margin: "24px auto 32px auto",
          width: "100%",
          padding: "24px",
          maxWidth: 1200,
        }}
      >
        {activeTab === "attendance" && <AttendanceStatistics />}
        {activeTab === "users" && (
          <div style={{ width: "100%" }}>
            <UserManagement
              users={users}
              currentUserId={currentUserId}
              isDark={isDark}
              roleUpdating={roleUpdating}
              setRoleUpdating={setRoleUpdating}
              deletingUser={deletingUser}
              setDeletingUser={setDeletingUser}
              setConfirmRoleChange={setConfirmRoleChange}
              setConfirmDeleteUser={setConfirmDeleteUser}
              setUserToDeleteEmail={setUserToDeleteEmail}
              onUserUpdate={fetchData}
            />
            <AdminCreation
              isDark={isDark}
              creatingAdmin={creatingAdmin}
              setCreatingAdmin={setCreatingAdmin}
              showInviteCode={showInviteCode}
              onAdminCreated={fetchData}
            />
          </div>
        )}
        {activeTab === "children" && (
          <ChildManagement
            children={children}
            groups={groups}
            users={users}
            isDark={isDark}
            creatingChild={creatingChild}
            setCreatingChild={setCreatingChild}
            assigning={assigning}
            setAssigning={setAssigning}
            selectedChild={selectedChild}
            setSelectedChild={setSelectedChild}
            selectedGroup={selectedGroup}
            setSelectedGroup={setSelectedGroup}
            updatingChildGroupId={updatingChildGroupId}
            setUpdatingChildGroupId={setUpdatingChildGroupId}
            setConfirmDeleteChild={setConfirmDeleteChild}
            onChildUpdate={fetchData}
          />
        )}
        {activeTab === "groups" && (
          <GroupManagement
            groups={groups}
            users={users}
            isDark={isDark}
            editingGroup={editingGroup}
            setEditingGroup={setEditingGroup}
            assigningCaregiver={assigningCaregiver}
            setAssigningCaregiver={setAssigningCaregiver}
            setConfirmChangeCaregiverModal={setConfirmChangeCaregiverModal}
            onGroupUpdate={fetchData}
          />
        )}
        {activeTab === "settings" && <SettingsPage />}
        {activeTab === "communication" && (
          <CommunicationTabs
            unreadMessagesCount={unreadMessagesCount}
            unviewedCount={unviewedCount}
            fetchUnreadMessagesCount={fetchUnreadMessagesCount}
            fetchUnviewedCount={fetchUnviewedCount}
          />
        )}
      </Content>
      
      <ConfirmationModals
        confirmRoleChange={confirmRoleChange}
        setConfirmRoleChange={setConfirmRoleChange}
        handleRoleChange={handleRoleChange}
        confirmDeleteUser={confirmDeleteUser}
        setConfirmDeleteUser={setConfirmDeleteUser}
        userToDeleteEmail={userToDeleteEmail}
        setUserToDeleteEmail={setUserToDeleteEmail}
        handleDeleteUser={handleDeleteUser}
        confirmDeleteChild={confirmDeleteChild}
        setConfirmDeleteChild={setConfirmDeleteChild}
        handleDeleteChild={handleDeleteChild}
        confirmChangeCaregiverModal={confirmChangeCaregiverModal}
        setConfirmChangeCaregiverModal={setConfirmChangeCaregiverModal}
        assignCaregiverToGroup={assignCaregiverToGroup}
        users={users}
      />
    </Layout>
  );
}
