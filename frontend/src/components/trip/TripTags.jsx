import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../../styles/TripTags.css';
import { encode } from 'html-entities';
import HelpTooltip from '../HelpTooltip.jsx';

// Predefined list of available tags
export const AVAILABLE_TAGS = [
  'Beach', 'Mountain', 'City', 'Adventure', 'Relaxation',
  'Family', 'Solo', 'Romantic', 'Business', 'Cultural',
  'Food', 'Nature', 'Shopping', 'Historical', 'Nightlife'
];

const TripTags = ({ tripId, isInvitee }) => {
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    fetchTags();
  }, [tripId]);

  const fetchTags = async () => {
    try {
      const res = await fetch(`/CSE442/2025-Spring/cse-442aj/backend/api/trips/getTripTags.php?trip_id=${tripId}`);
      const data = await res.json();
      if (data.success) {
        setSelectedTags(data.tags);
      }
    } catch (err) {
      console.error('Failed to fetch tags:', err);
    }
  };

  const handleTagToggle = async (tag) => {
    if (isInvitee) return;
    
    let updatedTags;
    if (selectedTags.includes(tag)) {
      updatedTags = selectedTags.filter(t => t !== tag);
    } else {
      updatedTags = [...selectedTags, tag];
    }

    try {
      const res = await fetch('/CSE442/2025-Spring/cse-442aj/backend/api/trips/updateTripTags.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trip_id: tripId,
          tags: updatedTags
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setSelectedTags(updatedTags);
      }
    } catch (err) {
      console.error('Failed to update tags:', err);
    }
  };

  const createRipple = (event) => {
    if (isInvitee) return;
    
    const button = event.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    const rect = button.getBoundingClientRect();
    
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.classList.add('ripple');

    const ripple = button.getElementsByClassName('ripple')[0];
    if (ripple) {
      ripple.remove();
    }

    button.appendChild(circle);
  };

  if (!tripId) return null;

  return (
    <div className="trip-tags">
      <div className="tags-header">
        <div className="tooltip-container">
          <HelpTooltip>
            Add tags to categorize your trip. <span className="tooltip-purple">Click to select or deselect</span> tags that match your interests. These tags help you discover trips from the community and find your past trips with matching experiences.
          </HelpTooltip>
          <h3>Tags</h3>
        </div>
      </div>

      <div className="tags-container">
        {AVAILABLE_TAGS.map((tag) => (
          <button
            key={tag}
            className={`tag-chip ${selectedTags.includes(tag) ? 'selected' : ''}`}
            onClick={(e) => {
              createRipple(e);
              handleTagToggle(tag);
            }}
            disabled={isInvitee}
          >
            {encode(tag)}
          </button>
        ))}
      </div>
    </div>
  );
};

TripTags.propTypes = {
  tripId: PropTypes.number,
  isInvitee: PropTypes.bool
};

export default TripTags; 