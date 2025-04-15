import { Calendar as CalendarIcon, User, Clock } from 'lucide-react';

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
export default function Meetings({ meetings }) {
  // add ongoing meeting, past meeting and also view meeting details section
  return (
    <div className="calendar-area">
      <div className="meetings-container">
        <h2 className="meetings-title">My Scheduled Meetings</h2>
        {meetings.length > 0 ? (
          <div className="meetings-list">
            {meetings.map(meeting => (
              <MeetingTile meeting={meeting} />
            ))}
          </div>
        ) : (
          <div className="empty-meetings">No scheduled meetings</div>
        )}
      </div>
    </div>
  );
}
