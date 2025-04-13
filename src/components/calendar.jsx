import { useState } from "react";
import {
    ChevronLeft,
    ChevronRight,
  } from "lucide-react";

export default function Calendar () {


    const [viewingOwnCalendar, setViewingOwnCalendar] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Get days for calendar
    const getDaysInMonth = (date) => {
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

        // Add some sample events based on whether viewing own calendar or friend's
        const events = [];
        if (viewingOwnCalendar) {
            if (i === 8 || i === 15 || i === 22) {
            events.push({ title: "Team Meeting", time: "09:00 AM" });
            }
            if (i === 10 || i === 24) {
            events.push({ title: "Client Call", time: "02:30 PM" });
            }
        } else {
            if (i === 10 || i === 15 || i === 22) {
            events.push({ title: "Meeting", time: "10:00 AM" });
            }
            if (i === 5 || i === 20) {
            events.push({ title: "Lunch", time: "12:30 PM" });
            }
        }

        daysInMonth.push({
            date: currentDate,
            events: events,
        });
        }

        return daysInMonth;
    };

    const days = getDaysInMonth(currentMonth);

    // Navigation
    const nextMonth = () => {
        setCurrentMonth(
        (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
        );
    };

    const prevMonth = () => {
        setCurrentMonth(
        (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
        );
    };

    // Format month
    const formatMonth = (date) => {
        return new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
        }).format(date);
    };

    // Days of the week
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Check if a date is today
    const isToday = (date) => {
        if (!date) return false;
        const today = new Date();
        return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
        );
    };

    return (
        <>
            <div className="calendar-container">
                <div className="calendar-header">
                <div className="calendar-title">
                    My Calendar - {formatMonth(currentMonth)}
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

                <div className="calendar-grid">
                {/* Days of week */}
                {weekdays.map((day) => (
                    <div key={day} className="calendar-day-header">
                    {day}
                    </div>
                ))}

                {/* Calendar days */}
                {days.map((day, index) => (
                    <div
                    key={index}
                    className={`calendar-day ${day.date && isToday(day.date) ? "today" : ""} ${day.events.length > 0 ? "has-event" : ""}`}
                    style={{ visibility: day.date ? "visible" : "hidden" }}
                    >
                    {day.date && (
                        <>
                        <div className="day-number">
                            {day.date.getDate()}
                        </div>
                        {day.events.map((event, i) => (
                            <div key={i} className="day-event">
                            {event.title} • {event.time}
                            </div>
                        ))}
                        </>
                    )}
                    </div>
                ))}
                </div>
            </div>
        </>
    )
}