import { useEffect, useState } from 'react';
import { getUser, getFriends, getMyEvents, acceptFriendRequest, sendMeetingRequest } from '../../services/api';

export default function useDashboardData() {
  const [user, setUser] = useState({});
  const [friends, setFriends] = useState([]);
  const [meetings, setMeetings] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // const [userRes, friendsRes, meetingsRes] = await Promise.all([
        //   getUser(),
        //   getFriends(),
        //   getMyEvents()
        // ]);

        const friendsRes = await getFriends();
        const meetingsRes = await getMyEvents();

        // console.log(friendsRes);
        // setUser(userRes);
        setFriends(friendsRes);
        setMeetings(meetingsRes);
        // console.log(friends);
      } catch (err) {
        console.error('Dashboard fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // // These are mutation helpers
  // const addFriend = async (friendId) => {
  //     await acceptFriendRequest(friendId);
  //     await fetchData(); // OR just update `friends` state manually
  // };

  // const addMeeting = async (meetingDetails) => {
  //     const newMeeting = await sendMeetingRequest(meetingDetails);
  //     setMeetings(prev => [...prev, newMeeting]); // local update
  // };

  console.log(friends);
  return {
    user,
    friends,
    meetings,
    loading
    // addFriend, addMeeting, fetchData // expose manual refresh
  };
}
