import { Calendar as CalendarIcon, User, Clock, X, MapPin, Link, ExternalLink, Loader, Check } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { 
  getMyEventRequests, 
  getMyEvents, 
  getUser, 
  getUserById, 
  getEventAttendeeStatus,
  acceptEventRequest,
  rejectEventRequest,
  confirmEvent,
  cancelEvent
} from '../../../services/api';
import AttendeeStatusChart from '../../../components/Chart/AttendeeStatusChart';
import AttendeeList from '../../../components/Chart/AttendeeList';

// Function to check if a string is a URL
const isURL = (str) => {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
};

// Function to check if a string might be a location that should open in Google Maps
const isLocation = (str) => {
  if (!str || str.trim() === '' || isURL(str)) return false;
  return str.length > 3 && !str.includes('@') && !/^\d+$/.test(str);
};

// Format attendee names for compact display
function formatMeetingWith(names) {
  if (!names || names.length === 0) return 'Just you';
  if (names.length <= 2) return names.join(', ');
  return `${names.slice(0, 2).join(', ')} +${names.length - 2}`;
}

// Component for each meeting card in the list
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

// Component for the venue display, handles URLs and locations intelligently
function VenueDisplay({ venue }) {
  if (!venue) return null;

  if (isURL(venue)) {
    return (
      <div className="venue-link">
        <b><Link size={16} className="icon-margin-right" /> Location:</b>
        <a 
          href={venue} 
          target="_blank" 
          rel="noopener noreferrer"
          className="venue-url"
          onClick={(e) => e.stopPropagation()}
        >
          {venue} <ExternalLink size={14} />
        </a>
      </div>
    );
  }

  if (isLocation(venue)) {
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue)}`;
    return (
      <div className="venue-link">
        <b><MapPin size={16} className="icon-margin-right" /> Location:</b>
        <a 
          href={mapUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="venue-url"
          onClick={(e) => e.stopPropagation()}
        >
          {venue} <ExternalLink size={14} />
        </a>
      </div>
    );
  }

  return <div><b><MapPin size={16} className="icon-margin-right" /> Location:</b> {venue}</div>;
}

// Component for the detailed meeting modal
function MeetingDetailsModal({ meeting, currentUserId, onClose, onAction, actionLoading }) {
  const [attendeeDetails, setAttendeeDetails] = useState(null);
  const [loadingAttendees, setLoadingAttendees] = useState(false);
  const modalRef = useRef(null);

  // Get the detailed attendee status for this meeting
  useEffect(() => {
    if (meeting?.id) {
      setLoadingAttendees(true);
      getEventAttendeeStatus(meeting.id)
        .then(data => {
          setAttendeeDetails(data.attendees || []);
        })
        .catch(err => {
          console.error('Failed to fetch attendee status:', err);
          setAttendeeDetails([]);
        })
        .finally(() => {
          setLoadingAttendees(false);
        });
    }
  }, [meeting?.id]);

  if (!meeting) return null;

  // Determine if current user is the meeting owner/creator
  const isOwner = meeting.user === currentUserId;
  
  // Owners can confirm or cancel meetings
  const showConfirmCancel = isOwner && 
                          (meeting.meeting_status === 'SENT' || 
                           meeting.meeting_status === 'CONFIRMED');
  
  // Attendees can accept or reject meeting invitations (if not canceled)
  const showAcceptReject = !isOwner && meeting.meeting_status !== 'CANCELED';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} ref={modalRef}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>
        
        <div className="modal-header">
          <h2 className="modal-title">{meeting.title}</h2>
          <div className="meeting-status-badge" data-status={meeting.meeting_status?.toLowerCase()}>
            {meeting.meeting_status === 'CONFIRMED' ? 'Confirmed' : 
             meeting.meeting_status === 'SENT' ? 'Pending' : 
             meeting.meeting_status === 'CANCELED' ? 'Canceled' : 
             meeting.meeting_status || 'Unknown'}
          </div>
        </div>

        <div className="modal-body">
          <div className="meeting-organizer">
            <b>Organized by:</b> {meeting.organizer_name || 'You'}
          </div>
          
          <div className="meeting-details-grid">
            <div><b><CalendarIcon size={16} className="icon-margin-right" /> Date:</b> {meeting.date}</div>
            <div><b><Clock size={16} className="icon-margin-right" /> Time:</b> {meeting.time}</div>
            <VenueDisplay venue={meeting.venue} />
            {meeting.description && (
              <div className="meeting-description">
                <b>Description:</b>
                <p>{meeting.description}</p>
              </div>
            )}
          </div>

          {loadingAttendees ? (
            <div className="loading-container">
              <Loader size={24} className="spinner" />
              <span>Loading attendees...</span>
            </div>
          ) : (
            <>
              {attendeeDetails && attendeeDetails.length > 0 && (
                <div className="attendee-stats-container">
                  <AttendeeStatusChart attendees={attendeeDetails} />
                </div>
              )}
              <AttendeeList attendees={attendeeDetails || []} />
            </>
          )}
        </div>

        {/* Action buttons */}
        <div className="modal-footer">
          {/* For attendees: Accept/Reject */}
          {showAcceptReject && (
            <div className="action-buttons">
              <button 
                className="btn btn-reject" 
                onClick={() => onAction('reject', meeting.id)}
                disabled={actionLoading}
              >
                {actionLoading === 'reject' ? <Loader size={16} className="spinner" /> : <X size={16} />}
                Reject
              </button>
              <button 
                className="btn btn-accept" 
                onClick={() => onAction('accept', meeting.id)}
                disabled={actionLoading}
              >
                {actionLoading === 'accept' ? <Loader size={16} className="spinner" /> : <Check size={16} />}
                Accept
              </button>
            </div>
          )}

          {/* For meeting owners: Confirm/Cancel */}
          {showConfirmCancel && (
            <div className="action-buttons">
              <button 
                className="btn btn-cancel" 
                onClick={() => onAction('cancel', meeting.id)}
                disabled={actionLoading || meeting.meeting_status === 'CANCELED'}
              >
                {actionLoading === 'cancel' ? <Loader size={16} className="spinner" /> : <X size={16} />}
                Cancel Meeting
              </button>
              {meeting.meeting_status === 'SENT' && (
                <button 
                  className="btn btn-confirm" 
                  onClick={() => onAction('confirm', meeting.id)}
                  disabled={actionLoading}
                >
                  {actionLoading === 'confirm' ? <Loader size={16} className="spinner" /> : <Check size={16} />}
                  Confirm Meeting
                </button>
              )}
            </div>
          )}
        </div>
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
  const [actionLoading, setActionLoading] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const userCache = useRef({});

  // Handler for meeting actions (accept, reject, confirm, cancel)
  const handleMeetingAction = useCallback(async (action, meetingId) => {
    setActionLoading(action);
    try {
      let result;
      switch (action) {
        case 'accept':
          result = await acceptEventRequest(meetingId);
          break;
        case 'reject':
          result = await rejectEventRequest(meetingId);
          break;
        case 'confirm':
          result = await confirmEvent(meetingId);
          break;
        case 'cancel':
          result = await cancelEvent(meetingId);
          break;
        default:
          throw new Error('Unknown action');
      }
      console.log(`Meeting ${action} result:`, result);
      // Update local state or refresh data
      setRefreshTrigger(prev => prev + 1);
      // Close modal after action
      setModalMeeting(null);
    } catch (err) {
      console.error(`Failed to ${action} meeting:`, err);
      // Show error (could add a toast/notification here)
    } finally {
      setActionLoading(null);
    }
  }, []);

  // Fetch user data, meetings, and requests
  useEffect(() => {
    async function fetchData() {
      const user = await getUser();
      const userId = user?.sub || user?.id || user?.email;
      setCurrentUserId(userId);
      const eventRes = await getMyEvents();
      const meetingRequestsRes = await getMyEventRequests();
      
      // Helper to check if user is the owner/creator of the meeting
      const isOwner = meeting => meeting.user === userId;
      
      // "My Scheduled Meetings":
      // 1. Meetings you created that are CONFIRMED
      // 2. Meetings where you're an attendee and that you've ACCEPTED and are CONFIRMED
      const scheduledMeetings = eventRes.filter(m => 
        (m.meeting_status === 'CONFIRMED' && isOwner(m)) || // Your created, confirmed meetings
        (m.meeting_status === 'CONFIRMED' && !isOwner(m))   // Others' meetings you accepted that are confirmed
      );
      
      // "Meeting Requests":
      // Meetings where you're an attendee and need to accept/reject
      // (These come from the getMyEventRequests API)
      
      // "Meetings Sent":
      // Meetings you created that are SENT or CANCELED
      const sentMeetings = eventRes.filter(m => 
        isOwner(m) && (m.meeting_status === 'SENT' || m.meeting_status === 'CANCELED')
      );
      
      // Set initial data
      setMeetings(scheduledMeetings);
      setMeetingsSent(sentMeetings);
      setMeetingRequests(meetingRequestsRes);
      
      // Get all unique attendee IDs and owner IDs
      const allMeetings = [...scheduledMeetings, ...sentMeetings, ...meetingRequestsRes];
      const allUserIds = new Set();
      
      // Track attendees
      allMeetings.forEach(m => {
        // Add attendees (excluding self)
        (m.attendees || []).forEach(id => { 
          if (id !== userId) allUserIds.add(id); 
        });
        
        // Add owner (if not self)
        if (m.user && m.user !== userId) {
          allUserIds.add(m.user);
        }
      });
      
      // Fetch user info for each unique user ID (cache results)
      await Promise.all(Array.from(allUserIds).map(async id => {
        if (!userCache.current[id]) {
          try {
            userCache.current[id] = await getUserById(id);
          } catch {
            userCache.current[id] = { name: 'Unknown', id };
          }
        }
      }));
      
      // Helper to get attendee names for a meeting
      const getAttendeeNames = (attendees) => (attendees || [])
        .filter(id => id !== userId) // exclude self from "with" display
        .map(id => userCache.current[id]?.name?.split(' ')[0] || 'Unknown');
      
      // Format meetings with additional fields
      const formatMeetings = arr => arr.map(meeting => {
        const withStr = formatMeetingWith(getAttendeeNames(meeting.attendees));
        
        // Set organizer name if not the current user
        let organizerName = 'You';
        if (!isOwner(meeting) && meeting.user) {
          organizerName = userCache.current[meeting.user]?.name || 'Unknown';
        }
        
        return { 
          ...meeting, 
          with: withStr,
          isOwner: isOwner(meeting),
          organizer_name: organizerName
        };
      });
      
      setMeetings(formatMeetings(scheduledMeetings));
      setMeetingsSent(formatMeetings(sentMeetings));
      setMeetingRequests(formatMeetings(meetingRequestsRes));
    }
    
    fetchData();
  }, [refreshTrigger]);

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
        {!tabs[activeTab].data && (
          <div className="loading-container">
            <Loader size={24} className="spinner" />
            <span>Loading meetings...</span>
          </div>
        )}
        {tabs[activeTab].data &&
          tabs.map((tab, index) => (
            <div key={index} className={`meetings-section ${activeTab === index ? 'active' : ''}`}>
              {/* <h2 className="meetings-title">{tab.title}</h2> */}
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
        <MeetingDetailsModal 
          meeting={modalMeeting} 
          currentUserId={currentUserId}
          onClose={() => setModalMeeting(null)} 
          onAction={handleMeetingAction}
          actionLoading={actionLoading}
        />
      </div>
    </div>
  );
}

// Add improved styles
const style = document.createElement('style');
style.innerHTML = `
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
}

