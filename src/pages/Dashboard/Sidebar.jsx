import { CalendarIcon, Clock, UserPlus, Plus, LogOut } from 'lucide-react';
import { useState, useNavigate } from 'react';

// import UserDropDown from '../../components/user';

function UserDropDown(user) {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Handle logout
  const handleLogout = () => {
    // In a real app, you would clear tokens, cookies, etc.
    setIsLoggedIn(false);
    // Navigate to login page
    navigate('/');
  };

  return (
    <>
      <div className="user-menu">
        <div className="user-menu-info">
          <div className="user-menu-name">{user.name}</div>
          <div className="user-menu-email">{user.email}</div>
        </div>
        <div className="user-menu-divider"></div>
        <div className="user-menu-item logout" onClick={handleLogout}>
          <LogOut size={16} />
          <span>Logout</span>
        </div>
      </div>
    </>
  );
}

export default function SideBar({ activeTab, onTabChange, user }) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const toggleUserMenu = () => setShowUserMenu(!showUserMenu);

  return (
    <>
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-menu">
          <div
            className={`sidebar-item ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => onTabChange('schedule')}
          >
            <Plus size={18} />
            <span>schedule meet </span>
          </div>
          <div
            className={`sidebar-item ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => onTabChange('calendar')}
          >
            <CalendarIcon size={18} />
            <span>Calendar</span>
          </div>
          <div
            className={`sidebar-item ${activeTab === 'meetings' ? 'active' : ''}`}
            onClick={() => onTabChange('meetings')}
          >
            <Clock size={18} />
            <span>Meetings</span>
          </div>
          <div
            className={`sidebar-item ${activeTab === 'friends' ? 'active' : ''}`}
            onClick={() => onTabChange('friends')}
          >
            <UserPlus size={18} />
            <span>Friends</span>
          </div>
        </div>

        {/* User section at bottom of sidebar */}
        <div className="sidebar-footer">
          <div className={`sidebar-item user-item ${showUserMenu ? 'active' : ''}`} onClick={toggleUserMenu}>
            <div className="user-avatar">{user.avatar}</div>
            <span>{user.name}</span>
          </div>

          {/* User dropdown menu */}
          {showUserMenu && <UserDropDown user={user} />}
        </div>
      </div>
    </>
  );
}
