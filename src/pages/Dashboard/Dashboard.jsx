import { useState } from 'react';
import useDashboardData from './useDashboardData';

import SideBar from './Sidebar';
import ScheduleMeet from './Tabs/ScheduleMeet';
import Meetings from './Tabs/Meetings';
import Calendar from '../../components/calendar';
import Friends from './Tabs/Friends';

export default function DashboardR() {
  const [activetab, setActiveTab] = useState('calendar');

  const { user, friends, meetings, loading } = useDashboardData();

  console.log(friends);
  const handleTabChange = tab => {
    setActiveTab(tab);
  };

  console.log(friends);
  return (
    <>
      <div className="dashboard-container">
        {/* Main Content */}
        <div className="main-content">
          <SideBar activeTab={activetab} onTabChange={handleTabChange} user={user} />
          <div className="content-area">
            {activetab === 'schedule' && <ScheduleMeet friends={friends} />}
            {activetab === 'calendar' && (
              <div className="calendar-area">
                <Calendar isOwnCalendar={true} />
              </div>
            )}
            {activetab === 'meetings' && <Meetings meetings={meetings} />}
            {activetab === 'friends' && <Friends myFriends={friends} loading={loading} />}
          </div>
        </div>
      </div>
    </>
  );
}
