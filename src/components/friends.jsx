import { User, MinusSquare } from 'lucide-react';
import { useState } from 'react';

export function FriendsList({ friends }) {
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [showFriendsList, setShowFriendsList] = useState(true);

  return (
    <>
      <div className="friends-list">
        <div className="friends-header">
          <span>My Friends </span>
          <div className="friends-actions">
            <MinusSquare size={18} onClick={() => setShowFriendsList(false)} title="Minimize" />
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
    </>
  );
}

export function AddFriendTile({ friend }) {
  return (
    <>
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
    </>
  );
}

export function MyFriendsList({ friends }) {
  return (
    <>
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
    </>
  );
}
