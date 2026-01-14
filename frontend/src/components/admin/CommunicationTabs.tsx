import React from 'react';
import { Tabs, Badge } from 'antd';
import { MessageOutlined, SoundOutlined } from '@ant-design/icons';
import MessagesView from '../MessagesView';
import AnnouncementsView from '../AnnouncementsView';

interface CommunicationTabsProps {
  unreadMessagesCount: number;
  unviewedCount: number;
  fetchUnreadMessagesCount: () => void;
  fetchUnviewedCount: () => void;
}

const CommunicationTabs: React.FC<CommunicationTabsProps> = ({
  unreadMessagesCount,
  unviewedCount,
  fetchUnreadMessagesCount,
  fetchUnviewedCount
}) => {
  return (
    <div style={{ width: "100%" }}>
      <Tabs
        defaultActiveKey={unviewedCount > 0 ? "announcements" : "messages"}
        items={[
          {
            key: "messages",
            label: (
              <Badge count={unreadMessagesCount} offset={[10, 0]}>
                <span>
                  <MessageOutlined style={{ marginRight: 8 }} /> Wiadomości
                </span>
              </Badge>
            ),
            children: <MessagesView onMessagesUpdate={fetchUnreadMessagesCount} />,
          },
          {
            key: "announcements",
            label: (
              <Badge count={unviewedCount} offset={[10, 0]}>
                <span>
                  <SoundOutlined style={{ marginRight: 8 }} /> Ogłoszenia
                </span>
              </Badge>
            ),
            children: <AnnouncementsView onAnnouncementsViewed={fetchUnviewedCount} />,
          },
        ]}
      />
    </div>
  );
};

export default CommunicationTabs;