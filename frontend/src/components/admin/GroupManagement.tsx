import React, { useState } from 'react';
import { Select, Button, Form, Input, message, Collapse, Card, Tag, App } from 'antd';
import { HomeOutlined, EditOutlined, PlusOutlined, TeamOutlined, UserOutlined, DownOutlined, RightOutlined, DeleteOutlined, ExclamationCircleOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

import { API_URL } from "../../config/api";

interface Group {
  id: string;
  name: string;
  caregiver?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  children?: Array<{
    id: string;
    firstName: string;
    lastName: string;
  }>;
}

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'ADMIN' | 'PARENT' | 'CAREGIVER';
}

interface GroupManagementProps {
  groups: Group[];
  users: User[];
  isDark: boolean;
  editingGroup: Group | null;
  setEditingGroup: (group: Group | null) => void;
  assigningCaregiver: string | null;
  setAssigningCaregiver: (groupId: string | null) => void;
  setConfirmChangeCaregiverModal: (data: {
    groupId: string;
    groupName: string;
    newCaregiverId: string;
    currentCaregiver: string;
  } | null) => void;
  onGroupUpdate: () => Promise<void>;
}

const GroupManagement: React.FC<GroupManagementProps> = ({
  groups,
  users,
  isDark,
  editingGroup,
  setEditingGroup,
  assigningCaregiver,
  setAssigningCaregiver,
  setConfirmChangeCaregiverModal,
  onGroupUpdate
}) => {
  const [groupForm] = Form.useForm();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(groups.map(g => g.id));
  const [deletingGroup, setDeletingGroup] = useState<string | null>(null);
  const { modal } = App.useApp();

  const handleCreateGroup = async (values: any) => {
    try {
      await axios.post(
        `${API_URL}/groups`,
        values,
        { withCredentials: true }
      );
      await onGroupUpdate();
      groupForm.resetFields();
      message.success("Grupa utworzona");
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Błąd tworzenia grupy");
    }
  };

  const handleUpdateGroup = async (values: any) => {
    if (!editingGroup) return;
    try {
      await axios.patch(
        `${API_URL}/groups/${editingGroup.id}`,
        values,
        { withCredentials: true }
      );
      await onGroupUpdate();
      setEditingGroup(null);
      groupForm.resetFields();
      message.success("Grupa zaktualizowana");
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Błąd aktualizacji grupy");
    }
  };

  const startEditGroup = (group: Group) => {
    setEditingGroup(group);
    groupForm.setFieldsValue({ name: group.name });
  };

  const cancelEditGroup = () => {
    setEditingGroup(null);
    groupForm.resetFields();
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
      await axios.post(
        `${API_URL}/groups/${groupId}/assign-caregiver`,
        { caregiverId },
        { withCredentials: true }
      );
      await onGroupUpdate();
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
      await axios.delete(
        `${API_URL}/groups/${groupId}/remove-caregiver`,
        { withCredentials: true }
      );
      await onGroupUpdate();
      message.success('Opiekun usunięty z grupy');
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Błąd usuwania opiekuna');
    } finally {
      setAssigningCaregiver(null);
    }
  };

  const handleDeleteGroup = (group: Group) => {
    console.log('handleDeleteGroup called for group:', group.name);
    console.log('Group children:', group.children?.length || 0);
    console.log('Full group object:', group);
    
    try {
      console.log('About to call modal.confirm...');
      modal.confirm({
        title: 'Usuń grupę',
        icon: <ExclamationCircleOutlined />,
        content: (
          <div>
            <p>Czy na pewno chcesz usunąć grupę <strong>"{group.name}"</strong>?</p>
            {group.children && group.children.length > 0 && (
              <div style={{ 
                background: '#fff2f0', 
                border: '1px solid #ffccc7', 
                borderRadius: 6, 
                padding: 12, 
                marginTop: 12 
              }}>
                <p style={{ color: '#ff4d4f', margin: 0, fontWeight: 600 }}>
                  <WarningOutlined style={{ color: '#ff4d4f' }} /> Uwaga: Ta grupa ma {group.children.length} przypisanych dzieci:
                </p>
                <ul style={{ margin: '8px 0 0 0', color: '#ff4d4f' }}>
                  {group.children.map(child => (
                    <li key={child.id}>{child.firstName} {child.lastName}</li>
                  ))}
                </ul>
                <p style={{ color: '#ff4d4f', margin: '8px 0 0 0', fontSize: '12px' }}>
                  Przed usunięciem grupy musisz najpierw przenieść lub usunąć wszystkie dzieci.
                </p>
              </div>
            )}
            {(!group.children || group.children.length === 0) && (
              <p style={{ color: '#52c41a', marginTop: 12 }}>
                <CheckCircleOutlined style={{ color: '#52c41a' }} /> Grupa jest pusta i może być bezpiecznie usunięta.
              </p>
            )}
          </div>
        ),
        okText: 'Usuń',
        okType: 'danger',
        cancelText: 'Anuluj',
        okButtonProps: { 
          disabled: group.children && group.children.length > 0,
          loading: deletingGroup === group.id
        },
        onOk: async () => {
          console.log('Modal onOk triggered');
          if (group.children && group.children.length > 0) {
            console.log('Group has children, cancelling delete');
            return;
          }
          console.log('Proceeding with deleteGroup');
          await deleteGroup(group.id);
        },
      });
      console.log('modal.confirm called successfully');
    } catch (error) {
      console.error('Error calling modal.confirm:', error);
    }
  };

  const deleteGroup = async (groupId: string) => {
    console.log('deleteGroup called for groupId:', groupId);
    setDeletingGroup(groupId);
    try {
      console.log('Sending DELETE request to:', `${API_URL}/groups/${groupId}`);
      await axios.delete(
        `${API_URL}/groups/${groupId}`,
        { withCredentials: true }
      );
      await onGroupUpdate();
      message.success('Grupa została usunięta');
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Błąd usuwania grupy');
    } finally {
      setDeletingGroup(null);
    }
  };

  const handleRemoveAllChildren = (group: Group) => {
    modal.confirm({
      title: 'Usuń wszystkie dzieci z grupy',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Czy na pewno chcesz usunąć wszystkie dzieci z grupy <strong>"{group.name}"</strong>?</p>
          <div style={{ 
            background: '#fff7e6', 
            border: '1px solid #ffd591', 
            borderRadius: 6, 
            padding: 12, 
            marginTop: 12 
          }}>
            <p style={{ color: '#d46b08', margin: 0, fontWeight: 600 }}>
              <WarningOutlined style={{ color: '#d46b08', marginRight: 8 }} />
              Dzieci do usunięcia z grupy ({group.children?.length || 0}):
            </p>
            <ul style={{ margin: '8px 0 0 0', color: '#d46b08' }}>
              {group.children?.map(child => (
                <li key={child.id}>{child.firstName} {child.lastName}</li>
              ))}
            </ul>
          </div>
          <p style={{ color: '#52c41a', marginTop: 12, fontSize: '14px' }}>
            Dzieci pozostaną w systemie, ale nie będą przypisane do żadnej grupy.
          </p>
        </div>
      ),
      okText: 'Usuń wszystkie z grupy',
      okType: 'danger',
      cancelText: 'Anuluj',
      onOk: async () => {
        await removeAllChildrenFromGroup(group);
      }
    });
  };

  const removeAllChildrenFromGroup = async (group: Group) => {
    try {
      const updatePromises = group.children?.map(child =>
        axios.patch(
          `${API_URL}/children/${child.id}/group`,
          { groupId: null },
          { withCredentials: true }
        )
      ) || [];

      await Promise.all(updatePromises);
      await onGroupUpdate();
      message.success(`Usunięto ${group.children?.length || 0} dzieci z grupy "${group.name}"`);
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Błąd usuwania dzieci z grupy');
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 24 }}>
        <HomeOutlined style={{ color: "#FBBF24", marginRight: 8 }} /> Zarządzanie grupami
      </h3>
      
      {/* Formularz tworzenia/edycji grup */}
      <Card
        style={{
          marginBottom: 24,
          borderRadius: 12,
          boxShadow: isDark ? "0 0 20px rgba(251,191,36,0.15)" : "0 2px 8px rgba(0,0,0,0.08)",
          border: isDark ? "1px solid #4a3a5a" : "1px solid #E5E7EB",
          background: isDark ? "linear-gradient(135deg, #1a1230 0%, #1f1838 100%)" : "white"
        }}
      >
        <h4 style={{ fontSize: 18, fontWeight: 600, color: isDark ? "#FBBF24" : "#7C3AED", marginBottom: 16 }}>
          {editingGroup ? (
            <>
              <EditOutlined style={{ marginRight: 8 }} /> Edytuj grupę: {editingGroup.name}
            </>
          ) : (
            <>
              <PlusOutlined style={{ marginRight: 8 }} /> Utwórz nową grupę
            </>
          )}
        </h4>
        <Form
          form={groupForm}
          layout="inline"
          onFinish={editingGroup ? handleUpdateGroup : handleCreateGroup}
        >
          <Form.Item
            name="name"
            label="Nazwa grupy"
            rules={[{ required: true, message: "Podaj nazwę grupy" }]}
            style={{ minWidth: 300 }}
          >
            <Input placeholder="np. Żabki, Motylki" />
          </Form.Item>
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              style={{ 
                background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)", 
                border: "none", 
                fontWeight: 600, 
                boxShadow: "0 4px 12px rgba(251,191,36,0.4)" 
              }}
            >
              {editingGroup ? "Zapisz zmiany" : "Utwórz grupę"}
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
      </Card>

      {/* Lista grup z funkcjonalnością rozwijania */}
      <div style={{ marginTop: 24 }}>
        <h4 style={{ fontSize: 18, fontWeight: 600, color: isDark ? "#E5E7EB" : "#1F2937", marginBottom: 16 }}>
          Lista grup ({groups.length})
        </h4>
        
        {groups.length === 0 ? (
          <Card style={{
            borderRadius: 12,
            border: isDark ? "1px dashed #4a3a5a" : "1px dashed #D1D5DB",
            background: isDark ? "rgba(26, 18, 48, 0.3)" : "rgba(249, 250, 251, 0.8)",
            textAlign: "center",
            padding: "40px 20px"
          }}>
            <TeamOutlined style={{ fontSize: 48, color: isDark ? "#4a3a5a" : "#D1D5DB", marginBottom: 16 }} />
            <p style={{ color: isDark ? "#9CA3AF" : "#6B7280", fontSize: 16 }}>
              Nie ma jeszcze żadnych grup. Utwórz pierwszą grupę powyżej.
            </p>
          </Card>
        ) : (
          <Collapse
            activeKey={expandedGroups}
            onChange={setExpandedGroups}
            style={{ background: "transparent", border: "none" }}
            expandIcon={({ isActive }) => isActive ? 
              <DownOutlined style={{ color: isDark ? "#FBBF24" : "#7C3AED" }} /> : 
              <RightOutlined style={{ color: isDark ? "#FBBF24" : "#7C3AED" }} />
            }
            items={groups.map((group: Group) => ({
              key: group.id,
              label: (
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  width: "100%"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <HomeOutlined style={{ color: isDark ? "#FBBF24" : "#7C3AED", fontSize: 16 }} />
                    <span style={{ 
                      fontSize: 16, 
                      fontWeight: 600, 
                      color: isDark ? "#E5E7EB" : "#1F2937" 
                    }}>
                      {group.name}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <Tag 
                      icon={<TeamOutlined />} 
                      color={group.children?.length ? "blue" : "default"}
                    >
                      {group.children?.length || 0} dzieci
                    </Tag>
                    <Tag 
                      icon={<UserOutlined />} 
                      color={group.caregiver ? "green" : "orange"}
                    >
                      {group.caregiver ? "Ma opiekuna" : "Brak opiekuna"}
                    </Tag>
                    <Button 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditGroup(group);
                      }}
                      style={{ 
                        background: isDark ? "rgba(251,191,36,0.1)" : "rgba(124,58,237,0.1)",
                        border: isDark ? "1px solid rgba(251,191,36,0.3)" : "1px solid rgba(124,58,237,0.3)",
                        color: isDark ? "#FBBF24" : "#7C3AED"
                      }}
                    >
                      <EditOutlined /> Edytuj
                    </Button>
                    <Button 
                      size="small" 
                      danger
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteGroup(group);
                      }}
                      loading={deletingGroup === group.id}
                      style={{ 
                        background: isDark ? "rgba(239, 68, 68, 0.1)" : "rgba(239, 68, 68, 0.05)",
                        border: isDark ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(239, 68, 68, 0.2)",
                        color: "#EF4444"
                      }}
                    >
                      <DeleteOutlined /> Usuń
                    </Button>
                  </div>
                </div>
              ),
              children: (
                <div style={{ 
                  background: isDark ? "rgba(31, 24, 56, 0.4)" : "rgba(249, 250, 251, 0.8)", 
                  borderRadius: 8, 
                  padding: 16,
                  marginTop: 8
                }}>
                  {/* Sekcja opiekuna */}
                  <div style={{ marginBottom: 24 }}>
                    <h5 style={{ 
                      fontSize: 14, 
                      fontWeight: 600, 
                      color: isDark ? "#A78BFA" : "#6B7280",
                      marginBottom: 12,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>
                      Opiekun grupy
                    </h5>
                    {group.caregiver ? (
                      <div style={{ 
                        background: isDark ? "rgba(34, 197, 94, 0.1)" : "rgba(34, 197, 94, 0.05)",
                        border: isDark ? "1px solid rgba(34, 197, 94, 0.2)" : "1px solid rgba(34, 197, 94, 0.15)",
                        borderRadius: 8,
                        padding: 12,
                        marginBottom: 12
                      }}>
                        <div style={{ fontWeight: 600, color: isDark ? "#E5E7EB" : "#1F2937", fontSize: 14 }}>
                          {group.caregiver.firstName} {group.caregiver.lastName}
                        </div>
                        <div style={{ fontSize: 12, color: isDark ? "#9CA3AF" : "#6B7280", marginTop: 4 }}>
                          {group.caregiver.email}
                        </div>
                      </div>
                    ) : (
                      <div style={{ 
                        background: isDark ? "rgba(245, 158, 11, 0.1)" : "rgba(245, 158, 11, 0.05)",
                        border: isDark ? "1px solid rgba(245, 158, 11, 0.2)" : "1px dashed rgba(245, 158, 11, 0.3)",
                        borderRadius: 8,
                        padding: 12,
                        marginBottom: 12
                      }}>
                        <div style={{ color: isDark ? "#F59E0B" : "#D97706", fontSize: 14, fontWeight: 500 }}>
                          Brak przypisanego opiekuna
                        </div>
                      </div>
                    )}
                    <Select
                      value={group.caregiver?.id}
                      style={{ width: "100%" }}
                      placeholder="Przypisz lub zmień opiekuna"
                      allowClear
                      loading={assigningCaregiver === group.id}
                      disabled={assigningCaregiver === group.id}
                      onChange={(val) => {
                        if (val) {
                          handleAssignCaregiver(group.id, val);
                        } else {
                          handleRemoveCaregiver(group.id);
                        }
                      }}
                    >
                      {users
                        .filter((u: User) => u.role === 'CAREGIVER')
                        .map((caregiver: User) => (
                          <Select.Option key={caregiver.id} value={caregiver.id}>
                            {caregiver.firstName} {caregiver.lastName} ({caregiver.email})
                          </Select.Option>
                        ))}
                    </Select>
                  </div>

                  {/* Sekcja dzieci */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <h5 style={{ 
                        fontSize: 12, 
                        fontWeight: 600, 
                        color: isDark ? "#A78BFA" : "#6B7280",
                        margin: 0,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px"
                      }}>
                        Dzieci w grupie ({group.children?.length || 0})
                      </h5>
                      {group.children && group.children.length > 0 && (
                        <Button 
                          size="small" 
                          type="link"
                          danger
                          onClick={() => handleRemoveAllChildren(group)}
                          style={{ 
                            padding: '0 8px',
                            fontSize: '12px'
                          }}
                        >
                          Usuń wszystkie z grupy
                        </Button>
                      )}
                    </div>
                    {group.children && group.children.length > 0 ? (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 12 }}>
                        {group.children.map((child) => (
                          <div
                            key={child.id}
                            style={{
                              background: isDark ? "rgba(59, 130, 246, 0.1)" : "rgba(59, 130, 246, 0.05)",
                              border: isDark ? "1px solid rgba(59, 130, 246, 0.2)" : "1px solid rgba(59, 130, 246, 0.15)",
                              borderRadius: 8,
                              padding: 12
                            }}
                          >
                            <div style={{ fontWeight: 600, color: isDark ? "#E5E7EB" : "#1F2937", fontSize: 14 }}>
                              {child.firstName} {child.lastName}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ 
                        background: isDark ? "rgba(107, 114, 128, 0.1)" : "rgba(107, 114, 128, 0.05)",
                        border: isDark ? "1px dashed rgba(107, 114, 128, 0.2)" : "1px dashed rgba(107, 114, 128, 0.3)",
                        borderRadius: 8,
                        padding: 20,
                        textAlign: "center"
                      }}>
                        <TeamOutlined style={{ fontSize: 32, color: isDark ? "#6B7280" : "#9CA3AF", marginBottom: 8 }} />
                        <div style={{ color: isDark ? "#9CA3AF" : "#6B7280", fontSize: 14 }}>
                          Brak dzieci w tej grupie
                        </div>
                        <div style={{ color: isDark ? "#6B7280" : "#9CA3AF", fontSize: 12, marginTop: 4 }}>
                          Dzieci można przypisać w sekcji "Dzieci"
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ),
              style: {
                marginBottom: 12,
                borderRadius: 12,
                boxShadow: isDark ? "0 0 20px rgba(251,191,36,0.1)" : "0 2px 8px rgba(0,0,0,0.08)",
                border: isDark ? "1px solid #4a3a5a" : "1px solid #E5E7EB",
                background: isDark ? "linear-gradient(135deg, #1a1230 0%, #1f1838 100%)" : "white"
              }
            }))}
          />
        )}
      </div>
    </div>
  );
};

export default GroupManagement;