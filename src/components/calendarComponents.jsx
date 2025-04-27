import { ChevronLeft, ChevronRight, Clock, X, User, MapPin, Plus, Search } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

// Calendar Header Component
export const CalendarHeader = ({ currentMonth, prevMonth, nextMonth, handleCreateEvent }) => {
  const formatMonth = date => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="calendar-header">
      <div className="calendar-title">
        My Calendar - {formatMonth(currentMonth)}
      </div>
      <div className="calendar-actions">
        <button className="create-event-btn" onClick={handleCreateEvent}>
          <Plus size={16} /> Create Event
        </button>
        <div className="calendar-nav">
          <div className="calendar-nav-btn" onClick={prevMonth}>
            <ChevronLeft size={18} />
          </div>
          <div className="calendar-nav-btn" onClick={nextMonth}>
            <ChevronRight size={18} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Calendar Day Component
export const CalendarDay = ({ day, isToday, selectedDate, handleDayClick, openPopoverId, setOpenPopoverId }) => {
  const isSelected = day.date && selectedDate && day.date.toDateString() === selectedDate.toDateString();
  const hasEvents = day.events.length > 0;

  // Prevent clicking on past dates
  let isPast = false;
  if (day.date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    isPast = day.date < today;
  }

  // Only show first two events in the tile
  const eventsToShow = day.events.slice(0, 2);
  const moreCount = day.events.length - 2;

  // Popover logic
  const dayRef = useRef(null);
  const popoverRef = useRef(null);
  const isPopoverOpen = openPopoverId === (day.date ? day.date.toDateString() : null);

  // Close popover on click outside
  useEffect(() => {
    if (!isPopoverOpen) return;
    function handleClick(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target) &&
          dayRef.current && !dayRef.current.contains(e.target)) {
        setOpenPopoverId(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isPopoverOpen, setOpenPopoverId]);

  // Position popover next to the day tile
  useEffect(() => {
    if (isPopoverOpen && dayRef.current && popoverRef.current) {
      const dayRect = dayRef.current.getBoundingClientRect();
      const popoverRect = popoverRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      
      // Default position is to the right of the day tile
      let left = dayRect.right + 10;
      let top = dayRect.top;
      
      // If popover would go off the right side of the screen, position it to the left
      if (left + popoverRect.width > viewportWidth - 20) {
        left = dayRect.left - popoverRect.width - 10;
      }
      
      // If popover would go off the bottom, adjust top position
      const viewportHeight = window.innerHeight;
      if (top + popoverRect.height > viewportHeight - 20) {
        top = viewportHeight - popoverRect.height - 20;
      }
      
      // If would go off the top, adjust top position
      if (top < 20) {
        top = 20;
      }
      
      // Apply position
      popoverRef.current.style.position = 'fixed';
      popoverRef.current.style.left = `${left}px`;
      popoverRef.current.style.top = `${top}px`;
      popoverRef.current.style.transform = 'none';
    }
  }, [isPopoverOpen]);

  return (
    <div
      ref={dayRef}
      className={`calendar-day${day.date && isToday(day.date) ? ' today' : ''}${hasEvents ? ' has-event' : ''}${isSelected ? ' selected' : ''}${isPast ? ' past' : ''}`}
      style={{
        visibility: day.date ? 'visible' : 'hidden',
        cursor: day.date && !isPast ? 'pointer' : 'not-allowed',
        pointerEvents: day.date && !isPast ? 'auto' : 'none',
        opacity: isPast ? 0.5 : 1,
        position: 'relative'
      }}
      onClick={e => {
        if (day.date && !isPast) {
          // If clicking the "more" or event, open popover, else handle day click
          if (hasEvents && (
            e.target.closest('.day-event') || 
            e.target.closest('.more-events')
          )) {
            setOpenPopoverId(day.date.toDateString());
          } else {
            handleDayClick(day);
          }
        }
      }}
    >
      {day.date && (
        <>
          <div className="day-number">{day.date.getDate()}</div>
          <div className="day-events-container">
            {/* Show only first two events */}
            {eventsToShow.map((event, idx) => (
              <div key={`${event.id || idx}`} className="day-event">
                <div className="font-medium">{event.title}</div>
                <div className="text-xs">{event.time}</div>
              </div>
            ))}
            {/* Show +N more if more than 2 events */}
            {moreCount > 0 && (
              <div className="day-event more-events">+{moreCount} more</div>
            )}
          </div>
          
          {/* Popover with all events for the day - now rendered in a portal outside the tile */}
          {isPopoverOpen && (
            <div className="day-events-popover" ref={popoverRef}>
              <div className="popover-title">Events for {day.date.toLocaleDateString()}</div>
              <button className="popover-close-btn" onClick={e => { e.stopPropagation(); setOpenPopoverId(null); }}>&times;</button>
              {day.events.length > 0 ? (
                day.events.map((event, idx) => (
                  <div key={event.id || idx} className="popover-event">
                    <div className="popover-event-title">{event.title}</div>
                    <div className="popover-event-detail">
                      <span>{event.time}</span>
                      {event.venue && <span> | {event.venue}</span>}
                    </div>
                    {event.description && (
                      <div className="popover-event-desc">{event.description}</div>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-events">No events scheduled</div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Calendar Grid Component
export const CalendarGrid = ({ days, isToday, selectedDate, handleDayClick }) => {
  const [openPopoverId, setOpenPopoverId] = useState(null);
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="calendar-grid">
      {/* Days of week */}
      {weekdays.map(day => (
        <div key={day} className="calendar-day-header">
          {day}
        </div>
      ))}

      {/* Calendar days */}
      {days.map((day, index) => (
        <CalendarDay 
          key={index} 
          day={day} 
          isToday={isToday} 
          selectedDate={selectedDate} 
          handleDayClick={handleDayClick}
          openPopoverId={openPopoverId}
          setOpenPopoverId={setOpenPopoverId}
        />
      ))}
    </div>
  );
};

// Time Options Component
export const TimeOptions = ({ newEvent, handleEventFormChange, events, selectedDate }) => {
  // Find booked times for the selected date
  let bookedTimes = [];
  if (selectedDate && events) {
    const formattedDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    bookedTimes = events
      .filter(event => event.date === formattedDate)
      .map(event => event.time);
  }

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        options.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    return options;
  };

  return (
    <select
      className="form-select"
      id="time"
      name="time"
      value={newEvent.time}
      onChange={handleEventFormChange}
      required
    >
      {generateTimeOptions().map(time => (
        <option key={time} value={time} disabled={bookedTimes.includes(time)}>
          {time} {bookedTimes.includes(time) ? '(Booked)' : ''}
        </option>
      ))}
    </select>
  );
};

// Guest Search Component
export const GuestSearch = ({ searchQuery, setSearchQuery, searchResults, isSearching, handleAddGuest, newEvent, handleRemoveGuest, currentUser }) => {
  return (
    <div className="guest-search-container">
      <div className="search-input-container">
        <Search size={16} className="search-icon" />
        <input
          className="form-input search-input"
          type="text"
          placeholder="Search for guests..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      {/* Search Results */}
      {searchQuery.length >= 2 && (
        <div className="search-results-dropdown">
          {isSearching ? (
            <div className="search-loading">Searching...</div>
          ) : searchResults.length > 0 ? (
            <div className="search-results-list">
              {searchResults.map(user => {
                const isCurrentUser = currentUser && (user.id === currentUser.id || user.email === currentUser.email);
                return (
                  <div
                    key={user.id}
                    className={`search-result-item${isCurrentUser ? ' current-user-unselectable' : ''}`}
                    onClick={() => {
                      if (!isCurrentUser) handleAddGuest(user);
                    }}
                    style={isCurrentUser ? { opacity: 0.5, pointerEvents: 'none', filter: 'blur(1px)' } : {}}
                  >
                    <div className="user-avatar-small">
                      <User size={14} />
                    </div>
                    <div className="search-user-info">
                      <div className="search-user-name">{user.name}</div>
                      <div className="search-user-email">{user.email}</div>
                      {isCurrentUser && <span className="current-user-label">(You)</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-results">No users found</div>
          )}
        </div>
      )}
      {/* Selected Guests */}
      {newEvent.guests.length > 0 && (
        <div className="selected-guests">
          {newEvent.guests.map(guest => (
            <div key={guest.id} className="guest-chip">
              <span className="guest-name">{guest.name}</span>
              <X 
                size={14} 
                className="remove-guest" 
                onClick={() => handleRemoveGuest(guest.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Event Form Component
export const EventForm = ({ 
  showEventForm, 
  setShowEventForm, 
  newEvent, 
  handleEventFormChange, 
  handleEventSubmit,
  searchQuery,
  setSearchQuery,
  searchResults,
  isSearching,
  handleAddGuest,
  handleRemoveGuest,
  events,
  selectedDate,
  currentUser
}) => {
  return (
    <div className="event-modal">
      <div className="event-modal-content">
        <div className="event-modal-header">
          <div className="event-modal-title">Create New Event</div>
          <div className="event-modal-close" onClick={() => setShowEventForm(false)}>
            <X size={18} />
          </div>
        </div>
        <form onSubmit={handleEventSubmit} className="event-form">
          <div className="form-row">
            <label className="form-label" htmlFor="title">
              Event Title *
            </label>
            <input
              className="form-input"
              type="text"
              id="title"
              name="title"
              value={newEvent.title}
              onChange={handleEventFormChange}
              placeholder="Add title"
              required
            />
          </div>
          <div className="form-row form-row-inline">
            <div className="form-col">
              <label className="form-label" htmlFor="date">
                Date *
              </label>
              <input
                className="form-input"
                type="date"
                id="date"
                name="date"
                value={newEvent.date}
                onChange={handleEventFormChange}
                required
              />
            </div>
            <div className="form-col">
              <label className="form-label" htmlFor="time">
                Time *
              </label>
              <TimeOptions 
                newEvent={newEvent} 
                handleEventFormChange={handleEventFormChange}
                events={events}
                selectedDate={selectedDate}
              />
            </div>
          </div>
          <div className="form-row">
            <label className="form-label" htmlFor="description">
              Description
            </label>
            <textarea
              className="form-textarea"
              id="description"
              name="description"
              value={newEvent.description}
              onChange={handleEventFormChange}
              placeholder="Add description"
              rows="3"
            />
          </div>
          <div className="form-row">
            <label className="form-label">Add Guests</label>
            <GuestSearch 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchResults={searchResults}
              isSearching={isSearching}
              handleAddGuest={handleAddGuest}
              newEvent={newEvent}
              handleRemoveGuest={handleRemoveGuest}
              currentUser={currentUser}
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
                  checked={newEvent.meetingType === 'online'}
                  onChange={handleEventFormChange}
                />
                Online
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="meetingType"
                  value="offline"
                  checked={newEvent.meetingType === 'offline'}
                  onChange={handleEventFormChange}
                />
                In Person
              </label>
            </div>
          </div>
          <div className="form-row">
            <label className="form-label" htmlFor="location">
              {newEvent.meetingType === 'online' ? 'Add Video Conferencing' : 'Location'}
            </label>
            <input
              className="form-input"
              type="text"
              id="location"
              name="location"
              value={newEvent.location}
              onChange={handleEventFormChange}
              placeholder={newEvent.meetingType === 'online' ? 'Add Zoom/Google Meet link' : 'Add location'}
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => setShowEventForm(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-confirm">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 