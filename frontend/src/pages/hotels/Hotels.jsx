// export default Hotels;
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import HotelCard from "../../components/hotel/HotelCard";
import "../../styles/hotels/Hotels.css";
import searchIcon from "../../assets/Search.png";
import calendarIcon from "../../assets/calendar.png";
import locationIcon from "../../assets/location.png";
import profileIcon from "../../assets/profile.png";
import bedIcon from "../../assets/bed.png";
import TravelersModal from "../../components/hotel/TravelersModal";
import {
  searchLocations,
  searchHotels,
  formatLocationName,
} from "../../services/hotelService";
import { encode } from "html-entities";

const Hotels = () => {
  // URL and Navigation State
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const initialSearchDone = useRef(false);

  const tripId = searchParams.get("tripId");
  const fromInvite = searchParams.get("fromInvite") === "true";

  console.log("In Hotels.jsx, tripId is", tripId);
  console.log("In Hotels.jsx, fromInvite is", fromInvite);

  // Search Form State
  const [locationQuery, setLocationQuery] = useState(
    searchParams.get("location") || ""
  );
  const [checkInDate, setCheckInDate] = useState(
    searchParams.get("checkIn") || ""
  );
  const [checkOutDate, setCheckOutDate] = useState(
    searchParams.get("checkOut") || ""
  );
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [error, setError] = useState(null);

  // Location Search State
  const [locationResults, setLocationResults] = useState([]);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [focusedLocationIndex, setFocusedLocationIndex] = useState(-1);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const locationInputRef = useRef(null);
  const locationDropdownRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Hotel Results State
  const [hotels, setHotels] = useState([]);
  const [hotelOffers, setHotelOffers] = useState({});
  const [isLoadingHotels, setIsLoadingHotels] = useState(false);
  const [isLoadingOffers, setIsLoadingOffers] = useState(false);

  // UI State
  const [sortOption, setSortOption] = useState("Distance");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [freeBreakfastOnly, setFreeBreakfastOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const hotelsPerPage = 20;

  // Traveler State
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  // Location Dropdown Handlers
  const handleLocationKeyDown = (e) => {
    if (!isLocationDropdownOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsLocationDropdownOpen(true);
        setFocusedLocationIndex(0);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        setFocusedLocationIndex((prev) =>
          prev < locationResults.length - 1 ? prev + 1 : prev
        );
        e.preventDefault();
        break;
      case "ArrowUp":
        setFocusedLocationIndex((prev) => (prev > 0 ? prev - 1 : -1));
        e.preventDefault();
        break;
      case "Enter":
        if (
          focusedLocationIndex >= 0 &&
          focusedLocationIndex < locationResults.length
        ) {
          handleLocationSelect(locationResults[focusedLocationIndex]);
        }
        e.preventDefault();
        break;
      case "Escape":
        setIsLocationDropdownOpen(false);
        setFocusedLocationIndex(-1);
        e.preventDefault();
        break;
      default:
        break;
    }
  };

  const handleLocationInputChange = (e) => {
    const value = e.target.value;
    setLocationQuery(value);
    setSelectedLocation(null);

    setHotels([]);
    setHotelOffers({});
    setError(null);

    setSearchParams((params) => {
      params.delete("location");
      return params;
    });

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.length < 3) {
      setLocationResults([]);
      setIsLocationDropdownOpen(false);
      setIsSearchingLocation(false);
      return;
    }

    setIsSearchingLocation(true);
    setIsLocationDropdownOpen(true);

    searchTimeoutRef.current = setTimeout(async () => {
      const results = await searchLocations(value);
      setLocationResults(results);
      setIsSearchingLocation(false);
    }, 500);
  };

  // Form Selection Handlers
  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setLocationQuery(location.name);
    setIsLocationDropdownOpen(false);
    setFocusedLocationIndex(-1);
    setLocationResults([]);

    setSearchParams((params) => {
      params.set("location", location.name);
      return params;
    });
  };

  const handleCheckInSelect = (checkIn) => {
    setCheckInDate(checkIn);
    setSearchParams((params) => {
      checkIn ? params.set("checkIn", checkIn) : params.delete("checkIn");
      return params;
    });
  };

  const handleCheckOutSelect = (checkOut) => {
    setCheckOutDate(checkOut);
    setSearchParams((params) => {
      checkOut ? params.set("checkOut", checkOut) : params.delete("checkOut");
      return params;
    });
  };

  // Hotel Search and Sorting
  const handleSearchHotels = async (locationOverride = null) => {
    const searchLocation = locationOverride || selectedLocation;

    setError(null);
    setHotels([]);
    setHotelOffers({});
    setIsLoadingHotels(true);
    setIsLoadingOffers(true);
    setCurrentPage(1);

    try {
      // Calculate adults per room - round up to ensure enough capacity
      const adultsPerRoom = Math.ceil(adults / rooms);

      const { hotels: hotelsList, offers: offersMap } = await searchHotels(
        searchLocation,
        checkInDate,
        checkOutDate,
        adultsPerRoom,
        rooms
      );

      setHotels(hotelsList);
      setHotelOffers(offersMap);

      //Update the trip dates to match check in/out:
      console.log("location being sent is: " + selectedLocation.name);
      fetch(
        `/CSE442/2025-Spring/cse-442aj/backend/api/trips/updateTripDates.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            city_name: selectedLocation.name,
            start_date: checkInDate || null,
            end_date: checkOutDate || null,
          }),
        }
      )


    } catch (err) {
      setError(err.message);
      console.error("Error searching hotels:", err);
    } finally {
      setIsLoadingHotels(false);
      setIsLoadingOffers(false);
    }
  };

  const handleSortSelection = (option) => {
    setSortOption(option);
    setIsDropdownOpen(false);
    setCurrentPage(1);
  };

  // Filter and Sort Logic
  const getFilteredAndSortedHotels = () => {
    let filtered = [...hotels];

    if (freeBreakfastOnly) {
      filtered = filtered.filter((hotel) => {
        const offer = hotelOffers[hotel.hotelId];
        return offer?.offers?.[0]?.boardType === "BREAKFAST";
      });
    }

    // Apply sorting
    if (sortOption === "Price (low to high)") {
      filtered.sort((a, b) => {
        const priceA = hotelOffers[a.hotelId]?.offers?.[0]?.price?.total || 0;
        const priceB = hotelOffers[b.hotelId]?.offers?.[0]?.price?.total || 0;
        return priceA - priceB;
      });
    } else if (sortOption === "Price (high to low)") {
      filtered.sort((a, b) => {
        const priceA = hotelOffers[a.hotelId]?.offers?.[0]?.price?.total || 0;
        const priceB = hotelOffers[b.hotelId]?.offers?.[0]?.price?.total || 0;
        return priceB - priceA;
      });
    } else if (sortOption === "Hotel class") {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortOption === "Distance") {
      filtered.sort((a, b) => {
        if (!a.distance?.value || !b.distance?.value) {
          return 0;
        }

        return a.distance.value - b.distance.value;
      });
    }

    return filtered;
  };

  // Close location dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(event.target) &&
        !locationInputRef.current.contains(event.target)
      ) {
        setIsLocationDropdownOpen(false);
        setFocusedLocationIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle initial search results passed through location state
  // This happens when navigating from another page with pre-fetched results (such as loading page)
  useEffect(() => {
    if (
      location.state?.location &&
      location.state?.searchResults &&
      !initialSearchDone.current
    ) {
      initialSearchDone.current = true;
      const { hotels: hotelsList, offers: offersMap } =
        location.state.searchResults;
      setHotels(hotelsList);
      setHotelOffers(offersMap);

      handleLocationSelect(location.state.location);
      handleCheckInSelect(location.state.checkIn);
      handleCheckOutSelect(location.state.checkOut);
      window.history.replaceState({}, document.title);
    } else if (location.state?.error) {
      setError(location.state.error);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Handle initial search results passed through search params
  // This happens when navigating from another page with pre-filled search parameters
  useEffect(() => {
    const locationParam = searchParams.get("location");
    const checkInParam = searchParams.get("checkIn");
    const checkOutParam = searchParams.get("checkOut");

    if (locationParam && !initialSearchDone.current) {
      initialSearchDone.current = true;

      if (checkInParam) setCheckInDate(checkInParam);
      if (checkOutParam) setCheckOutDate(checkOutParam);

      const performInitialSearch = async () => {
        const results = await searchLocations(locationParam);
        if (results.length > 0) {
          const exactMatch =
            results.find(
              (loc) => loc.name.toLowerCase() === locationParam.toLowerCase()
            ) || results[0];

          handleLocationSelect(exactMatch);

          if (checkInParam && checkOutParam) {
            handleSearchHotels(exactMatch);
          }
        }
      };

      performInitialSearch();
    }
  }, [searchParams]);

  // Pagination Logic
  const filteredHotels = getFilteredAndSortedHotels();
  const indexOfLastHotel = currentPage * hotelsPerPage;
  const indexOfFirstHotel = indexOfLastHotel - hotelsPerPage;
  const currentHotels = filteredHotels.slice(
    indexOfFirstHotel,
    indexOfLastHotel
  );

  // Render Components
  const renderLocationDropdown = () => (
    <div
      ref={locationDropdownRef}
      id="location-listbox"
      role="listbox"
      className="location-dropdown"
      aria-label="Location suggestions"
    >
      {isSearchingLocation ? (
        <div className="location-loading">
          <div className="loading-dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </div>
      ) : locationResults.length > 0 ? (
        locationResults.map((location, index) => (
          <div
            id={`location-option-${index}`}
            key={location.iataCode}
            role="option"
            aria-selected={focusedLocationIndex === index}
            className={`location-option ${
              focusedLocationIndex === index ? "focused" : ""
            }`}
            onClick={() => handleLocationSelect(location)}
            onMouseEnter={() => setFocusedLocationIndex(index)}
          >
            <div className="location-name">
              {formatLocationName(location.name)}
            </div>
            <div className="location-details">
              {location.address?.stateCode || location.stateCode}
            </div>
          </div>
        ))
      ) : locationQuery.length >= 3 ? (
        <div className="location-no-results">No locations found</div>
      ) : (
        <div className="location-hint">
          Enter at least 3 characters to search
        </div>
      )}
    </div>
  );

  const renderSearchBar = () => (
    <div className="search-bar">
      <div className="input-wrapper">
        <label htmlFor="location-input">Where</label>
        <div className="input-container">
          <img
            src={locationIcon}
            alt=""
            className="input-icon"
            aria-hidden="true"
          />
          <input
            id="location-input"
            ref={locationInputRef}
            type="text"
            role="combobox"
            aria-expanded={isLocationDropdownOpen}
            aria-controls="location-listbox"
            aria-activedescendant={
              focusedLocationIndex >= 0
                ? `location-option-${focusedLocationIndex}`
                : undefined
            }
            value={locationQuery}
            onChange={handleLocationInputChange}
            onKeyDown={handleLocationKeyDown}
            onFocus={() => {
              if (locationResults.length > 0) {
                setIsLocationDropdownOpen(true);
              }
            }}
            placeholder="Enter a city"
            autoComplete="off"
          />
          {isLocationDropdownOpen && renderLocationDropdown()}
        </div>
      </div>

      <div className="input-wrapper">
        <label>Check-in</label>
        <div className="input-container">
          <img src={calendarIcon} alt="Calendar" className="input-icon" />
          <input
            type="date"
            value={checkInDate}
            onChange={(e) => handleCheckInSelect(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
          />
        </div>
      </div>

      <div className="input-wrapper">
        <label>Check-out</label>
        <div className="input-container">
          <img src={calendarIcon} alt="Calendar" className="input-icon" />
          <input
            type="date"
            value={checkOutDate}
            onChange={(e) => handleCheckOutSelect(e.target.value)}
            min={checkInDate || new Date().toISOString().split("T")[0]}
          />
        </div>
      </div>

      <div className="input-wrapper">
        <label>Travelers</label>
        <div
          className="travelers-container"
          onClick={() => setIsModalOpen(true)}
        >
          <img src={bedIcon} alt="Bed" className="traveler-icon" />
          {rooms}{" "}
          <img src={profileIcon} alt="Person" className="traveler-icon" />{" "}
          {adults + children}
        </div>
      </div>

      <div className="input-wrapper">
        <div
          className="search-container"
          onClick={() => handleSearchHotels()}
          style={{ cursor: "pointer" }}
        >
          <img src={searchIcon} alt="Search" className="search-icon" />
        </div>
      </div>
    </div>
  );

  const renderFilters = () => (
    <div className="filters filters-sort">
      <button
        className={`free-breakfast-button ${freeBreakfastOnly ? "active" : ""}`}
        onClick={() => {
          console.log("LOCATION IS: "+selectedLocation.name);
          setFreeBreakfastOnly(!freeBreakfastOnly);
          setCurrentPage(1);
        }}
      >
        Free Breakfast
      </button>

      <div className="dropdown">
        <button
          className="dropbtn sort-dropbtn"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          Sort by<span className="sort-option">{sortOption} ▼</span>
        </button>
        {isDropdownOpen && (
          <div className="dropdown-content sort-dropdown-content">
            {[
              "Price (low to high)",
              "Price (high to low)",
              "Hotel class",
              "Distance",
            ].map((option, index) => (
              <a
                href="#"
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  handleSortSelection(option);
                }}
              >
                {option}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderPagination = () => (
    <div className="pagination-container">
      <p>
        Showing {indexOfFirstHotel + 1} -{" "}
        {Math.min(indexOfLastHotel, filteredHotels.length)} of{" "}
        {filteredHotels.length} results
      </p>

      <div className="pagination">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          {"<"}
        </button>

        {Array.from({
          length: Math.ceil(filteredHotels.length / hotelsPerPage),
        }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index + 1)}
            className={currentPage === index + 1 ? "active" : ""}
          >
            {index + 1}
          </button>
        ))}

        <button
          onClick={() =>
            setCurrentPage((prev) =>
              Math.min(
                prev + 1,
                Math.ceil(filteredHotels.length / hotelsPerPage)
              )
            )
          }
          disabled={
            currentPage === Math.ceil(filteredHotels.length / hotelsPerPage)
          }
        >
          {">"}
        </button>
      </div>
    </div>
  );

  const renderHotelList = () => (
    <div className="hotels-list">
      {currentHotels.length > 0 ? (
        currentHotels.map((hotel) => {
          const offer = hotelOffers[hotel.hotelId];
          const hotelData = {
            ...hotel,
            name: encode(hotel.name),
            location: `${encode(formatLocationName(selectedLocation.name))}, ${
              selectedLocation.address.countryCode
            }`,
            distance: hotel.distance.value,
            rating: parseInt(hotel.rating),
            reviews: 0,
            bestPrice: offer?.offers?.[0]?.price?.total,
            freeBreakfast: offer?.offers?.[0]?.boardType === "BREAKFAST",
            geoCode: hotel.geoCode || null,
          };

          return (
            <HotelCard
              key={hotel.hotelId}
              hotel={hotelData}
              tripId={tripId}
              fromInvite={fromInvite}
            />
          );
        })
      ) : !isLoadingHotels && !isLoadingOffers ? (
        <p>No hotels available with the current filters.</p>
      ) : null}
    </div>
  );

  return (
    <div className="hotels-page">
      <div className="top-section">
        <div className="content-container">
          {renderSearchBar()}
          <TravelersModal
            isOpen={isModalOpen}
            setIsOpen={setIsModalOpen}
            rooms={rooms}
            setRooms={setRooms}
            adults={adults}
            setAdults={setAdults}
          />
        </div>
      </div>

      <div className="lower-section">
        <div className="content-container">
          {error && <div className="error-message">{error}</div>}

          {hotels.length > 0 && renderFilters()}

          {(isLoadingHotels || isLoadingOffers) && (
            <div className="loading-message">
              {isLoadingHotels ? "Loading hotels..." : "Loading prices..."}
            </div>
          )}

          {!isLoadingHotels && !isLoadingOffers && renderHotelList()}

          {filteredHotels.length > 0 &&
            !isLoadingHotels &&
            !isLoadingOffers &&
            renderPagination()}

          <p className="powered-by">
            Powered by{" "}
            <a href="https://amadeus.com" target="_blank">
              Amadeus
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Hotels;
