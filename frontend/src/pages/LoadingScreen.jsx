import { useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { encode } from "html-entities";
import { searchLocations, searchHotels } from "../services/hotelService";
import "../styles/LoadingScreen.css";

const LoadingScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const tripId = searchParams.get("tripId");
  const fromInvite = searchParams.get("fromInvite") === "true";

  const { headerText, redirectTo, recommendations, hotels } =
    location.state || {
      headerText: "Loading...",
      redirectTo: "/",
      recommendations: null,
      hotels: null,
    };

  function getCountryFromCity(city) {
    const normalizedCity = city.toLowerCase();
    const CITY_COUNTRY_MAP = {
      rome: "IT",
      milan: "IT",
      madrid: "ES",
      barcelona: "ES",
      london: "GB",
      paris: "FR",
    };
    return CITY_COUNTRY_MAP[normalizedCity] || "";
  }

  useEffect(() => {
    async function doLoad() {
      // 1. If we are going to the hotels page, we need to fetch the location and hotels from amadeus
      if (redirectTo === "/browse-hotels" && hotels) {
        try {
          // Step 1: Get location from amadeus
          console.log("getting location from amadeus");
          const locations = await searchLocations(hotels.location);
          const locationMatch =
            locations.find((loc) => loc.name === hotels.location) ||
            locations[0];
          console.log("locationMatch", locationMatch);

          // Step 2: Get hotels from amadeus
          console.log("getting hotels from amadeus");
          const results = await searchHotels(
            locationMatch,
            hotels.checkIn,
            hotels.checkOut,
            hotels.adults,
            hotels.rooms
          );
          console.log("hotels from amadeus", results);

          console.log(
            "In LoadingScreen, before nav to hotels page, tripId and fromInvite: ",
            tripId,
            fromInvite
          );

          const query = new URLSearchParams({
            tripId,
            fromInvite,
          });

          // Step 3: Navigate to hotels page with results
          navigate(`/browse-hotels?${query.toString()}`, {
            state: {
              location: locationMatch,
              searchResults: results,
              checkIn: hotels.checkIn,
              checkOut: hotels.checkOut,
            },
          });
        } catch (error) {
          console.error("Error fetching hotels:", error);
          navigate(`/browse-hotels?${query.toString()}`, {
            state: {
              error: error.message,
            },
          });
        }
        // If we are not going to the hotels page, we just navigate to the page after timeout
      // === 1. FAVORITES: Fetch user's favorite city codes + images
      } else if (redirectTo === "/favorites") {
        console.log("Loading Screen: In get favorites")
        try {
          const res = await fetch(
            "/CSE442/2025-Spring/cse-442aj/backend/api/amadeus/destinations/getFavorites.php",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({}),
            }
          );

          const data = await res.json();
          console.log("Data recieved from getFavorites is, ", data)
          if (!data.success || !data.locations) throw new Error("No favorites");

          const destinationsWithImages = await Promise.all(
            data.locations.map(async ({ location, cityCode }) => {
              try {
                const imgRes = await fetch(
                  `/CSE442/2025-Spring/cse-442aj/backend/api/images/pexelsSearch.php?query=${encodeURIComponent(
                    location
                  )}`
                );
                const imgData = await imgRes.json();
                return {
                  name: location,
                  iataCode: cityCode,
                  image_url: imgData.photos?.[0]?.src?.large || null,
                };
              } catch {
                return {
                  name: location,
                  iataCode: cityCode,
                  image_url: null,
                };
              }
            })
          );

          navigate("/favorites", {
            state: {
              destinations: destinationsWithImages,
            },
          });
          return;
        } catch (err) {
          console.error("Error loading favorites:", err);
          alert("Could not load favorites.");
          navigate("/profile/new-destination");
          return;
        }
      // === 2. RECOMMENDATIONS: Fetch city codes from favorites → get recs → attach images
      } else if (redirectTo === "/recommended") {
        try {
          const res = await fetch(
            "/CSE442/2025-Spring/cse-442aj/backend/api/amadeus/destinations/getFavorites.php",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({}),
            }
          );

          const data = await res.json();
          console.log("Data recieved from getFavorites is, ", data)
          if (!data.success || !data.locations) throw new Error("No favorites");

          const cityCodes =
            data.locations.length > 0
              ? data.locations
              : [{ location: "New York City", cityCode: "NYC" }];

          let allRecommendations = [];

          for (const code of cityCodes) {
            const recRes = await fetch(
              `/CSE442/2025-Spring/cse-442aj/backend/api/recommendedFromFavorites.php?cityCode=${code.cityCode}`
            );
            const recData = await recRes.json();
          console.log("recData recieved from recommendedFromFavorites is, ", recData)

            if (recData?.data) {
              allRecommendations.push(...recData.data);
            }
          }

          const deduped = allRecommendations.filter(
            (item, index, self) =>
              index === self.findIndex((d) => d.name === item.name)
          );

          const withImages = await Promise.all(
            deduped.map(async (destination) => {
              try {
                const imgRes = await fetch(
                  `/CSE442/2025-Spring/cse-442aj/backend/api/images/pexelsSearch.php?query=${encodeURIComponent(
                    destination.name
                  )}`
                );
                const imgData = await imgRes.json();
                return {
                  ...destination,
                  image_url: imgData.photos?.[0]?.src?.large || null,
                };
              } catch {
                return { ...destination, image_url: null };
              }
            })
          );

          navigate("/recommended", {
            state: {
              destinations: withImages,
            },
          });
          return;
        } catch (err) {
          console.error("Error loading recommendations:", err);
          alert("Could not load personalized recommendations.");
          navigate("/profile/new-destination");
          return;
        }
      // === 3. ACCEPT-REJECT: Fetch city recs from category click
      } else if (redirectTo === "/profile/accept-reject" && location.state?.category) {
        try {
          const category = location.state.category;

          const res = await fetch(
            `/CSE442/2025-Spring/cse-442aj/backend/api/amadeus/destinations/getRecommendations.php?category=${encodeURIComponent(
              category
            )}`
          );
          const raw = await res.text();
          const data = JSON.parse(raw);

          if (!data || !data.data) throw new Error("No recommendations found");

          const recs = await Promise.all(
            data.data.map(async (rec) => {
              const query = `${rec.name} travel`;
              try {
                const imgRes = await fetch(
                  `/CSE442/2025-Spring/cse-442aj/backend/api/images/pexelsSearch.php?query=${encodeURIComponent(query)}`
                );
                const imgData = await imgRes.json();
                return {
                  name: rec.name,
                  countryCode: getCountryFromCity(rec.name),
                  image_url: imgData.photos?.[0]?.src?.large || null,
                };
              } catch {
                return {
                  name: rec.name,
                  countryCode: getCountryFromCity(rec.name),
                  image_url: null,
                };
              }
            })
          );          

          navigate("/profile/accept-reject", {
            state: {
              category,
              recommendations: recs,
            },
          });
          return;
        } catch (err) {
          console.error("Error loading accept-reject recs:", err);
          alert("Could not load suggestions.");
          navigate("/profile/new-destination");
          return;
        }
      } else {
        // Original timer-based navigation for other routes
        const timer = setTimeout(() => {
          if (recommendations) {
            navigate(redirectTo, { state: { recommendations } });
          } else {
            navigate(redirectTo);
          }
        }, 4000);
        return () => clearTimeout(timer);
      }
    }

    doLoad();
  }, [navigate, redirectTo, recommendations, hotels]);

  return (
    <div className="loading-screen">
      <h2>{headerText}</h2>
      <div className="loading-spinner"></div>
      <p>This may take a while...</p>
      <p className="powered-by">
        Powered by{" "}
        <a href="https://amadeus.com" target="_blank">
          Amadeus
        </a>
      </p>
      <button className="loading-cancel" onClick={() => navigate(-1)}>
        ✖
      </button>
    </div>
  );
};

export default LoadingScreen;
