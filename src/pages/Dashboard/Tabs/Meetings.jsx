import '../../styles/Meetings.css';
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
import MeetingTile from './components/MeetingTile';
import VenueDisplay from './components/VenueDisplay';

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
            <div><b><CalendarIcon size={16} className="icon-margin-right" /> Date: </b> {meeting.date}</div>
            <div><b><Clock size={16} className="icon-margin-right" /> Time: </b> {meeting.time}</div>
            <VenueDisplay venue={meeting.venue} />
            {meeting.description && (
              <div className="meeting-description">
                <b>Description:</b>x
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
  // TO DO // ### FIX THE bug d
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
      setMeetingRequests(meetingRequestsRes.filter((event) => event.user !== userId));
      
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