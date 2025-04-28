import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register the required chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const AttendeeStatusChart = ({ attendees }) => {
  // Count attendees by status
  const statusCounts = attendees.reduce((acc, attendee) => {
    const status = attendee.status || 'REQUESTED';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  // Prepare data for the pie chart
  const data = {
    labels: ['Accepted', 'Rejected', 'Pending'],
    datasets: [
      {
        data: [
          statusCounts.ACCEPTED || 0,
          statusCounts.REJECTED || 0,
          statusCounts.REQUESTED || 0,
        ],
        backgroundColor: [
          'rgba(75, 192, 120, 0.8)',  // Green for accepted
          'rgba(255, 99, 132, 0.8)',   // Red for rejected
          'rgba(255, 205, 86, 0.8)',   // Yellow for pending
        ],
        borderColor: [
          'rgba(75, 192, 120, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 205, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 1000,
      easing: 'easeOutQuart',
    },
  };

  // Don't render chart if no attendees or all counts are 0
  const totalAttendees = attendees.length;
  if (totalAttendees === 0) {
    return (
      <div className="chart-container empty-chart">
        <p>No attendees for this event</p>
      </div>
    );
  }

  return (
    <div className="chart-container" style={{ height: '200px', width: '100%', marginBottom: '20px' }}>
      <Pie data={data} options={options} />
    </div>
  );
};

export default AttendeeStatusChart;