import { Calendar as CalendarIcon, User, Clock } from 'lucide-react';
import { useState } from 'react';

function MeetingTile({ meeting }) {
  return (
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
  );
}

export default function Meetings({ meetings = [], meetingRequests = [], meetingsSent = [] }) {
  const [activeTab, setActiveTab] = useState(0);
  
  const tabs = [
    { title: "My Scheduled Meetings", data: meetings },
    { title: "Meeting Requests", data: meetingRequests },
    { title: "Meetings Sent", data: meetingsSent }
  ];

  return (
    <div className="calendar-area">
      <div className="meetings-container">
        <div className="meetings-tabs">
          {tabs.map((tab, index) => (
            <div 
              key={index}
              className={`meetings-tab ${activeTab === index ? 'active' : ''}`}
              onClick={() => setActiveTab(index)}
            >
              {tab.title}
            </div>
          ))}
        </div>
        
        {tabs.map((tab, index) => (
          <div key={index} className={`meetings-section ${activeTab === index ? 'active' : ''}`}>
            <h2 className="meetings-title">{tab.title}</h2>
            {tab.data.length > 0 ? (
              <div className="meetings-list">
                {tab.data.map(meeting => (
                  <MeetingTile key={meeting.id} meeting={meeting} />
                ))}
              </div>
            ) : (
              <div className="empty-meetings">No {tab.title.toLowerCase()}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}