import { Card, Button } from "antd";

export default function CaregiverDashboard({
  onLogout,
}: {
  onLogout: () => void;
}) {
  return (
    <Card
      title="Caregiver Dashboard"
      extra={<Button onClick={onLogout}>Logout</Button>}
    >
      <p>Panel opiekuna: przeglądanie przypisanych dzieci i grup (TODO)</p>
    </Card>
  );
}
