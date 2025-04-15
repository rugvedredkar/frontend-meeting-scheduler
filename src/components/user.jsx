import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

export default function UserDropDown(user) {
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
