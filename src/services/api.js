import { jwtDecode } from 'jwt-decode';
const API_BASE = 'http://10.0.0.243:8080'; // Change this if you're deployed

/*
 * Gets the user info
 */
export async function getUser() {
  const idToken = localStorage.getItem('token'); // Assuming you stored id_token after login

  if (idToken) {
    const userInfo = jwtDecode(idToken);
    console.log(userInfo);
    return userInfo;
  }
}

/*
 * POST request to """/login"""
 * This request verifies is the user exists in google session too
 * Example Response:
 * {
        "message": "Login successful",
        "user": {
            "name": "user's-name",
            "email": "user-email",
            "picture": "picture-url"
        },
        "virgin" : true // defines if user is new to the app
    }
 */
export async function verifyUser(idToken) {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id_token: idToken })
  });

  if (!res.ok) throw new Error('Login failed');
  return await res.json();
}

/*
 * GET request to """/events"""
 * This requests gets events for the logged in user
 * Example Response:
 * listof({
            'id': event_id,
            'title': title,
            'user': user_name,
            'description': desc,
            'date':data,
            'time':time,
            'venue':venue
        })
 */
export async function getMyEvents() {
  const idToken = localStorage.getItem('token');

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

  return resObj;
}

/* 
 * Get request to """/colleagues-availability"""
 * This request gets events of user with user_id == colleagues_id
 * Example Response: 
 * listof({
            'date': '2025-04-21',
            'id': 'bb10c35c-c28f-4d5a-980d-38cb109b8bd6',
            'time': '12:00'
          })
 * 
 */
export async function getColleaguesAvailability(colleagues_id) {
  const idToken = localStorage.getItem('token');

  if (!idToken) {
    throw new Error('No auth token found. Please log in again.');
  }

  const res = await fetch(`${API_BASE}/colleagues-availability?colleagues_id=${colleagues_id}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${idToken}`
    }
  });

  const colleaguesAvailability = await res.json();

  return colleaguesAvailability;
}

/*
 * GET request to """/friends"""
 * Gets connections of the logged in user
 * Example Response:
 * [
      { id: 4, name: 'Robin Chen', email: 'robin.chen@example.com' },
      { id: 5, name: 'Morgan Lee', email: 'morgan.lee@example.com' },
      { id: 6, name: 'Casey Taylor', email: 'casey.taylor@example.com' }
 * ]
 * 
 */
export async function getFriends() {
  const idToken = localStorage.getItem('token');

  if (!idToken) {
    throw new Error('No auth token found. Please log in again.');
  }

  const res = await fetch(`${API_BASE}/friends`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${idToken}`
    }
  });

  const connections = await res.json();

  return connections;
}

/*
 * GET request to """/recents"""
 * This request gets list of freinds that user recently booked events with
 * Example Response: 
 * [
      { id: 4, name: 'Robin Chen', email: 'robin.chen@example.com' },
      { id: 5, name: 'Morgan Lee', email: 'morgan.lee@example.com' },
      { id: 6, name: 'Casey Taylor', email: 'casey.taylor@example.com' }
 * ]
 * 
 */
export async function getRecents() {
  const idToken = localStorage.getItem('token');

  if (!idToken) {
    throw new Error('No auth token found. Please log in again.');
  }

  const res = await fetch(`${API_BASE}/recents`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${idToken}`
    }
  });

  const recents = await res.json();

  return recents;
}

/*
 * GET request to """/suggested-friends"""
 * This request gets quantity number of friends of friends
 * Example Response:
 * [
      { id: 4, name: 'Robin Chen', email: 'robin.chen@example.com' },
      { id: 5, name: 'Morgan Lee', email: 'morgan.lee@example.com' },
      { id: 6, name: 'Casey Taylor', email: 'casey.taylor@example.com' }
 * ]
 */
export async function getSuggestedFriends(quantity = 5) {
  const idToken = localStorage.getItem('token');

  if (!idToken) {
    throw new Error('No auth token found. Please log in again.');
  }

  const res = await fetch(`${API_BASE}/suggested-friends?quantity=${quantity}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${idToken}`
    }
  });

  const availableFriends = await res.json();

  return availableFriends;
}





// ---------------------------------
// THESE FUNCTIONS ARE NOT RIGHT
// ---------------------------------

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

// #################################
//          INCOMPLETE
// #################################
export async function acceptFriendRequest(friendID) {
  // Implementation
}

export async function sendMeetingRequest(meetingObj) {
  // Implementation
}
