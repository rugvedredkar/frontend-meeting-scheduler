import { useState, useEffect } from 'react';
import { getMyEvents, bookMeeting, getSearchResults, getUser, createEvent } from '../../../services/api.js'
import '../../styles/Calendar.css'
import { CalendarHeader, CalendarGrid, EventForm } from '../../../components/calendarComponents';

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Event creation state
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '09:00',
    guests: [],
    location: '',
    meetingType: 'online',
    description: ''
  });

  // Guest search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const data = await getMyEvents();
        
        setEvents(data.filter((event) => event.meeting_status !== 'CANCELED')|| []);
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [currentMonth]);

  // Fetch current user
  useEffect(() => {
    async function fetchUser() {
      const user = await getUser();
      setCurrentUser(user);
    }
    fetchUser();
  }, []);

  // Handle search input changes with debounce
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await getSearchResults(searchQuery);
        // Filter out already added guests
        const filteredResults = results.filter(
          user => !newEvent.guests.some(guest => guest.id === user.id)
        );
        setSearchResults(filteredResults);
      } catch (error) {
        console.error('Error searching users:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    setSearchTimeout(timeoutId);

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchQuery, newEvent.guests]);

  // Get days for calendar
  const getDaysInMonth = date => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const daysInMonth = [];

    // Add empty cells for days before the first day of the month
    const firstDayOfWeek = firstDay.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      daysInMonth.push({ date: null, events: [] });
    }

    // Add days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const currentDate = new Date(year, month, i);

      // Format the date to match the API format (YYYY-MM-DD)
      const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

      // Find events for this day
      const dayEvents = events.filter(event => event.date === formattedDate);

      daysInMonth.push({
        date: currentDate,
        events: dayEvents
      });
    }

    return daysInMonth;
  };

  const days = getDaysInMonth(currentMonth);

  // Navigation
  const nextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  // Check if a date is today
  const isToday = date => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Helper to get first available time
  const getFirstAvailableTime = (date, events) => {
    if (!date) return '09:00';
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const bookedTimes = events.filter(event => event.date === formattedDate).map(event => event.time);

    // First, try from 09:00 onwards
    for (let hour = 9; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        const time = `${formattedHour}:${formattedMinute}`;
        if (!bookedTimes.includes(time)) return time;
      }
    }
    // If all after 09:00 are booked, try the whole day
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        const time = `${formattedHour}:${formattedMinute}`;
        if (!bookedTimes.includes(time)) return time;
      }
    }
    return '';
  };

  // Handler for when a day is clicked
  const handleDayClick = day => {
    setSelectedDate(day.date);
    if (day.date) {
      // Format the date for the form
      const formattedDate = `${day.date.getFullYear()}-${String(day.date.getMonth() + 1).padStart(2, '0')}-${String(day.date.getDate()).padStart(2, '0')}`;
      setNewEvent(prev => ({
        ...prev,
        date: formattedDate,
        time: getFirstAvailableTime(day.date, events)
      }));
      setShowEventForm(true);
    }
  };

  // Handle opening the event creation form
  const handleCreateEvent = () => {
    // Set today's date as default
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setNewEvent(prev => ({
      ...prev,
      date: formattedDate,
      time: getFirstAvailableTime(today, events)
    }));
    setShowEventForm(true);
  };

  // Handle event form input changes
  const handleEventFormChange = e => {
    const { name, value } = e.target;
    setNewEvent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle adding a guest
  const handleAddGuest = user => {
    setNewEvent(prev => ({
      ...prev,
      guests: [...prev.guests, user]
    }));
    setSearchQuery('');
    setSearchResults([]);
  };

  // Handle removing a guest
  const handleRemoveGuest = userId => {
    setNewEvent(prev => ({
      ...prev,
      guests: prev.guests.filter(guest => guest.id !== userId)
    }));
  };

  // Handle event form submission
  const handleEventSubmit = async e => {
    e.preventDefault();
    
    try {
      // Prepare the event data for /create-event
      const eventData = {
        title: newEvent.title,
        meeting_status: 'SENT',
        description: newEvent.description,
        date: newEvent.date,
        time: newEvent.time,
        venue: newEvent.location,
        attendees: [
          currentUser?.sub,
          ...newEvent.guests.map(guest => guest.id || guest.sub)
        ].filter(Boolean)
      };
      await createEvent(eventData);
      setShowSuccess(true);
      // Refresh events
      const updatedEvents = await getMyEvents();
      setEvents(updatedEvents || []);
      // Close form and reset
      setShowEventForm(false);
      setNewEvent({
        title: '',
        date: '',
        time: '09:00',
        guests: [],
        location: '',
        meetingType: 'online',
        description: ''
      });
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  return (
    <div className="calendar-container">
      <CalendarHeader 
        currentMonth={currentMonth}
        prevMonth={prevMonth}
        nextMonth={nextMonth}
        handleCreateEvent={handleCreateEvent}
      />

      {loading ? (
        <div className="flex justify-center items-center p-8">Loading calendar...</div>
      ) : (
        <CalendarGrid 
          days={days}
          isToday={isToday}
          selectedDate={selectedDate}
          handleDayClick={handleDayClick}
        />
      )}

      {/* Event Creation Modal */}
      {showEventForm && (
        <EventForm 
          showEventForm={showEventForm}
          setShowEventForm={setShowEventForm}
          newEvent={newEvent}
          handleEventFormChange={handleEventFormChange}
          handleEventSubmit={handleEventSubmit}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          isSearching={isSearching}
          handleAddGuest={handleAddGuest}
          handleRemoveGuest={handleRemoveGuest}
          events={events}
          selectedDate={selectedDate}
          currentUser={currentUser}
        />
      )}
      {showSuccess && (
        <div className="event-success-popup">Event created successfully!</div>
      )}
    </div>
  );
}
