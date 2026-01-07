import { BulbOutlined, BulbFilled } from '@ant-design/icons';
import { Button } from 'antd';
import { useTheme } from '../hooks/useTheme';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      type="default"
      shape="circle"
      size="large"
      icon={theme === 'dark' ? <BulbFilled style={{ color: '#FBBF24' }} /> : <BulbOutlined />}
      onClick={toggleTheme}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}
      title={theme === 'dark' ? 'Przełącz na jasny motyw' : 'Przełącz na ciemny motyw'}
    />
  );
}
