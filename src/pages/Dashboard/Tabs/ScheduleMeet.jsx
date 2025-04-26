import { useState, useEffect } from 'react';
import { MinusSquare, User } from 'lucide-react';
import Calendar from '../../../components/calendar';
import { getRecents } from '../../../services/api';

export default function ScheduleMeet() {
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [recentFriends, setRecentFriends] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function setFriends() {
      const friendsRes = await getRecents();
      setRecentFriends(friendsRes);
      setLoading(false)
    }
    setFriends();
  },[]);

  console.log(recentFriends);

  return (
    <>
      {/* Friends List */}
      <div className="friends-list">
        <div className="friends-header">
          <span>My Friends </span>
          <div className="friends-actions">
            <MinusSquare size={18} title="Minimize" />
          </div>
        </div>
        {loading
          ? 'Loading...'
          : recentFriends.map(friend => (
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

      <div className="calendar-area">
        {selectedFriend && <Calendar isOwnCalendar={false} friendObj={selectedFriend} />}
        {!selectedFriend && <div className="empty-state">Select a friend to schedule with</div>}
      </div>
    </>
  );
}
