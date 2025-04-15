import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, X, User, MapPin } from 'lucide-react';
import { getFriendsAvailability, getMyEvents, bookMeeting, checkAvailability } from '../services/api';
import '../pages/styles/Calendar.css';

export default function Calendar({ isCalendarTab = false, isOwnCalendar = true, friendObj = null }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New state for time slot selection and meeting form
  const [selectedDate, setSelectedDate] = useState(null);
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [meetingDetails, setMeetingDetails] = useState({
    title: '',
    attendees: 1,
    location: '',
    meetingType: 'online'
  });

  // Fetch events based on calendar type
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        // Different endpoint/data based on whether viewing own or friend's calendar
        let data;
        if (isOwnCalendar) {
          data = await getMyEvents();
        } else if (friendObj) {
          data = await getFriendsAvailability(friendObj.id);
        }
        
        setEvents(data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [isOwnCalendar, friendObj, currentMonth]);

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

  // Format month
  const formatMonth = date => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  // Format date
  const formatDate = date => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  // Days of the week
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

  // Generate time slots from 9 AM to 6 PM
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      const formattedHour = hour > 12 ? (hour - 12) : hour;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      slots.push({
        time: `${formattedHour}:00 ${ampm}`,
        available: Math.random() > 0.3 // Random availability for demo purposes
      });
    }
    return slots;
  };

  // Handler for when a day is clicked
  const handleDayClick = (day) => {
    // Always highlight the selected day
    setSelectedDate(day.date);
    
    // Only open time slots if not in calendar tab, there's a date, and not viewing own calendar
    if (!isCalendarTab && day.date && !isOwnCalendar) {
      // Don't open time slots for past dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (day.date >= today) {
        setShowTimeSlots(true);
      }
    }
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (timeSlot) => {
    if (!timeSlot.available) return;
    
    setSelectedTimeSlot(timeSlot.time);
    setShowTimeSlots(false);
    setShowMeetingForm(true);
  };

  // Handle meeting form changes
  const handleMeetingFormChange = (e) => {
    const { name, value } = e.target;
    setMeetingDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle meeting form submission
  const handleMeetingSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Format date for API
      const formattedDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
      
      const meetingData = {
        ...meetingDetails,
        date: formattedDate,
        time: selectedTimeSlot,
        friend_id: !isOwnCalendar && friendObj ? friendObj.id : null
      };
      
      await bookMeeting(meetingData);
      
      // Refresh events
      const data = isOwnCalendar ? 
        await getMyEvents() : 
        await getFriendsAvailability(friendObj.id);
      
      setEvents(data || []);
      
      // Close form and reset
      setShowMeetingForm(false);
      setSelectedDate(null);
      setSelectedTimeSlot(null);
      setMeetingDetails({
        title: '',
        attendees: 1,
        location: '',
        meetingType: 'online'
      });
      
    } catch (error) {
      console.error('Error booking meeting:', error);
      // Handle error - could add state for error message
    }
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div className="calendar-title">
          {isOwnCalendar ? "My Calendar" : `${friendObj?.name}'s Availability`} - {formatMonth(currentMonth)}
        </div>
        <div className="calendar-nav">
          <div className="calendar-nav-btn" onClick={prevMonth}>
            <ChevronLeft size={18} />
          </div>
          <div className="calendar-nav-btn" onClick={nextMonth}>
            <ChevronRight size={18} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-8">Loading calendar...</div>
      ) : (
        <div className="calendar-grid">
          {/* Days of week */}
          {weekdays.map(day => (
            <div key={day} className="calendar-day-header">
              {day}
            </div>
          ))}

          {/* Calendar days - Apply consistent styling across tabs */}
          {days.map((day, index) => (
            <div
              key={index}
              className={`calendar-day ${day.date && isToday(day.date) ? 'today' : ''} ${day.events.length > 0 ? 'has-event' : ''} ${day.date && selectedDate && day.date.toDateString() === selectedDate.toDateString() ? 'selected' : ''}`}
              style={{ 
                visibility: day.date ? 'visible' : 'hidden',
                cursor: day.date ? 'pointer' : 'default'
              }}
              onClick={() => handleDayClick(day)}
            >
              {day.date && (
                <>
                  <div className="day-number">{day.date.getDate()}</div>
                  {/* Show events consistently across tabs */}
                  {day.events.map((event, idx) => (
                    <div key={`${event.id || idx}`} className="day-event">
                      <div className="font-medium">{event.title}</div>
                      <div className="text-xs flex items-center gap-1">
                        <Clock size={12} />
                        {event.time}
                        {event.venue && (
                          <>
                            <MapPin size={12} />
                            {event.venue}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Time Slot Selection Modal - Only shown when not viewing own calendar and in Schedule Meet tab */}
      {!isCalendarTab && !isOwnCalendar && showTimeSlots && selectedDate && (
        <div className="time-slot-modal">
          <div className="time-slot-content">
            <div className="time-slot-header">
              <div className="time-slot-title">Select a time on {formatDate(selectedDate)}</div>
              <div className="time-slot-close" onClick={() => setShowTimeSlots(false)}>
                <X size={18} />
              </div>
            </div>
            <div className="time-slots-container">
              {generateTimeSlots().map((slot, index) => (
                <div
                  key={index}
                  className={`time-slot ${!slot.available ? 'unavailable' : ''} ${selectedTimeSlot === slot.time ? 'selected' : ''}`}
                  onClick={() => handleTimeSlotSelect(slot)}
                >
                  {slot.time}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Meeting Booking Form Modal - Only shown when not viewing own calendar and in Schedule Meet tab */}
      {!isCalendarTab && !isOwnCalendar && showMeetingForm && selectedDate && selectedTimeSlot && (
        <div className="meeting-form-modal">
          <div className="meeting-form-content">
            <div className="meeting-form-header">
              <div className="meeting-form-title">Book a Meeting</div>
              <div className="meeting-form-date">
                {formatDate(selectedDate)} at {selectedTimeSlot}
              </div>
            </div>
            
            <form onSubmit={handleMeetingSubmit}>
              <div className="form-row">
                <label className="form-label" htmlFor="title">Meeting Title</label>
                <input
                  className="form-input"
                  type="text"
                  id="title"
                  name="title"
                  value={meetingDetails.title}
                  onChange={handleMeetingFormChange}
                  placeholder="What's this meeting about?"
                  required
                />
              </div>
              
              <div className="form-row">
                <label className="form-label" htmlFor="attendees">Number of Attendees</label>
                <input
                  className="form-input"
                  type="number"
                  id="attendees"
                  name="attendees"
                  min="1"
                  value={meetingDetails.attendees}
                  onChange={handleMeetingFormChange}
                  required
                />
              </div>
              
              <div className="form-row">
                <label className="form-label">Meeting Type</label>
                <div className="radio-group">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="meetingType"
                      value="online"
                      checked={meetingDetails.meetingType === 'online'}
                      onChange={handleMeetingFormChange}
                    />
                    Online
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="meetingType"
                      value="offline"
                      checked={meetingDetails.meetingType === 'offline'}
                      onChange={handleMeetingFormChange}
                    />
                    In Person
                  </label>
                </div>
              </div>
              
              <div className="form-row">
                <label className="form-label" htmlFor="location">
                  {meetingDetails.meetingType === 'online' ? 'Meeting Link' : 'Location'}
                </label>
                <input
                  className="form-input"
                  type="text"
                  id="location"
                  name="location"
                  value={meetingDetails.location}
                  onChange={handleMeetingFormChange}
                  placeholder={meetingDetails.meetingType === 'online' ? 'Zoom/Teams link' : 'Address or room number'}
                />
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => setShowMeetingForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-confirm">
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}