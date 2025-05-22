# Amadeus Hotel API Endpoints Documentation

## Available Endpoints

This documentation describes how to use the main API endpoints for hotel searching and offer details.

## 1. Location Search

**Endpoint:** `/api/amadeus/hotels/locations.php`

Search for city or airport locations by keyword.

**Parameters:**

- `keyword` (required): Search term for the location (e.g., "Charleston")

**Example Request:**

```
https://aptitude.cse.buffalo.edu/CSE442/2025-Spring/cse-442aj/backend/api/locations.php?keyword=Charleston
```

**Response:** Returns location data including city codes that can be used in hotel searches.

## 2. Hotel Search

**Endpoint:** `/api/amadeus/hotels/hotels.php`

Find hotels in a specific city.

**Parameters:**

- `cityCode` (required): IATA city code (e.g., "CHS" for Charleston)
- `radius` (optional): Search radius in kilometers (default: 5)

**Example Request:**

```
https://aptitude.cse.buffalo.edu/CSE442/2025-Spring/cse-442aj/backend/api/hotels.php?cityCode=CHS&radius=25
```

**Response:** Returns a list of hotels with their IDs that can be used to check availability and pricing.

## 3. Hotel Offers

**Endpoint:** `/api/amadeus/hotels/hotel_offers.php`

Get pricing and availability for specific hotels.

**Parameters:**

- `hotelIds` (required): Comma-separated hotel IDs (e.g., "HICHS223,WVCHS297")
- `checkInDate` (required): Check-in date in YYYY-MM-DD format
- `checkOutDate` (required): Check-out date in YYYY-MM-DD format
- `adults` (required): Number of adults

**Example Request:**

```
https://aptitude.cse.buffalo.edu/CSE442/2025-Spring/cse-442aj/backend/api/hotel_offers.php?hotelIds=HICHS223,WVCHS297&checkInDate=2025-10-01&checkOutDate=2025-10-05&adults=1
```

**Response:** Returns available offers for the specified hotels, including pricing and room information.

## 4. Hotel Offer Details

**Endpoint:** `/api/amadeus/hotels/hotel_offer_details.php`

Get detailed information about a specific hotel offer.

**Parameters:**

- `offerId` (required): Offer ID from the hotel offers response

**Example Request:**

```
https://aptitude.cse.buffalo.edu/CSE442/2025-Spring/cse-442aj/backend/api/hotel_offer_details.php?offerId=SG75Q6KWQ8
```

**Response:** Returns comprehensive details about the specific offer, including cancellation policies, room details, and pricing information.

## Typical Usage Flow

1. Search for a location to get the city code using `/api/locations.php`
2. Use the city code to find hotels with `/api/hotels.php`
3. Get availability and pricing for selected hotels with `/api/hotel_offers.php`
4. Get detailed information about a specific offer with `/api/hotel_offer_details.php`

All responses follow a JSON format with a success status and either data or error information.
