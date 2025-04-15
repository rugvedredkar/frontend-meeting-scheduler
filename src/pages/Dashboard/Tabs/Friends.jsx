import { useEffect, useState } from 'react';
import { Search, User } from 'lucide-react';
import { getSuggestedFriends } from '../../../services/api';

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

export default function Friends({ myFriends }) {

  const [tab, setTab] = useState('addFriend');
  const [searchedFreinds, setSearchedFreinds] = useState([]);
  const [suggestedFriends, setSuggestedFriends] = useState(null);

  // ### TO DO ###
  // add loading and error ui
  const [suggestErr, setSuggestErr] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const suggestedFreindsRes = await getSuggestedFriends(7);
        setSuggestedFriends(suggestedFreindsRes);
      } catch (err) {
        setSuggestErr(false);
        console.error(err);
      } finally {
        setLoading(false);
        console.log(suggestedFriends);
      }
    }

    fetchData();
  }, []);

  const search = async () => {
    
  }

  return (
    <>
      <div className="calendar-area">

      <div className="add-friend-container">
        {/* Headings and Nav Tab */}
        <h2 className="add-friend-title">Manage Friends</h2>

        <div className="add-friend-tabs">
          <div className={`tab ${tab === 'addFriend' ? 'active' : ''}`} onClick={() => setTab('addFriend')}>
            Add Friend
          </div>
          <div className={`tab ${tab === 'myFriends' ? 'active' : ''}`} onClick={() => setTab('myFriends')}>
            My Friends
          </div>
        </div>

        {/* Main Content */}

        {/* Add Friends Tab */}
        {tab === 'addFriend' && (
          <>
            {/* Search Bar */}
            <div className="search-bar">
              <div className="search-icon">
                <Search size={18} />
              </div>
              <input type="text" placeholder="Search for new friends" className="search-input" />
              <button className="search-button" onClick={search}>Search</button>
            </div>

            <div className="search-results">

              {!loading && searchedFreinds.map(friend => <AddFriendTile friend={friend} />)}

              <h3 key={'title'} className="results-title">
                Suggested Friends
              </h3>

              {!loading && suggestedFriends.map(friend => <AddFriendTile friend={friend} />)}
            </div>
          </>
        )}

        {/* My Freinds Tab */}
        {loading && <div>'Loading...'</div>}
        {!loading && tab === 'myFriends' && <MyFriendsList friends={myFriends} />}
      </div>

      </div>
      
    </>
  );
}
