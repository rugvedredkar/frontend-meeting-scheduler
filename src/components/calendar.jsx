import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { getFriendsAvailability, getMyEvents } from '../services/api';

export default function Calendar({ isOwnCalendar = true, friendObj = null }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch events based on calendar type
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        // Different endpoint/data based on whether viewing own or friend's calendar
        let data;
        if (isOwnCalendar) {
          const response = await getMyEvents();
          data = await response.json();
        } else if (friendObj) {
          const response = await getFriendsAvailability(friendObj.id);
          data = await response.json();
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

          {/* Calendar days */}
          {days.map((day, index) => (
            <div
              key={index}
              className={`calendar-day ${day.date && isToday(day.date) ? 'today' : ''} ${day.events.length > 0 ? 'has-event' : ''}`}
              style={{ visibility: day.date ? 'visible' : 'hidden' }}
            >
              {day.date && (
                <>
                  <div className="day-number">{day.date.getDate()}</div>
                  {day.events.map((event) => (
                    <div key={event.id} className="day-event">
                      {isOwnCalendar ? (
                        <>
                          <div className="font-medium">{event.title}</div>
                          <div className="text-xs flex items-center gap-1">
                            <Clock size={12} />
                            {event.time}
                            {event.venue && ` • ${event.venue}`}
                          </div>
                        </>
                      ) : (
                        // For friend's calendar, just show time slot as busy
                        <div className="text-xs flex items-center gap-1">
                          <Clock size={12} />
                          {event.time} - Busy
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}