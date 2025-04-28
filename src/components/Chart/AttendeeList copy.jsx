import React from 'react';
import { User, Check, X, Clock } from 'lucide-react';

const AttendeeList = ({ attendees }) => {
  if (!attendees || !attendees.length) {
    return <div className="no-attendees">No attendees for this event</div>;
  }
  
  // Status icons and colors
  const statusDetails = {
    ACCEPTED: { icon: <Check size={16} />, color: '#4bc078', text: 'Accepted' },
    REJECTED: { icon: <X size={16} />, color: '#ff6384', text: 'Rejected' },
    REQUESTED: { icon: <Clock size={16} />, color: '#ffcd56', text: 'Pending' }
  };

  return (
    <div className="attendees-list">
      <h3 className="attendees-title">Attendees</h3>
      {attendees.map((attendee) => {
        const userInfo = attendee.user || {};
        const status = attendee.status || 'REQUESTED';
        const statusInfo = statusDetails[status] || statusDetails.REQUESTED;
        
        return (
          <div key={userInfo.id || attendee.user_id} className="attendee-item">
            <div className="attendee-avatar">
              {userInfo.picture ? (
                <img src={userInfo.picture} alt={userInfo.name} className="avatar-image" />
              ) : (
                <User size={24} />
              )}
            </div>
            <div className="attendee-details">
              <div className="attendee-name">{userInfo.name || 'Unknown User'}</div>
              <div className="attendee-email">{userInfo.email || ''}</div>
            </div>
            <div 
              className="attendee-status" 
              style={{ 
                color: statusInfo.color,
                backgroundColor: `${statusInfo.color}15` 
              }}
            >
              <span className="status-icon">{statusInfo.icon}</span>
              <span className="status-text">{statusInfo.text}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Add styles dynamically
const style = document.createElement('style');
style.innerHTML = `
  .attendees-list {
    margin-top: 20px;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .attendees-title {
    font-size: 16px;
    margin-bottom: 12px;
    font-weight: 600;
  }
  
  .attendee-item {
    display: flex;
    align-items: center;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 8px;
    background-color: #f9f9f9;
    transition: background-color 0.2s;
  }
  
  .attendee-item:hover {
    background-color: #f0f0f0;
  }
  
  .attendee-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #eaeaea;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    overflow: hidden;
  }
  
  .avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .attendee-details {
    flex: 1;
  }
  
  .attendee-name {
    font-weight: 500;
    font-size: 14px;
  }
  
  .attendee-email {
    font-size: 12px;
    color: #666;
  }
  
  .attendee-status {
    display: flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }
  
  .status-icon {
    margin-right: 4px;
    display: flex;
    align-items: center;
  }
  
  .no-attendees {
    text-align: center;
    padding: 20px;
    color: #666;
    font-style: italic;
  }
`;

if (!document.head.querySelector('style[data-attendees-list]')) {
  style.setAttribute('data-attendees-list', '');
  document.head.appendChild(style);
}

export default AttendeeList;