.modal-content {
  background: #fff;
  border-radius: 12px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  position: relative;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}

.modal-body {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
  transition: background-color 0.2s;
}

.modal-close:hover {
  background-color: #f0f0f0;
}

.meeting-details-grid {
  display: grid;
  grid-gap: 16px;
  margin-bottom: 24px;
  margin-top: 16px;
}

.meeting-details-grid > div {
  display: flex;
  align-items: center;
}

.meeting-description {
  margin-top: 12px;
  display: block !important;
}

.meeting-description p {
  margin-top: 8px;
  line-height: 1.6;
  color: #444;
  white-space: pre-line;
}

.meeting-organizer {
  margin-bottom: 16px;
  color: #666;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-accept {
  background-color: #4bc078;
  color: white;
}

.btn-accept:hover:not(:disabled) {
  background-color: #3fa667;
}

.btn-reject {
  background-color: #f0f0f0;
  color: #333;
}

.btn-reject:hover:not(:disabled) {
  background-color: #e5e5e5;
}

.btn-confirm {
  background-color: #4bc078;
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  background-color: #3fa667;
}

.btn-cancel {
  background-color: #ff6384;
  color: white;
}

.btn-cancel:hover:not(:disabled) {
  background-color: #e95775;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #888;
  gap: 12px;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.icon-margin-right {
  margin-right: 6px;
}

.venue-link a {
  color: #2196f3;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: 6px;
}

.venue-link a:hover {
  text-decoration: underline;
}

.meeting-status-badge {
  padding: 6px 12px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.meeting-status-badge[data-status="confirmed"] {
  background-color: rgba(75, 192, 120, 0.1);
  color: #4bc078;
}

.meeting-status-badge[data-status="sent"] {
  background-color: rgba(255, 205, 86, 0.1);
  color: #e6b800;
}

.meeting-status-badge[data-status="canceled"] {
  background-color: rgba(255, 99, 132, 0.1);
  color: #ff6384;
}

.attendee-stats-container {
  margin-bottom: 16px;
}

.meeting-item {
  background-color: white;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  transition: all 0.2s;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.meeting-item:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.meeting-title {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 12px;
}

.meeting-details {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 14px;
  color: #666;
}

.meeting-with,
.meeting-datetime,
.meeting-venue {
  display: flex;
  align-items: center;
  gap: 6px;
}

.meeting-canceled-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: #ff6384;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.meetings-tabs {
  display: flex;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}

.meetings-tab {
  padding: 12px 16px;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  color: #888;
}

.meetings-tab.active {
  color: #333;
}

.meetings-tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #2196f3;
}

.meetings-section {
  display: none;
}

.meetings-section.active {
  display: block;
}
`;

if (!document.head.querySelector('style[data-meetings-modal]')) {
  style.setAttribute('data-meetings-modal', '');
  document.head.appendChild(style);
}