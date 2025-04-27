import { useEffect, useState } from 'react';
import { Search, User } from 'lucide-react';
import { getFriends, getSuggestedFriends } from '../../../services/api';
import { getSearchResults } from '../../../services/api';

function AddFriendTile({ friend }) {
  return (
    <>
      <div key={friend.id} className="user-result">
        <div className="user-avatar">
          <User size={20} />
        </div>
        <div className="user-info">
          <div className="user-name">{friend.name}</div>
          <div className="user-email">{friend.email}</div>
        </div>
        <button className="add-button">+ Add</button>
      </div>
    </>
  );
}

export function MyFriendsList({ friends }) {
  return (
    <>
      <div className="my-friends-list">
        <h3 className="results-title">My Current Friends</h3>

        {friends.map(friend => (
          <div key={friend.id} className="user-result">
            <div className="user-avatar">
              <User size={20} />
            </div>
            <div className="user-info">
              <div className="user-name">{friend.name}</div>
            </div>
            <button className="remove-button">Remove</button>
          </div>
        ))}
      </div>
    </>
  );
}

export default function Friends() {

  const [tab, setTab] = useState('addConnection');
  const [myFriends, setMyFriends] = useState(null);

  const [query, setQuery] = useState('');
  const [searchedFreinds, setSearchedFreinds] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(false);

  const [suggestedFriends, setSuggestedFriends] = useState(null);
  const [suggestErr, setSuggestErr] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(true);
  
  useEffect(() => {
    async function fetchData() {
      try {
        const suggestedFreindsRes = await getSuggestedFriends(7);
        setSuggestedFriends(suggestedFreindsRes);

        const myFriendsRes = await getFriends();
        setMyFriends(myFriendsRes);
      } catch (err) {
        setSuggestErr(true);
        // console.error(err);
      } finally {
        setSuggestLoading(false);
        // console.log(suggestedFriends);
      }
    }

    fetchData();
  }, []);

  const search = async () => {
    setSearchLoading(true);
    try {
      const searchRes = await getSearchResults(query);
      console.log(searchRes);
      setQuery('');
      setSearchedFreinds(searchRes); 
    } catch(err) {
      setSearchError(true);
    } finally {
      setSearchLoading(false);
      setSearchError(false);
    }
    
  };

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
                <div className="search-icon">
                  <Search size={18} />
                </div>
                <input 
                  type="text" 
                  placeholder="Search for new connections" 
                  className="search-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)} />
                <button className="search-button" onClick={search}>
                  Search
                </button>
              </div>

              <div className="search-results">
                {/* Add better loading animation */}
                {searchLoading && (
                  <>
                  Searching...
                  <p>-----</p>
                  <p></p>
                  </>
                )}
                {!searchLoading && !searchError && searchedFreinds.map(friend => {
                  return <AddFriendTile friend={friend} />})
                }
                {searchError && (
                  <>
                  Error
                  <p>-----</p>
                  <p></p>
                  </>
                )}
                <h3 key={'title'} className="results-title">
                  Add to your network
                </h3>
                {console.log(suggestedFriends)}
                {!suggestLoading && suggestedFriends.map(friend => <AddFriendTile friend={friend} />)}
              </div>
            </>
          )}

          {/* My Freinds Tab */}
          {suggestLoading && <div>'Loading...'</div>}
          {!suggestLoading && tab === 'myNetwork' && <MyFriendsList friends={myFriends} />}
          {/* {suggestErr && 'Error Getting Suggested Friends'} */}
        </div>
      </div>
    </>
  );
}
