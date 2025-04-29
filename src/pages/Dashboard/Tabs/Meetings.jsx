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
      try {
        const user = await getUser();
        const userId = user?.sub || user?.id || user?.email;
        setCurrentUserId(userId);
        
        // Get all meetings (includes both owned and attending)
        const allMeetings = await getMyEvents();
        // Get meeting requests specifically
        const meetingRequestsData = await getMyEventRequests();
        
        console.log("All meetings:", allMeetings);
        console.log("Meeting requests:", meetingRequestsData);
        
        // Helper to check if user is the owner/creator of the meeting
        const isOwner = meeting => meeting.user === userId;
        
        // Helper to get attendee names and organizer info
        const processUserInfo = async () => {
          // Collect all unique user IDs from all meetings (owners + attendees)
          const allUserIds = new Set();
          
          // For all meetings add the owner ID and attendee IDs to our set
          [...allMeetings, ...meetingRequestsData].forEach(meeting => {
            // Add meeting owner if not current user
            if (meeting.user && meeting.user !== userId) {
              allUserIds.add(meeting.user);
            }
            
            // Add all attendees except current user
            (meeting.attendees || []).forEach(id => {
              if (id !== userId) allUserIds.add(id);
            });
          });
          
          // Fetch user info for all unique users
          await Promise.all(Array.from(allUserIds).map(async id => {
            if (!userCache.current[id]) {
              try {
                userCache.current[id] = await getUserById(id);
              } catch (error) {
                console.error(`Failed to fetch user ${id}:`, error);
                userCache.current[id] = { name: 'Unknown User', id };
              }
            }
          }));
          
          // Format attendee names for "with" field
          const formatAttendeeNames = (meeting) => {
            const attendeeNames = (meeting.attendees || [])
              .filter(id => id !== userId)
              .map(id => userCache.current[id]?.name?.split(' ')[0] || 'Unknown');
              
            const withStr = formatMeetingWith(attendeeNames);
            
            // Get organizer name
            let organizerName = 'You';
            if (!isOwner(meeting) && meeting.user) {
              organizerName = userCache.current[meeting.user]?.name || 'Unknown';
            }
            
            return {
              ...meeting,
              with: withStr,
              organizer_name: organizerName,
              isOwner: isOwner(meeting)
            };
          };
          
          // Process all meetings with user info
          const processedMeetings = allMeetings.map(formatAttendeeNames);
          const processedRequests = meetingRequestsData.map(formatAttendeeNames);
          
          // MY SCHEDULED MEETINGS:
          // 1. You are the owner AND meeting is CONFIRMED
          // 2. You are an attendee (not owner) AND meeting is CONFIRMED
          const scheduledMeetings = processedMeetings.filter(meeting => 
            meeting.meeting_status === 'CONFIRMED' && 
            (isOwner(meeting) || !isOwner(meeting)) // Both your meetings and others you've accepted
          );
          
          // MEETING REQUESTS:
          // Meetings where you're an attendee (not owner)
          // Both pending and rejected are shown
          const requests = processedRequests.filter(meeting => 
            !isOwner(meeting) // Not meetings you created
          );
          
          // MEETINGS SENT:
          // Meetings you created with status SENT or CANCELED
          const sentMeetings = processedMeetings.filter(meeting => 
            isOwner(meeting) && 
            (meeting.meeting_status === 'SENT' || meeting.meeting_status === 'CANCELED')
          );
          
          // Update state with processed meetings
          setMeetings(scheduledMeetings);
          setMeetingRequests(requests);
          setMeetingsSent(sentMeetings);
        };
        
        // Process user info for all meetings
        processUserInfo();
        
      } catch (error) {
        console.error("Error fetching meeting data:", error);
      }
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