import { Card, Button } from "antd";

export default function ParentDashboard({
  onLogout,
}: {
  onLogout: () => void;
}) {
  return (
    <Card
      title="Parent Dashboard"
      extra={<Button onClick={onLogout}>Logout</Button>}
    >
      <p>Panel rodzica: dodawanie i przeglądanie dzieci (TODO)</p>
    </Card>
  );
}
