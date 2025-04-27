import { Calendar as CalendarIcon, User, Clock, X } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { getMyEventRequests, getMyEvents, getUser, getUserById } from '../../../services/api';

function formatMeetingWith(names) {
  if (!names || names.length === 0) return 'Just you';
  if (names.length <= 2) return names.join(', ');
  return `${names.slice(0, 2).join(', ')} +${names.length - 2}`;
}

function MeetingTile({ meeting, onClick }) {
  return (
    <div key={meeting.id} className="meeting-item" onClick={() => onClick(meeting)} style={{ cursor: 'pointer' }}>
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
      </div>
    </div>
  );
}

function MeetingDetailsModal({ meeting, onClose }) {
  if (!meeting) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} style={{ float: 'right', background: 'none', border: 'none' }}>
          <X size={20} />
        </button>
        <h2>{meeting.title}</h2>
        <div><b>Date:</b> {meeting.date}</div>
        <div><b>Time:</b> {meeting.time}</div>
        <div><b>Venue:</b> {meeting.venue}</div>
        <div><b>Description:</b> {meeting.description}</div>
        <div><b>Attendees:</b> {meeting.attendeeNames || 'Loading...'}</div>
      </div>
    </div>
  );
}

export default function Meetings() {
  const [activeTab, setActiveTab] = useState(0);
  const [meetings, setMeetings] = useState(null);
  const [meetingRequests, setMeetingRequests] = useState(null);
  const [meetingsSent, setMeetingsSent] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [modalMeeting, setModalMeeting] = useState(null);
  const userCache = useRef({});

  useEffect(() => {
    async function fetchData() {
      const user = await getUser();
      const userId = user?.sub || user?.id || user?.email;
      setCurrentUserId(userId);
      const eventRes = await getMyEvents();
      const meetingRequestsRes = await getMyEventRequests();
      // Set initial meetings with loading state for names
      setMeetings(eventRes.filter(m => m.meeting_status === 'CONFIRMED'));
      setMeetingsSent(eventRes.filter(m => m.meeting_status === 'SENT' || m.meeting_status === 'CANCELED'));
      setMeetingRequests(meetingRequestsRes);
      // Now resolve attendee names for all meetings
      const allMeetings = [
        ...eventRes.filter(m => m.meeting_status === 'CONFIRMED'),
        ...eventRes.filter(m => m.meeting_status === 'SENT' || m.meeting_status === 'CANCELED'),
        ...meetingRequestsRes
      ];
      // Collect all unique attendee IDs (excluding self)
      const allAttendeeIds = new Set();
      allMeetings.forEach(m => (m.attendees || []).forEach(id => { if (id !== userId) allAttendeeIds.add(id); }));
      // Fetch user info for each unique attendee (cache results)
      await Promise.all(Array.from(allAttendeeIds).map(async id => {
        if (!userCache.current[id]) {
          try {
            userCache.current[id] = await getUserById(id);
          } catch {
            userCache.current[id] = { name: 'Unknown', id };
          }
        }
      }));
      // Helper to get names for a meeting
      const getNames = (attendees) => (attendees || []).filter(id => id !== userId).map(id => userCache.current[id]?.name?.split(' ')[0] || 'Unknown');
      const getAllNames = (attendees) => (attendees || []).map(id => userCache.current[id]?.name || id).join(', ');
      // Format meetings with 'with' and attendeeNames fields
      const formatMeetings = arr => arr.map(meeting => {
        const withStr = formatMeetingWith(getNames(meeting.attendees));
        const attendeeNames = getAllNames(meeting.attendees);
        return { ...meeting, with: withStr, attendeeNames };
      });
      setMeetings(formatMeetings(eventRes.filter(m => m.meeting_status === 'CONFIRMED')));
      setMeetingsSent(formatMeetings(eventRes.filter(m => m.meeting_status === 'SENT' || m.meeting_status === 'CANCELED')));
      setMeetingRequests(formatMeetings(meetingRequestsRes));
    }
    fetchData();
  }, []);

  const tabs = [
    { title: 'My Scheduled Meetings', data: meetings },
    { title: 'Meeting Requests', data: meetingRequests },
    { title: 'Meetings Sent', data: meetingsSent }
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
        {!tabs[activeTab].data && 'Loading...'}
        {tabs[activeTab].data &&
          tabs.map((tab, index) => (
            <div key={index} className={`meetings-section ${activeTab === index ? 'active' : ''}`}>
              <h2 className="meetings-title">{tab.title}</h2>
              {tab.data.length > 0 ? (
                <div className="meetings-list">
                  {tab.data.map(meeting => (
                    <MeetingTile key={meeting.id} meeting={meeting} onClick={setModalMeeting} />
                  ))}
                </div>
              ) : (
                <div className="empty-meetings">No {tab.title.toLowerCase()}</div>
              )}
            </div>
          ))}
        <MeetingDetailsModal meeting={modalMeeting} onClose={() => setModalMeeting(null)} />
      </div>
    </div>
  );
}

// Add minimal modal styles (for demo, should be in CSS file)
const style = document.createElement('style');
style.innerHTML = `
.modal-overlay { position: fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.2); display:flex; align-items:center; justify-content:center; z-index:1000; }
.modal-content { background:#fff; padding:2rem; border-radius:10px; min-width:300px; max-width:90vw; position:relative; }
.modal-close { position:absolute; top:10px; right:10px; cursor:pointer; }
`;
if (!document.head.querySelector('style[data-modal]')) { style.setAttribute('data-modal', ''); document.head.appendChild(style); }
