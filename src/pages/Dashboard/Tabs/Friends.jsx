import { useEffect, useState, useRef } from 'react';
import { Search, User, CheckCircle, XCircle } from 'lucide-react';
import { 
  getConnectionRequests, 
  getFriends, 
  getSuggestedFriends, 
  getUser,
  getSearchResults,
  addFriendRequest,
  removeFriend,
  cancelFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendStatus
} from '../../../services/api';

function UserTile({ friend, onStatusChange, initialStatus = null }) {
  const [status, setStatus] = useState(initialStatus || 'loading');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialStatus) {
      setStatus(initialStatus);
    } else {
      fetchStatus();
    }
  }, [initialStatus, friend.id]);

  const fetchStatus = async () => {
    try {
      const { status } = await getFriendStatus(friend.id);
      setStatus(status);
    } catch (err) {
      console.error('Error fetching status:', err);
      setStatus('error');
      setError('Could not determine relationship');
    }
  };

  const handleConnect = async () => {
    setActionLoading(true);
    try {
      await addFriendRequest(friend.id);
      setStatus('request_sent');
      if (onStatusChange) onStatusChange('request_sent');
    } catch (err) {
      setError('Failed to send request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      await cancelFriendRequest(friend.id);
      setStatus('none');
      if (onStatusChange) onStatusChange('none');
    } catch (err) {
      setError('Failed to cancel request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAccept = async () => {
    setActionLoading(true);
    try {
      await acceptFriendRequest(friend.id);
      setStatus('friend');
      if (onStatusChange) onStatusChange('friend');
    } catch (err) {
      setError('Failed to accept request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await rejectFriendRequest(friend.id);
      setStatus('none');
      if (onStatusChange) onStatusChange('none');
    } catch (err) {
      setError('Failed to reject request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemove = async () => {
    setActionLoading(true);
    try {
      await removeFriend(friend.id);
      setStatus('none');
      if (onStatusChange) onStatusChange('none');
    } catch (err) {
      setError('Failed to remove friend');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div key={friend.id} className="user-result">
      <div className="user-avatar">
        <User size={20} />
      </div>
      <div className="user-info">
        <div className="user-name">{friend.name}</div>
        <div className="user-email">{friend.email}</div>
      </div>
      
      {status === 'loading' && <div className="loading-status">Loading...</div>}
      
      {status === 'none' && !actionLoading && (
        <button className="add-button" onClick={handleConnect}>Connect</button>
      )}
      
      {status === 'friend' && !actionLoading && (
        <button className="remove-button" onClick={handleRemove}>Remove</button>
      )}
      
      {status === 'request_sent' && !actionLoading && (
        <div className="request-actions">
          <span className="request-status">Request Sent</span>
          <button className="undo-button" onClick={handleCancel}>Undo</button>
        </div>
      )}
      
      {status === 'request_received' && !actionLoading && (
        <div className="request-actions">
          <button className="accept-button" onClick={handleAccept}>
            <CheckCircle size={16} /> Accept
          </button>
          <button className="reject-button" onClick={handleReject}>
            <XCircle size={16} /> Reject
          </button>
        </div>
      )}
      
      {actionLoading && <div className="loading-status">Processing...</div>}
      
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export function MyFriendsList({ friends, onUpdate }) {
  return (
    <div className="my-friends-list">
      <h3 className="results-title">My Current Friends</h3>
      {friends.length === 0 ? (
        <div className="no-friends">You don't have any connections yet.</div>
      ) : (
        friends.map(friend => (
          <UserTile 
            key={friend.id} 
            friend={friend} 
            initialStatus="friend"
            onStatusChange={(status) => {
              if (status !== 'friend' && onUpdate) onUpdate();
            }}
          />
        ))
      )}
    </div>
  );
}

export default function Friends() {
  const [tab, setTab] = useState('addConnection');

  // search friends
  const [query, setQuery] = useState('');
  const [searchedFreinds, setSearchedFreinds] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const searchTimeout = useRef(null);

  const [myFriends, setMyFriends] = useState(null);
  const [suggestedFriends, setSuggestedFriends] = useState(null);
  const [connRequests, setConnRequests] = useState([]);
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const user = await getUser();
        setCurrentUser(user);

        const suggestedFreindsRes = await getSuggestedFriends(7);
        setSuggestedFriends(suggestedFreindsRes);

        const myFriendsRes = await getFriends();
        setMyFriends(myFriendsRes);

        const myFriendRequests = await getConnectionRequests();
        setConnRequests(myFriendRequests.map(req => ({
          ...req, 
          initialStatus: 'request_received'
        })));
      } catch (err) {
        setErr(true);
      } finally {
        setLoading(false);
        setErr(false);
      }
    }

    fetchData();
  }, [refreshTrigger]);

  useEffect(() => {
    if (!query) {
      setSearchedFreinds([]);
      setSearchLoading(false);
      setSearchError(false);
      return;
    }
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    setSearchLoading(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const searchRes = await getSearchResults(query);
        let filtered = searchRes;
        if (currentUser) {
          const myId = currentUser.sub || currentUser.id;
          filtered = searchRes.filter(user => user.id !== myId);
        }
        setSearchedFreinds(filtered);
        setSearchError(false);
      } catch (err) {
        setSearchError(true);
        setSearchedFreinds([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [query, currentUser]);

  return (
    <>
      <div className="calendar-area">
        <div className="add-friend-container">
          {/* Headings and Nav Tab */}
          <h2 className="add-friend-title">Manage Network</h2>

          <div className="add-friend-tabs">
            <div className={`tab ${tab === 'addConnection' ? 'active' : ''}`} onClick={() => setTab('addConnection')}>
              Add Connections
            </div>
            <div
              className={`tab ${tab === 'connectionRequests' ? 'active' : ''}`}
              onClick={() => setTab('connectionRequests')}
            >
              Connection Requests
            </div>
            <div className={`tab ${tab === 'myNetwork' ? 'active' : ''}`} onClick={() => setTab('myNetwork')}>
              My Network
            </div>
          </div>

          {/* Main Content */}

          {/* Add Friends Tab */}
          {tab === 'addConnection' && (
            <>
              {/* Search Bar */}
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Search for new connections"
                  className="search-input"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
              </div>

              <div className="search-results">
                {searchLoading && (
                  <div className="loading-message" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 60 }}>
                    <span className="spinner" />
                  </div>
                )}
                {!searchLoading &&
                  !searchError &&
                  searchedFreinds.length > 0 && (
                    <>
                      <h3 className="results-title">Search Results</h3>
                      {searchedFreinds.map(friend => (
                        <UserTile key={friend.id} friend={friend} onStatusChange={refreshData} />
                      ))}
                    </>
                  )}
                {!searchLoading && !searchError && searchedFreinds.length === 0 && query && (
                  <div className="no-results">No users found matching "{query}"</div>
                )}
                {searchError && <div className="error-message">Error searching users</div>}
                
                <h3 className="results-title">Suggested Connections</h3>
                {loading ? (
                  <div className="loading-message">Loading suggestions...</div>
                ) : (
                  suggestedFriends && suggestedFriends.length > 0 ? (
                    suggestedFriends.map(friend => (
                      <UserTile key={friend.id} friend={friend} onStatusChange={refreshData} />
                    ))
                  ) : (
                    <div className="no-suggestions">No suggestions available</div>
                  )
                )}
              </div>
            </>
          )}

          {/* Connection Requests Tab */}
          {tab === 'connectionRequests' && (
            <div className="connection-requests">
              <h3 className="results-title">Friend Requests</h3>
              {loading ? (
                <div className="loading-message">Loading requests...</div>
              ) : (
                connRequests.length > 0 ? (
                  connRequests.map((friend) => (
                    <UserTile 
                      key={friend.id} 
                      friend={friend} 
                      initialStatus="request_received"
                      onStatusChange={refreshData} 
                    />
                  ))
                ) : (
                  <div className="no-requests">No pending friend requests</div>
                )
              )}
            </div>
          )}

          {/* My Friends Tab */}
          {tab === 'myNetwork' && (
            <>
              {loading ? (
                <div className="loading-message">Loading your network...</div>
              ) : (
                <MyFriendsList 
                  friends={myFriends || []} 
                  onUpdate={refreshData}
                />
              )}
            </>
          )}
          
          {err && <div className="error-message">Error loading data. Please try again.</div>}
        </div>
      </div>
    </>
  );
}
