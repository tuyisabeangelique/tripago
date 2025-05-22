const API_BASE_URL = "/CSE442/2025-Spring/cse-442aj/backend/api/amadeus/hotels";


// Function to format location name properly
export function formatLocationName(name) {
  return name
    .split(' ')
    .map(word => {
      if (word.length <= 2) return word.toUpperCase(); // Keep short words (like "OF", "LA") uppercase
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

// Function to search locations
export async function searchLocations(query) {
  if (query.length < 3) return [];

  try {
    const response = await fetch(
      `${API_BASE_URL}/locations.php?keyword=${encodeURIComponent(query)}`
    );
    const data = await response.json();
    
    if (data.success) {
      return data.data.data || [];
    } else {
      console.error("Location search failed:", data.error);
      return [];
    }
  } catch (err) {
    console.error("Error searching locations:", err);
    return [];
  }
}

// Function to search hotels and their offers
export async function searchHotels(searchLocation, checkInDate, checkOutDate, adults, rooms) {
  if (!searchLocation || !checkInDate || !checkOutDate) {
    throw new Error("Please select a location and dates");
  }

  if (!searchLocation.geoCode.latitude || !searchLocation.geoCode.longitude) {
    throw new Error("Location must have latitude and longitude coordinates");
  }

  try {
    // First get hotels near the location
    const hotelsResponse = await fetch(
      `${API_BASE_URL}/hotels.php?` + new URLSearchParams({
        latitude: searchLocation.geoCode.latitude,
        longitude: searchLocation.geoCode.longitude
      })
    );
    const hotelsData = await hotelsResponse.json();
    console.log("hotelsData", hotelsData);

    if (!hotelsData.success) {
      throw new Error(hotelsData.error || "Failed to fetch hotels");
    }

    // Limit to 50 hotels
    const hotelsList = (hotelsData.data.data || []).slice(0, 50);
    if (hotelsData.data.data?.length > 50) {
      console.log(`Limiting results to 50 hotels out of ${hotelsData.data.data.length} found`);
    }
    console.log("hotelsList", hotelsList);
    
    // Then get offers for these hotels
    const hotelIds = hotelsList.map(h => h.hotelId).join(",");
    let offersMap = {};
    
    if (hotelIds) {
      const offersResponse = await fetch(
        `${API_BASE_URL}/hotel_offers.php?` + new URLSearchParams({
          hotelIds,
          checkInDate,
          checkOutDate,
          adults: adults.toString(),
          rooms: rooms.toString()
        })
      );
      const offersData = await offersResponse.json();
      
      console.log("offersData", offersData);
      if (offersData.success) {
        // Create a map of hotelId to offer
        console.log("offersData.data.data", offersData.data.data);
        (offersData.data.data || []).forEach(offer => {
          console.log("offer", offer);
          offersMap[offer.hotel.hotelId] = offer;
        });
      }
    }

    // Filter out hotels without offers/prices
    const hotelsWithPrices = hotelsList.filter(hotel => offersMap[hotel.hotelId]);
    console.log(`Found ${hotelsWithPrices.length} hotels with available prices out of ${hotelsList.length} total hotels`);

    return {
      hotels: hotelsWithPrices,
      offers: offersMap
    };
  } catch (err) {
    throw new Error(err.message || "Error searching hotels");
  }
} 