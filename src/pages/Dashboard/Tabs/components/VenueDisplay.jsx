import { Link, ExternalLink, MapPin } from 'lucide-react';

// Function to check if a string is a URL
const isURL = (str) => {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
};

// Function to check if a string might be a location that should open in Google Maps
const isLocation = (str) => {
  if (!str || str.trim() === '' || isURL(str)) return false;
  return str.length > 3 && !str.includes('@') && !/^\d+$/.test(str);
};

function VenueDisplay({ venue }) {
  if (!venue) return null;

  if (isURL(venue)) {
    return (
      <div className="venue-link">
        <b><Link size={16} className="icon-margin-right" /> Location:</b>
        <a 
          href={venue} 
          target="_blank" 
          rel="noopener noreferrer"
          className="venue-url"
          onClick={(e) => e.stopPropagation()}
        >
          {venue} <ExternalLink size={14} />
        </a>
      </div>
    );
  }

  if (isLocation(venue)) {
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue)}`;
    return (
      <div className="venue-link">
        <b><MapPin size={16} className="icon-margin-right" /> Location:</b>
        <a 
          href={mapUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="venue-url"
          onClick={(e) => e.stopPropagation()}
        >
          {venue} <ExternalLink size={14} />
        </a>
      </div>
    );
  }

  return <div><b><MapPin size={16} className="icon-margin-right" /> Location:</b> {venue}</div>;
}

export default VenueDisplay; 