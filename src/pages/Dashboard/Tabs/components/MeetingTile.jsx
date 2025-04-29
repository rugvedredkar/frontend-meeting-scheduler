import { User, Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';

function MeetingTile({ meeting, onClick }) {
  return (
    <div key={meeting.id} className="meeting-item" onClick={() => onClick(meeting)}>
      <div className="meeting-title">{meeting.title}</div>
      <div className="meeting-details">
        <span className="meeting-with">
          <User size={14} className="meeting-icon" />
          {meeting.with || 'Loading...'}
        </span>
        <span className="meeting-datetime">
          <CalendarIcon size={14} className="meeting-icon" />
          {meeting.date}
        </span>
        <span className="meeting-datetime">
          <Clock size={14} className="meeting-icon" />
          {meeting.time}
        </span>
        {meeting.venue && (
          <span className="meeting-venue">
            <MapPin size={14} className="meeting-icon" />
            {meeting.venue.length > 25 ? meeting.venue.substring(0, 22) + '...' : meeting.venue}
          </span>
        )}
      </div>
      {meeting.meeting_status === 'CANCELED' && (
        <div className="meeting-canceled-badge">Canceled</div>
      )}
    </div>
  );
}

export default MeetingTile; 