import { useState } from 'react';
import { Calendar as CalendarIcon, Plus, User, Clock, MinusSquare, ChevronLeft, ChevronRight, LogOut, UserPlus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [showFriendsList, setShowFriendsList] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewingOwnCalendar, setViewingOwnCalendar] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [addFriendTab, setAddFriendTab] = useState('addFriend');
  
  // Sample user data
  const user = {
    name: "Jamie Smith",
    email: "jamie.smith@example.com",
    avatar: "JS"
  };
  
  const friends = [
    { id: 1, name: 'Alex Smith' },
    { id: 2, name: 'Taylor Kim' },
    { id: 3, name: 'Jordan Park' },
  ];
  
  // Sample available users to add as friends
  const availableFriends = [
    { id: 4, name: 'Robin Chen', email: 'robin.chen@example.com' },
    { id: 5, name: 'Morgan Lee', email: 'morgan.lee@example.com' },
    { id: 6, name: 'Casey Taylor', email: 'casey.taylor@example.com' },
  ];
  
  // Sample meetings data
  const meetings = [
    { id: 1, title: 'Team Standup', with: 'Alex Smith', date: '2025-04-15', time: '09:00 AM' },
    { id: 2, title: 'Project Review', with: 'Taylor Kim', date: '2025-04-17', time: '02:30 PM' },
    { id: 3, title: 'Coffee Chat', with: 'Jordan Park', date: '2025-04-20', time: '11:00 AM' },
  ];

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'schedule') {
      setShowFriendsList(true);
      setViewingOwnCalendar(false);
    } else if (tab === 'calendar') {
      setViewingOwnCalendar(true);
      setSelectedFriend(null);
    } else if (tab === 'addFriend') {
      setShowAddFriend(true);
      setViewingOwnCalendar(false);
      setShowFriendsList(false);
      setAddFriendTab('addFriend');
    } else {
      setViewingOwnCalendar(false);
    }
    // Close user menu if open
    setShowUserMenu(false);
  };

  // Toggle user menu
  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  // Handle logout
  const handleLogout = () => {
    // In a real app, you would clear tokens, cookies, etc.
    setIsLoggedIn(false);
    // Navigate to login page
    navigate('/');
  };

  // Get days for calendar
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const daysInMonth = [];
    
    // Add empty cells for days before the first day of the month
    const firstDayOfWeek = firstDay.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      daysInMonth.push({ date: null, events: [] });
    }
    
    // Add days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const currentDate = new Date(year, month, i);
      
      // Add some sample events based on whether viewing own calendar or friend's
      const events = [];
      if (viewingOwnCalendar) {
        if (i === 8 || i === 15 || i === 22) {
          events.push({ title: 'Team Meeting', time: '09:00 AM' });
        }
        if (i === 10 || i === 24) {
          events.push({ title: 'Client Call', time: '02:30 PM' });
        }
      } else {
        if (i === 10 || i === 15 || i === 22) {
          events.push({ title: 'Meeting', time: '10:00 AM' });
        }
        if (i === 5 || i === 20) {
          events.push({ title: 'Lunch', time: '12:30 PM' });
        }
      }
      
      daysInMonth.push({ 
        date: currentDate,
        events: events 
      });
    }
    
    return daysInMonth;
  };

  const days = getDaysInMonth(currentMonth);
  
  // Navigation
  const nextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  
  const prevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  // Format month
  const formatMonth = (date) => {
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
  };

  // Days of the week
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Check if a date is today
  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  // If user is logged out, redirect to login page
  if (!isLoggedIn) {
    // We already have navigation in the handleLogout function
    // This is just a fallback in case the navigation doesn't work
    return (
      <div className="login-container">
        <div className="login-card">
          <h2>You have been logged out</h2>
          <p>Please log in again to continue</p>
          <button 
            className="login-button" 
            onClick={() => navigate('/')}
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="dashboard-container">
        {/* Main Content */}
        <div className="main-content">
          {/* Sidebar */}
          <div className="sidebar">
            <div className="sidebar-menu">
              <div 
                className={`sidebar-item ${activeTab === 'schedule' ? 'active' : ''}`} 
                onClick={() => handleTabChange('schedule')}
              >
                <Plus size={18} />
                <span>schedule meet </span>
              </div>
              <div 
                className={`sidebar-item ${activeTab === 'calendar' ? 'active' : ''}`} 
                onClick={() => handleTabChange('calendar')}
              >
                <CalendarIcon size={18} />
                <span>my calendar</span>
              </div>
              <div 
                className={`sidebar-item ${activeTab === 'meetings' ? 'active' : ''}`} 
                onClick={() => handleTabChange('meetings')}
              >
                <Clock size={18} />
                <span>my meetings</span>
              </div>
              <div 
                className={`sidebar-item ${activeTab === 'addFriend' ? 'active' : ''}`} 
                onClick={() => handleTabChange('addFriend')}
              >
                <UserPlus size={18} />
                <span>add friend</span>
              </div>
            </div>
            
            {/* User section at bottom of sidebar */}
            <div className="sidebar-footer">
              <div 
                className={`sidebar-item user-item ${showUserMenu ? 'active' : ''}`} 
                onClick={toggleUserMenu}
              >
                <div className="user-avatar">{user.avatar}</div>
                <span>{user.name}</span>
              </div>
              
              {/* User dropdown menu */}
              {showUserMenu && (
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
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="content-area">
            {/* Friends List - Now visible for schedule tab only */}
            {(activeTab === 'schedule') && showFriendsList && (
              <div className="friends-list">
                <div className="friends-header">
                  <span>My Friends </span>
                  <div className="friends-actions">
                    <MinusSquare 
                      size={18}
                      onClick={() => setShowFriendsList(false)} 
                      title="Minimize"
                    />
                  </div>
                </div>
                {friends.map(friend => (
                  <div 
                    key={friend.id} 
                    className={`friend-item ${selectedFriend && selectedFriend.id === friend.id ? 'selected' : ''}`}
                    onClick={() => setSelectedFriend(friend)}
                  >
                    <div className="friend-avatar">
                      <User size={18} />
                    </div>
                    <span className="friend-name">{friend.name}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Calendar or Meetings Area */}
            <div className="calendar-area">
              {activeTab === 'calendar' && (
                <div className="calendar-container">
                  <div className="calendar-header">
                    <div className="calendar-title">
                      My Calendar - {formatMonth(currentMonth)}
                    </div>
                    <div className="calendar-nav">
                      <div className="calendar-nav-btn" onClick={prevMonth}>
                        <ChevronLeft size={18} />
                      </div>
                      <div className="calendar-nav-btn" onClick={nextMonth}>
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="calendar-grid">
                    {/* Days of week */}
                    {weekdays.map(day => (
                      <div key={day} className="calendar-day-header">{day}</div>
                    ))}
                    
                    {/* Calendar days */}
                    {days.map((day, index) => (
                      <div 
                        key={index} 
                        className={`calendar-day ${day.date && isToday(day.date) ? 'today' : ''} ${day.events.length > 0 ? 'has-event' : ''}`}
                        style={{ visibility: day.date ? 'visible' : 'hidden' }}
                      >
                        {day.date && (
                          <>
                            <div className="day-number">{day.date.getDate()}</div>
                            {day.events.map((event, i) => (
                              <div key={i} className="day-event">
                                {event.title} • {event.time}
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'schedule' && selectedFriend && (
                <div className="calendar-container">
                  <div className="calendar-header">
                    <div className="calendar-title">
                      Schedule with {selectedFriend.name} - {formatMonth(currentMonth)}
                    </div>
                    <div className="calendar-nav">
                      <div className="calendar-nav-btn" onClick={prevMonth}>
                        <ChevronLeft size={18} />
                      </div>
                      <div className="calendar-nav-btn" onClick={nextMonth}>
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="calendar-grid">
                    {/* Days of week */}
                    {weekdays.map(day => (
                      <div key={day} className="calendar-day-header">{day}</div>
                    ))}
                    
                    {/* Calendar days */}
                    {days.map((day, index) => (
                      <div 
                        key={index} 
                        className={`calendar-day ${day.date && isToday(day.date) ? 'today' : ''} ${day.events.length > 0 ? 'has-event' : ''}`}
                        style={{ visibility: day.date ? 'visible' : 'hidden' }}
                      >
                        {day.date && (
                          <>
                            <div className="day-number">{day.date.getDate()}</div>
                            {day.events.map((event, i) => (
                              <div key={i} className="day-event">
                                {event.title} • {event.time}
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'schedule' && !selectedFriend && (
                <div className="empty-state">
                  Select a friend to schedule with
                </div>
              )}

              {activeTab === 'meetings' && (
                <div className="meetings-container">
                  <h2 className="meetings-title">My Scheduled Meetings</h2>
                  {meetings.length > 0 ? (
                    <div className="meetings-list">
                      {meetings.map(meeting => (
                        <div key={meeting.id} className="meeting-item">
                          <div className="meeting-title">{meeting.title}</div>
                          <div className="meeting-details">
                            <span className="meeting-with">
                              <User size={14} className="meeting-icon" />
                              {meeting.with}
                            </span>
                            <span className="meeting-datetime">
                              <CalendarIcon size={14} className="meeting-icon" />
                              {meeting.date}
                            </span>
                            <span className="meeting-datetime">
                              <Clock size={14} className="meeting-icon" />
                              {meeting.time}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-meetings">No scheduled meetings</div>
                  )}
                </div>
              )}

              {activeTab === 'addFriend' && (
                <div className="add-friend-container">
                  <h2 className="add-friend-title">Manage Friends</h2>
                  
                  <div className="add-friend-tabs">
                    <div 
                      className={`tab ${addFriendTab === 'addFriend' ? 'active' : ''}`}
                      onClick={() => setAddFriendTab('addFriend')}
                    >
                      Add Friend
                    </div>
                    <div 
                      className={`tab ${addFriendTab === 'myFriends' ? 'active' : ''}`}
                      onClick={() => setAddFriendTab('myFriends')}
                    >
                      My Friends
                    </div>
                  </div>
                  
                  {addFriendTab === 'addFriend' && (
                    <>
                      <div className="search-bar">
                        <div className="search-icon">
                          <Search size={18} />
                        </div>
                        <input 
                          type="text" 
                          placeholder="Search for new friends" 
                          className="search-input" 
                        />
                        <button className="search-button">Search</button>
                      </div>
                      
                      <div className="search-results">
                        <h3 className="results-title">Suggested Friends</h3>
                        
                        {availableFriends.map(friend => (
                          <div key={friend.id} className="user-result">
                            <div className="user-avatar">
                              <User size={20} />
                            </div>
                            <div className="user-info">
                              <div className="user-name">{friend.name}</div>
                              <div className="user-email">{friend.email}</div>
                            </div>
                            <button className="add-button">+ Add</button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  
                  {addFriendTab === 'myFriends' && (
                    <div className="my-friends-list">
                      <h3 className="results-title">My Current Friends</h3>
                      
                      {friends.map(friend => (
                        <div key={friend.id} className="user-result">
                          <div className="user-avatar">
                            <User size={20} />
                          </div>
                          <div className="user-info">
                            <div className="user-name">{friend.name}</div>
                          </div>
                          <button className="remove-button">Remove</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}