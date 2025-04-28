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
      "id": "event-id-1",
      "title": "Team Meeting",
      "meeting_status": "CONFIRMED",
      "user": "owner_id",
      "description": "Planning session",
      "date": "2025-05-01",
      "time": "10:00",
      "venue": "Conference Room A",
      "attendees": [
        "113252154208412852558",
        "115967835813635168125"
      ]
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
 * GET request to """/event-requests"""
 * This requests gets your event requests
 * Example Response:
 * listof({
      "id": "event-id-1",
      "title": "Team Meeting",
      "meeting_status": "CONFIRMED",
      "user": "owner_id",
      "description": "Planning session",
      "date": "2025-05-01",
      "time": "10:00",
      "venue": "Conference Room A",
      "attendees": [
        "113252154208412852558",
        "115967835813635168125"
      ]
    })
 */
export async function getMyEventRequests() {
  const idToken = localStorage.getItem('token');

  if (!idToken) {
    throw new Error('No auth token found. Please log in again.');
  }

  const res = await fetch(`${API_BASE}/event-requests`, {
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

/*
 * GET request to """/search-users"""
 * This request gets users that match the query param
 * Example Response:
 * [
      { id: 4, name: 'Robin Chen', email: 'robin.chen@example.com' },
      { id: 5, name: 'Morgan Lee', email: 'morgan.lee@example.com' },
      { id: 6, name: 'Casey Taylor', email: 'casey.taylor@example.com' }
 * ]
 */
export async function getSearchResults(query) {
  const idToken = localStorage.getItem('token');

  if (!idToken) {
    throw new Error('No auth token found. Please log in again.');
  }

  const res = await fetch(`${API_BASE}/search-users?query=${query}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${idToken}`
    }
  });

  const users = await res.json();

  return users;
}

/*
 * GET request to """/search-users"""
 * This request gets users that match the query param
 * Example Response:
 * [
      { id: 4, name: 'Robin Chen', email: 'robin.chen@example.com' },
      { id: 5, name: 'Morgan Lee', email: 'morgan.lee@example.com' },
      { id: 6, name: 'Casey Taylor', email: 'casey.taylor@example.com' }
 * ]
 */
export async function getConnectionRequests() {
  const idToken = localStorage.getItem('token');

  if (!idToken) {
    throw new Error('No auth token found. Please log in again.');
  }

  const res = await fetch(`${API_BASE}/friend-requests`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${idToken}`
    }
  });

  const connRequests = await res.json();

  return connRequests;
}

/*
 * POST request to /create-event
 * Creates a new event in the database
 * Example Body:
 * {
    "title": "Project Kickoff",
    "meeting_status": "SENT",
    "description": "Kickoff meeting for new project",
    "date": "2025-05-02",
    "time": "14:00",
    "venue": "Meeting Room B",
    "attendees": [
        "116044433818751372016",
        "112115853335709108858"
    ]
 * }
 */
export async function createEvent(eventData) {
  const idToken = localStorage.getItem('token');

  if (!idToken) {
    throw new Error('No auth token found. Please log in again.');
  }

  const res = await fetch(`${API_BASE}/create-event`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(eventData)
  });

  if (!res.ok) {
    throw new Error('Failed to create event');
  }

  return await res.json();
}

/*
 * POST request to "/add-friend-request"
 * Sends a friend request to a user
 * Example Body:
 * {
 *   "receiver_id": "user-id"
 * }
 * Example Response:
 * { "message": "Friend request sent" }
 */
export async function addFriendRequest(receiver_id) {
  const idToken = localStorage.getItem('token');
  if (!idToken) {
    throw new Error('No auth token found. Please log in again.');
  }
  const res = await fetch(`${API_BASE}/add-friend-request`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ receiver_id }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to send friend request');
  }
  return await res.json();
}

/*
 * DELETE request to "/remove-friend"
 * Removes a friend connection
 * Args: friend_id (string)
 * Example Response: { "message": "Friend removed" }
 */
export async function removeFriend(friend_id) {
  const idToken = localStorage.getItem('token');
  if (!idToken) throw new Error('No auth token found. Please log in again.');
  const res = await fetch(`${API_BASE}/remove-friend`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ friend_id }),
  });
  if (!res.ok) throw new Error('Failed to remove friend');
  return await res.json();
}

/*
 * DELETE request to "/cancel-friend-request"
 * Cancels a sent friend request
 * Args: receiver_id (string)
 * Example Response: { "message": "Friend request canceled" }
 */
export async function cancelFriendRequest(receiver_id) {
  const idToken = localStorage.getItem('token');
  if (!idToken) throw new Error('No auth token found. Please log in again.');
  const res = await fetch(`${API_BASE}/cancel-friend-request`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ receiver_id }),
  });
  if (!res.ok) throw new Error('Failed to cancel friend request');
  return await res.json();
}

/*
 * POST request to "/accept-friend-request"
 * Accepts a received friend request
 * Args: sender_id (string)
 * Example Response: { "message": "Friend request accepted" }
 */
export async function acceptFriendRequest(sender_id) {
  const idToken = localStorage.getItem('token');
  if (!idToken) throw new Error('No auth token found. Please log in again.');
  const res = await fetch(`${API_BASE}/accept-friend-request`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sender_id }),
  });
  if (!res.ok) throw new Error('Failed to accept friend request');
  return await res.json();
}

/*
 * DELETE request to "/reject-friend-request"
 * Rejects a received friend request
 * Args: sender_id (string)
 * Example Response: { "message": "Friend request rejected" }
 */
export async function rejectFriendRequest(sender_id) {
  const idToken = localStorage.getItem('token');
  if (!idToken) throw new Error('No auth token found. Please log in again.');
  const res = await fetch(`${API_BASE}/reject-friend-request`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sender_id }),
  });
  if (!res.ok) throw new Error('Failed to reject friend request');
  return await res.json();
}

/*
 * GET request to "/friend-status"
 * Gets the relationship status between current user and another user
 * Args: user_id (string) - passed as query parameter
 * Example Response: 
 * { 
 *   "status": "none" | "friend" | "request_sent" | "request_received"
 * }
 * where:
 * - "none": No relationship
 * - "friend": Users are already friends
 * - "request_sent": Current user sent a request to this user
 * - "request_received": This user sent a request to current user
 */
export async function getFriendStatus(user_id) {
  const idToken = localStorage.getItem('token');
  if (!idToken) throw new Error('No auth token found. Please log in again.');
  const res = await fetch(`${API_BASE}/friend-status?user_id=${user_id}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${idToken}`
    }
  });
  if (!res.ok) throw new Error('Failed to get friend status');
  return await res.json();
}

/*
 * GET request to "/user-info"
 * Gets user info by user ID
 * Args: user_id (string) - passed as query parameter
 * Example Response:
 * {
 *   id: "113252154208412852558",
 *   name: "Labhansh Timande",
 *   email: "labhansh@example.com",
 *   picture: "url"
 * }
 */
export async function getUserById(userId) {
  const idToken = localStorage.getItem('token');
  if (!idToken) throw new Error('No auth token found. Please log in again.');
  const res = await fetch(`${API_BASE}/user-info?user_id=${userId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${idToken}`
    }
  });
  if (!res.ok) throw new Error('Failed to fetch user info');
  return await res.json();
}

/*
 * GET request to "/event-attendees"
 * Gets the status of all attendees for a specific event
 * Args: event_id (string) - passed as query parameter
 * Example Response:
 * {
 *   "attendees": [
 *     {
 *       "user_id": "113252154208412852558",
 *       "status": "ACCEPTED",
 *       "user": {
 *         "id": "113252154208412852558",
 *         "name": "Labhansh Timande",
 *         "email": "labhansh@example.com",
 *         "picture": "url"
 *       }
 *     },
 *     {
 *       "user_id": "115967835813635168125",
 *       "status": "REQUESTED",
 *       "user": {
 *         "id": "115967835813635168125",
 *         "name": "Divyansh Singh",
 *         "email": "divyansh@example.com",
 *         "picture": "url"
 *       }
 *     }
 *   ]
 * }
 */
export async function getEventAttendeeStatus(eventId) {
  const idToken = localStorage.getItem('token');
  if (!idToken) throw new Error('No auth token found. Please log in again.');
  const res = await fetch(`${API_BASE}/event-attendees?event_id=${eventId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${idToken}`
    }
  });
  if (!res.ok) throw new Error('Failed to fetch event attendees');
  return await res.json();
}

/*
 * POST request to "/accept-event"
 * Accepts an event invitation (for attendees)
 * Args: event_id (string)
 * Example Response: { "message": "Event accepted" }
 */
export async function acceptEventRequest(eventId) {
  const idToken = localStorage.getItem('token');
  if (!idToken) throw new Error('No auth token found. Please log in again.');
  const res = await fetch(`${API_BASE}/accept-event`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ event_id: eventId }),
  });
  if (!res.ok) throw new Error('Failed to accept event');
  return await res.json();
}

/*
 * POST request to "/reject-event"
 * Rejects an event invitation (for attendees)
 * Args: event_id (string)
 * Example Response: { "message": "Event rejected" }
 */
export async function rejectEventRequest(eventId) {
  const idToken = localStorage.getItem('token');
  if (!idToken) throw new Error('No auth token found. Please log in again.');
  const res = await fetch(`${API_BASE}/reject-event`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ event_id: eventId }),
  });
  if (!res.ok) throw new Error('Failed to reject event');
  return await res.json();
}

/*
 * POST request to "/confirm-event"
 * Confirms an event that was previously sent (for event creators)
 * Args: event_id (string)
 * Example Response: { "message": "Event confirmed" }
 */
export async function confirmEvent(eventId) {
  const idToken = localStorage.getItem('token');
  if (!idToken) throw new Error('No auth token found. Please log in again.');
  const res = await fetch(`${API_BASE}/confirm-event`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ event_id: eventId }),
  });
  if (!res.ok) throw new Error('Failed to confirm event');
  return await res.json();
}

/*
 * POST request to "/cancel-event"
 * Cancels an event (for event creators)
 * Args: event_id (string)
 * Example Response: { "message": "Event canceled" }
 */
export async function cancelEvent(eventId) {
  const idToken = localStorage.getItem('token');
  if (!idToken) throw new Error('No auth token found. Please log in again.');
  const res = await fetch(`${API_BASE}/cancel-event`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ event_id: eventId }),
  });
  if (!res.ok) throw new Error('Failed to cancel event');
  return await res.json();
}