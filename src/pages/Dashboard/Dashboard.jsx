import { useState } from 'react';

import SideBar from './Sidebar';
import Meetings from './Tabs/Meetings';
import Friends from './Tabs/Friends';
import Calendar from './Tabs/Calendar';
import AIChat from './Tabs/AIChat';

import '../styles/Dashboard.css';
import '../styles/Calendar.css';
import '../styles/AIChat.css';

export default function Dashboard() {
  const [activetab, setActiveTab] = useState('calendar');

  const handleTabChange = tab => {
    setActiveTab(tab);
  };

  return (
    <>
      <div className="dashboard-container">
        {/* Main Content */}
        <div className="main-content">
          <SideBar activeTab={activetab} onTabChange={handleTabChange} />
          <div className="content-area">
            {/* {activetab === 'schedule' && <ScheduleMeet />} */}
            {activetab === 'calendar' && (
              <div className="calendar-area">
                <Calendar />
              </div>
            )}
            {activetab === 'meetings' && <Meetings />}
            {activetab === 'friends' && <Friends />}
            {activetab === 'aichat' && <AIChat />}
          </div>
        </div>
      </div>
    </>
  );
}
