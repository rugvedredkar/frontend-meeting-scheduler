import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, User, Clock, UserPlus, MinusSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { getUser, getFriends, getSuggestedFriends, getMyEvents } from '../services/api';

// components
import SearchBar from '../components/searchBar';
import Calendar from '../components/calendar';
import UserDropDown from '../components/user';
import { AddFriendTile, MyFriendsList } from '../components/friends';
import Meetings from '../components/meetings';

import './styles/Dashboard.css';

export default function Dashboard() {

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [showFriendsList, setShowFriendsList] = useState(true);
  const [addFriendTab, setAddFriendTab] = useState('addFriend');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const [viewingOwnCalendar, setViewingOwnCalendar] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [showAddFriend, setShowAddFriend] = useState(false);
  

  const [user, setUser] = useState({});
  const [friends, setFriends] = useState({});
  const [availableFriends, setAvailableFriends] = useState({});
  const [meetings, setMeetings] = useState({});

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const meetingsRes = await getMyEvents();
        const userRes = await getUser();
        const friendsRes = await getFriends();
        const suggestedRes = await getSuggestedFriends();

        setUser(userRes);
        setFriends(friendsRes);
        setAvailableFriends(suggestedRes);
        setMeetings(meetingsRes);

      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Handle tab change
  const handleTabChange = tab => {
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
                <span>Calendar</span>
              </div>
              <div
                className={`sidebar-item ${activeTab === 'meetings' ? 'active' : ''}`}
                onClick={() => handleTabChange('meetings')}
              >
                <Clock size={18} />
                <span>Meetings</span>
              </div>
              <div
                className={`sidebar-item ${activeTab === 'addFriend' ? 'active' : ''}`}
                onClick={() => handleTabChange('addFriend')}
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

          {/* Content Area */}
          <div className="content-area">
            {activeTab === 'schedule' && showFriendsList && (
              <div className="friends-list">
                <div className="friends-header">
                  <span>My Friends </span>
                  <div className="friends-actions">
                    <MinusSquare size={18} onClick={() => setShowFriendsList(false)} title="Minimize" />
                  </div>
                </div>
                {loading 
                 ? "Loading..." : friends.map(friend => (
                  <div
                    key={friends.id}
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
              {activeTab === 'calendar' && <Calendar/>}

              {activeTab === 'schedule' && selectedFriend && <Calendar isOwnCalendar={false} />}

              {activeTab === 'schedule' && !selectedFriend && (
                <div className="empty-state">Select a friend to schedule with</div>
              )}

              {activeTab === 'meetings' && <Meetings/>}

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
                      <SearchBar />

                      <div className="search-results">
                        {/*
                         * Add search results here
                         * TO DO ######
                         */}

                        <h3 className="results-title">Suggested Friends</h3>

                        {availableFriends.map(friend => (
                          <AddFriendTile friend={friend} />
                        ))}
                      </div>
                    </>
                  )}

                  {addFriendTab === 'myFriends' && <MyFriendsList friends={friends} />}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
