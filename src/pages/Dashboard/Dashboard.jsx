import { useState } from 'react';
import useDashboardData from './useDashboardData';

import SideBar from './Sidebar';
import ScheduleMeet from './Tabs/ScheduleMeet';
import Meetings from './Tabs/Meetings';
import Friends from './Tabs/Friends';
import Calendar from '../../components/calendar';

import '../styles/Dashboard.css';
import '../styles/Calendar.css';

export default function Dashboard() {
  const [activetab, setActiveTab] = useState('calendar');

  // const { user} = useDashboardData();

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
            {activetab === 'schedule' && <ScheduleMeet />}
            {activetab === 'calendar' && (
              <div className="calendar-area">
                <Calendar isOwnCalendar={true} />
              </div>
            )}
            {activetab === 'meetings' && <Meetings />}
            {activetab === 'friends' && <Friends />}
          </div>
        </div>
      </div>
    </>
  );
}
