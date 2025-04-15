const API_BASE = 'http://10.0.0.244:8080'; // Change this if you're deployed

export async function verifyUser(idToken) {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id_token: idToken })
  });

  if (!res.ok) throw new Error('Login failed');
  return await res.json(); // this contains user info from the backend
}

export async function getMyEvents() {
  const idToken = localStorage.getItem('token'); // previously stored Google ID token

  if (!idToken) {
    throw new Error('No auth token found. Please log in again.');
  }

  const res = await fetch(`${API_BASE}/events`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${idToken}`
    }
  });

  if (!res.ok) {
    throw new Error('Failed to fetch protected data');
  }

  const { events: resObj } = await res.json();

  // console.log(resObj);

  return resObj;
}

export async function getFriendsAvailability(friends_id) {
  const idToken = localStorage.getItem('token'); // previously stored Google ID token

  if (!idToken) {
    throw new Error('No auth token found. Please log in again.');
  }

  const res = await fetch(`${API_BASE}/friends-availability`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${idToken}`
    },
    payload: {
      friends_id: friends_id
    }
  });

  const freindsSchedule = await res.json();

  return freindsSchedule;
}

// New function to check available time slots for a specific date
export async function checkAvailability(date, friendId = null) {
  const idToken = localStorage.getItem('token');

  if (!idToken) {
    throw new Error('No auth token found. Please log in again.');
  }

  try {
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    const url = friendId
      ? `${API_BASE}/check-availability?date=${formattedDate}&friend_id=${friendId}`
      : `${API_BASE}/check-availability?date=${formattedDate}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${idToken}`
      }
    });

    if (!res.ok) {
      throw new Error('Failed to fetch availability');
    }

    // For now, simulate response with available time slots
    // This would normally come from the API response
    const timeSlots = [];

    // Generate time slots from 9 AM to 6 PM
    for (let hour = 9; hour <= 17; hour++) {
      const formattedHour = hour.toString().padStart(2, '0');
      // Generate random availability (for demo purposes)
      const isAvailable = Math.random() > 0.3;

      timeSlots.push({
        time: `${formattedHour}:00`,
        available: isAvailable
      });
    }

    return timeSlots;
  } catch (error) {
    console.error('Error checking availability:', error);
    throw error;
  }
}

// New function to book a meeting
export async function bookMeeting(meetingDetails) {
  const idToken = localStorage.getItem('token');

  if (!idToken) {
    throw new Error('No auth token found. Please log in again.');
  }

  try {
    const res = await fetch(`${API_BASE}/book-meeting`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(meetingDetails)
    });

    if (!res.ok) {
      throw new Error('Failed to book meeting');
    }

    return await res.json();
  } catch (error) {
    console.error('Error booking meeting:', error);
    throw error;
  }
}

export async function getUser() {
  // Sample user data
  const user = {
    name: 'Jamie Smith',
    email: 'jamie.smith@example.com',
    avatar: 'JS'
  };

  return user;
}

export async function getFriends() {
  const friends = [
    { id: 1, name: 'Alex Smith' },
    { id: 2, name: 'Taylor Kim' },
    { id: 3, name: 'Jordan Park' }
  ];

  return friends;
}

// for available friends
export async function getSuggestedFriends(quantity = 5) {
  // gets suggested freinds based on freinds of freinds
  // Sample available users to add as friends
  const availableFriends = [
    { id: 4, name: 'Robin Chen', email: 'robin.chen@example.com' },
    { id: 5, name: 'Morgan Lee', email: 'morgan.lee@example.com' },
    { id: 6, name: 'Casey Taylor', email: 'casey.taylor@example.com' }
  ];

  return availableFriends;
}

export async function acceptFriendRequest(friendID) {
  // Implementation
}

export async function sendMeetingRequest(meetingObj) {
  // Implementation
}
