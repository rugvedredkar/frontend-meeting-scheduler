const API_BASE = 'http://10.4.211.240:8080'; // Change this if you're deployed

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

  const idToken = localStorage.getItem("token"); // previously stored Google ID token

  if (!idToken) {
    throw new Error("No auth token found. Please log in again.");
  }

  const res = await fetch(`${API_BASE}/events`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${idToken}`
    }
  });

  if (!res.ok) {
    throw new Error("Failed to fetch protected data");
  }

  const {events : resObj } = await res.json();

  console.log(resObj);
  
  return resObj;
}

export async function getFriendsAvailability(friends_id){


  const idToken = localStorage.getItem("token"); // previously stored Google ID token

  if (!idToken) {
    throw new Error("No auth token found. Please log in again.");
  }

  const res = await fetch(`${API_BASE}/friends-availability`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${idToken}`
    },
    payload: {
      friends_id: friends_id
    }
  });

  return [
      {
          "date": "2025-04-16",
          "id": "c756e17c-35f1-46ed-9485-71f9645afe0d",
          "time": "10:00"
      },
      {
          "date": "2025-04-17",
          "id": "0693a73f-5c67-45b0-86fa-57ec482906ae",
          "time": "15:00"
      }
  ]
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
export async function getSuggestedFriends(quantity=5) {
  // gets suggested freinds based on freinds of freinds
  // Sample available users to add as friends
  const availableFriends = [
    { id: 4, name: 'Robin Chen', email: 'robin.chen@example.com' },
    { id: 5, name: 'Morgan Lee', email: 'morgan.lee@example.com' },
    { id: 6, name: 'Casey Taylor', email: 'casey.taylor@example.com' }
  ];

  return availableFriends;
}


export async function acceptFriendRequest(friendID){

}

export async function sendMeetingRequest (meetingObj){

}


