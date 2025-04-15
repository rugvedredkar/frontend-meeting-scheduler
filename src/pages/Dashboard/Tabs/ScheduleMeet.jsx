import { useState } from "react";
import { MinusSquare, User } from "lucide-react";
import Calendar from "../../../components/calendar";

export default function ScheduleMeet ({friends, loading}) {

    const [selectedFriend, setSelectedFriend] = useState(null);

    return (
        <> 
            {/* Friends List */}
            <div className="friends-list">
                <div className="friends-header">
                  <span>My Friends </span>
                  <div className="friends-actions">
                    <MinusSquare size={18} 
                    // onClick={() => setShowFriendsList(false)} 
                    title="Minimize" />
                  </div>
                </div>
                {loading 
                 ? "Loading..." : friends.map(friend => (
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
                {selectedFriend && <Calendar isOwnCalendar={false} friendObj={friends.filter((friend) => friend.id === selectedFriend)}/>}
                {!selectedFriend && <div className="empty-state">Select a friend to schedule with</div>}
            </div>
        </>
    )


}