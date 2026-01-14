import React from 'react';
import { Table, Select, Button, Form, Input, message } from 'antd';
import { HomeOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
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

  return (
    <div style={{ width: "100%" }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 16 }}>
        <HomeOutlined style={{ color: "#FBBF24", marginRight: 8 }} /> Grupy
      </h3>
      <Table
        dataSource={groups}
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
            title: "Nazwa", 
            dataIndex: "name", 
            render: (text: string) => <span style={{ fontWeight: 600, color: isDark ? "#FBBF24" : "#7C3AED", fontSize: 15 }}>{text}</span> 
          },
          {
            title: "Opiekun",
            render: (_: any, record: Group) => (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {record.caregiver ? (
                  <div>
                    <div style={{ fontWeight: 600, color: isDark ? "#E5E7EB" : "#1F2937" }}>
                      {record.caregiver.firstName} {record.caregiver.lastName}
                    </div>
                    <div style={{ fontSize: 12, color: isDark ? "#9CA3AF" : "#6B7280" }}>
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
                    .filter((u: User) => u.role === 'CAREGIVER')
                    .map((caregiver: User) => (
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
            render: (children) => (
              <span style={{ color: isDark ? "#E5E7EB" : "#1F2937" }}>
                {children?.map((c: any) => `${c.firstName} ${c.lastName}`).join(", ") || "-"}
              </span>
            ),
          },
          {
            title: "Akcje",
            render: (_: any, record: Group) => (
              <Button size="small" onClick={() => startEditGroup(record)}>
                Edytuj
              </Button>
            ),
          },
        ]}
      />
      <h3 style={{ marginTop: 32, fontSize: 18, fontWeight: 700, color: isDark ? "#FBBF24" : "#7C3AED" }}>
        {editingGroup ? (
          <>
            <EditOutlined style={{ marginRight: 8 }} /> Edytuj grupę
          </>
        ) : (
          <>
            <PlusOutlined style={{ marginRight: 8 }} /> Utwórz nową grupę
          </>
        )}
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
  );
};

export default GroupManagement;