import React from 'react';
import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

interface ConfirmationModalsProps {
  confirmRoleChange: {
    userId: string;
    newRole: 'ADMIN' | 'PARENT' | 'CAREGIVER';
    email: string;
    currentRole: 'ADMIN' | 'PARENT' | 'CAREGIVER';
  } | null;
  setConfirmRoleChange: (data: any) => void;
  handleRoleChange: (userId: string, newRole: string) => Promise<void>;
  
  confirmDeleteUser: string | null;
  setConfirmDeleteUser: (userId: string | null) => void;
  userToDeleteEmail: string;
  setUserToDeleteEmail: (email: string) => void;
  handleDeleteUser: (userId: string) => Promise<void>;
  
  confirmDeleteChild: { id: string; name: string } | null;
  setConfirmDeleteChild: (data: { id: string; name: string } | null) => void;
  handleDeleteChild: (childId: string) => Promise<void>;
  
  confirmChangeCaregiverModal: {
    groupId: string;
    groupName: string;
    newCaregiverId: string;
    currentCaregiver: string;
  } | null;
  setConfirmChangeCaregiverModal: (data: any) => void;
  assignCaregiverToGroup: (groupId: string, caregiverId: string) => Promise<void>;
  users: any[];
}

const ConfirmationModals: React.FC<ConfirmationModalsProps> = ({
  confirmRoleChange,
  setConfirmRoleChange,
  handleRoleChange,
  confirmDeleteUser,
  setConfirmDeleteUser,
  userToDeleteEmail,
  setUserToDeleteEmail,
  handleDeleteUser,
  confirmDeleteChild,
  setConfirmDeleteChild,
  handleDeleteChild,
  confirmChangeCaregiverModal,
  setConfirmChangeCaregiverModal,
  assignCaregiverToGroup,
  users
}) => {
  return (
    <>
      {/* Confirm role change modal */}
      <Modal
        title={
          <span>
            <ExclamationCircleOutlined style={{ color: "#F59E0B", marginRight: 8 }} /> Potwierdź zmianę roli
          </span>
        }
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
        title={
          <span>
            <ExclamationCircleOutlined style={{ color: "#DC2626", marginRight: 8 }} /> Potwierdź usunięcie
          </span>
        }
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
        title={
          <span>
            <ExclamationCircleOutlined style={{ color: "#DC2626", marginRight: 8 }} /> Potwierdź usunięcie dziecka
          </span>
        }
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
        title={
          <span>
            <ExclamationCircleOutlined style={{ color: "#F59E0B", marginRight: 8 }} /> Potwierdź zmianę opiekuna
          </span>
        }
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
    </>
  );
};

export default ConfirmationModals;