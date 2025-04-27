import React, { useState, useEffect, useRef } from 'react';

const Calendar = ({ events, onAddEvent, onEditEvent, onDeleteEvent }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const calendarRef = useRef(null);
  
  useEffect(() => {
    function handleClickOutside(event) {
      if (selectedDay && 
          calendarRef.current && 
          !calendarRef.current.contains(event.target)) {
        setSelectedDay(null);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedDay]);
  
  return (
    <div className="calendar-container" ref={calendarRef}>
      <div className="calendar-header">
        {/* ... existing code ... */}
      </div>
      
      {/* ... existing code ... */}
    </div>
  );
};

export default Calendar; 