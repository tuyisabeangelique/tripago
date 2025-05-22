import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TripHeader from "../../components/trip/TripHeader.jsx";
import TripDetails from "../../components/trip/TripDetails.jsx";
import "../../styles/Profile.css";
import airplaneIllustration from "../../assets/airplane.svg";
import Sidebar from "../../components/Sidebar.jsx";
import MobileSidebarToggle from "../../components/MobileSidebarToggle.jsx";
import { encode } from "html-entities";
import DiscussionBar from "../../components/trip/DiscussionBar.jsx";
import { useContext } from "react";
import { UserContext } from "../../context/UserContext.jsx";

const Profile = () => {
  const { user } = useContext(UserContext);

  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 680);
  const [isMobile, setIsMobile] = useState(false);

  // let incomingDestination = location.state || null;
  const incomingDestination = location.state || {};
  const isFromLogin = incomingDestination.fromLogin === true;
  const isInvitee = incomingDestination.fromInvite === true;
  const [currentTab, setCurrentTab] = useState("itinerary");

  console.log("at very top, incomingDest is", incomingDestination);

  const [trip, setTrip] = useState({
    name: "",
    countryCode: "",
    startDate: null,
    endDate: null,
    picture: airplaneIllustration,
    days: [],
    budget: { amount: 0, expenses: [] },
    hotel: {
      name: "",
      price: 0,
    },
  });

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [dateErrorMessage, setDateErrorMessage] = useState(""); // New state for date error message

  useEffect(() => {
    const incomingTripId = incomingDestination.tripId;

    const fetchTripImage = async (cityName) => {
      const cacheKey = `tripImage-${cityName}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) return cached;

      try {
        const res = await fetch(
          `/CSE442/2025-Spring/cse-442aj/backend/api/images/pexelsSearch.php?query=${encodeURIComponent(
            cityName
          )} tourism attractions`
        );
        const data = await res.json();
        const img = data.photos?.[0]?.src?.large || airplaneIllustration;
        localStorage.setItem(cacheKey, img);
        return img;
      } catch (err) {
        console.error("Pexels error:", err);
        return airplaneIllustration;
      }
    };

    const loadTrip = async () => {
      // If user is coming from login page, get latest trip.
      const stored = !isFromLogin ? localStorage.getItem("selectedTrip") : null;

      console.log("Rendering Profile.ksx and stored is : ", stored);

      let tripData = null;

      if (incomingTripId) {
        console.log("Loading trip from invite:", incomingTripId);
        try {
          const res = await fetch(
            "/CSE442/2025-Spring/cse-442aj/backend/api/trips/getTripById.php",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ trip_id: incomingTripId }),
            }
          );

          const data = await res.json();
          console.log("After get trip by id data is: ", data);
          if (data.success) {
            const tripData = {
              id: data.trip.id,
              name: encode(data.trip.city_name),
              countryCode: encode(data.trip.country_name),
              startDate: data.trip.start_date,
              endDate: data.trip.end_date,
              hotel: {
                name: data.trip.hotel?.name,
                price: data.trip.hotel?.price,
              },
            };

            const image =
              data.trip.image_url ||
              "/CSE442/2025-Spring/cse-442aj/backend/uploads/default_img.png";
            const budget = data.trip.budget || { amount: 0, expenses: [] };

            setTrip({
              ...tripData,
              picture: image,
              days: [],
              budget,
            });

            setStartDate(tripData.startDate || null);
            setEndDate(tripData.endDate || null);
            return;
          } else {
            console.warn("Trip not found by ID.");
            return;
          }
        } catch (err) {
          console.error("Failed to fetch trip by ID:", err);
          return;
        }
      }

      if (stored) {
        console.log("In stored block:");
        try {
          const parsed = JSON.parse(stored);
          const isNewTrip = parsed.newTrip === true;

          const hasNoBudget = !parsed.budget;

          if (hasNoBudget && !isNewTrip) {
            console.log(
              "Stored trip missing budget — fetching full trip from DB instead"
            );

            try {
              const res = await fetch(
                "/CSE442/2025-Spring/cse-442aj/backend/api/trips/getTrip.php",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    city_name: parsed.name,
                    start_date: parsed.startDate || null,
                    end_date: parsed.endDate || null,
                  }),
                }
              );

              const data = await res.json();
              if (data.success) {
                const tripData = {
                  id: data.trip.id,
                  name: encode(data.trip.city_name),
                  countryCode: encode(data.trip.country_name),
                  startDate: data.trip.start_date,
                  endDate: data.trip.end_date,
                  hotel: {
                    name: data.trip.hotel?.name,
                    price: data.trip.hotel?.price,
                  },
                };

                console.log("trip id set is: ", tripData.id);

                const image = data.trip.image_url || airplaneIllustration;
                const budget = data.trip.budget || { amount: 0, expenses: [] };

                setTrip({
                  ...tripData,
                  picture: image,
                  days: [],
                  budget,
                });

                setStartDate(tripData.startDate || null);
                setEndDate(tripData.endDate || null);
                return;
              } else {
                console.warn("Trip not found via getTrip.php");
              }
            } catch (err) {
              console.error("Failed to fetch trip via getTrip.php", err);
            }

            return; // don't continue to getLatestTrip fallback
          }

          tripData = {
            id: parsed.id,
            name: encode(parsed.name),
            countryCode: encode(parsed.countryCode || ""),
            startDate: parsed.startDate || "",
            endDate: parsed.endDate || "",
            hotel: {
              name: parsed.hotel?.name || "",
              price: parsed.hotel?.price || 0,
            },
          };
          console.log("tripData in stored block is:", tripData);

          let image = parsed.imageUrl || airplaneIllustration;

          if (isNewTrip) {
            console.log("Fetching Pexels image for new trip...");
            image = await fetchTripImage(tripData.name);

            // Save trip to database
            fetch(
              "/CSE442/2025-Spring/cse-442aj/backend/api/trips/saveTrip.php",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  city_name: tripData.name,
                  country_name: tripData.countryCode || null,
                  start_date: null,
                  end_date: null,
                  image_url:
                    image ||
                    "/CSE442/2025-Spring/cse-442aj/backend/uploads/default_img.png",
                  hotel_name: null,
                  hotel_price: null,
                }),
              }
            )
              .then((res) => res.json())
              .then((data) => {
                if (!data.success && !data.message.includes("Duplicate")) {
                  console.error("Trip save error:", data.message);
                } else {
                  console.log("Trip saved or already exists");
                  // NOW safe to use tripData + ID
                  tripData.id = data.trip_id;

                  const completeTrip = {
                    ...tripData,
                    picture: image,
                    days: [],
                    budget: parsed.budget || { amount: 0, expenses: [] },
                  };

                  setTrip(completeTrip);
                  setStartDate(tripData.startDate || null);
                  setEndDate(tripData.endDate || null);

                  localStorage.setItem(
                    "selectedTrip",
                    JSON.stringify({
                      ...completeTrip,
                      newTrip: false,
                      imageUrl: image,
                    })
                  );
                }
              })
              .catch((err) => {
                console.error("Failed to save trip:", err);
              });

            return; // Prevent continuing to setTrip too early
          }

          setTrip({
            ...tripData,
            picture: image,
            days: [],
            budget: parsed.budget || { amount: 0, expenses: [] },
          });

          setStartDate(tripData.startDate || null);
          setEndDate(tripData.endDate || null);
          return;
        } catch (err) {
          console.warn("Invalid trip data in localStorage.");
        }
      }

      // Load latest trip from DB
      try {
        console.log("Pt2 : Fetching full trip from db");
        const res = await fetch(
          "/CSE442/2025-Spring/cse-442aj/backend/api/trips/getLatestTrip.php"
        );
        const data = await res.json();
        console.log("Data recieved from latest trip is: ", data);
        if (data.success) {
          tripData = {
            id: data.trip.id,
            name: encode(data.trip.city_name),
            countryCode: encode(data.trip.country_name),
            startDate: data.trip.start_date,
            endDate: data.trip.end_date,
            hotel: {
              name: data.trip.hotel?.name,
              price: data.trip.hotel?.price,
            },
          };

          const image =
            data.trip.image_url ||
            "/CSE442/2025-Spring/cse-442aj/backend/uploads/default_img.png";
          const budget = data.trip.budget || { amount: 0, expenses: [] };

          console.log("Budget recieved is: ", budget);

          setTrip({
            ...tripData,
            picture: image,
            days: [],
            budget,
          });

          setStartDate(tripData.startDate || null);
          setEndDate(tripData.endDate || null);
        } else {
          console.warn("No trip found in DB.");
        }
      } catch (err) {
        console.error("Error loading latest trip:", err);
      }

      if (!tripData?.startDate || !tripData?.endDate) {
        setShowModal(true);
      }

      if (!tripData?.name) {
        setShowModal(false);
      }
    };

    loadTrip();

    const handleResize = () => {
      const isNowMobile = window.innerWidth <= 680;

      setIsMobile(isNowMobile);
    };

    handleResize(); // Run on first load
    window.addEventListener("resize", handleResize); // Watch for resizes

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="profile-page">
      {/* Hamburger toggle for mobile */}
      {isMobile && (
        <MobileSidebarToggle
          isOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />
      )}

      {/* Sidebar: always visible on desktop, toggled on mobile */}
      <Sidebar isOpen={!isMobile || isSidebarOpen} />

      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className={`profile-content tab-${currentTab}`}>
            {showModal && (
              <div className="modal-overlay">
                <div className="modal travel-dates-modal">
                  <h3>
                    <span>When</span> are you planning to travel?
                  </h3>

                  <p>You can change this later on.</p>

                  <label>Start Date:</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setDateErrorMessage(""); // Clear error on start date change
                    }}
                  />
                  <div className="travel-dates-modal">
                    <label>End Date:</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        setDateErrorMessage(""); // Clear error on end date change
                      }}
                    />
                  </div>
                  {dateErrorMessage && (
                    <p style={{ color: 'red' }}>{dateErrorMessage}</p>
                  )}
                  <button
                    onClick={() => {
                      if (!startDate || !endDate) {
                        setDateErrorMessage("Please select both start and end dates.");
                        return;
                      }

                      if (new Date(startDate) > new Date(endDate)) {
                        //alert("End date cannot be before start date.");
                        setDateErrorMessage("End date cannot be before start date.");
                        return;
                      }

                      const diffTime = Math.abs(
                        new Date(endDate) - new Date(startDate)
                      );
                      const diffDays =
                        Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

                      const generatedDays = Array.from(
                        { length: diffDays },
                        () => ({
                          activities: [],
                        })
                      );

                      const updatedTrip = {
                        ...trip,
                        startDate,
                        endDate,
                        days: generatedDays,
                        budget: trip.budget || { amount: 0, expenses: [] },
                      };

                      setTrip(updatedTrip);
                      setShowModal(false);

                      const endpoint = "updateTripDates.php";
                      console.log("1Updated trip is: ", updatedTrip);

                      fetch(
                        `/CSE442/2025-Spring/cse-442aj/backend/api/trips/${endpoint}`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            city_name: updatedTrip.name,
                            country_name: updatedTrip.countryCode || null,
                            start_date: updatedTrip.startDate || null,
                            end_date: updatedTrip.endDate || null,
                          }),
                        }
                      )
                        .then((res) => res.json())
                        .then((data) => {
                          if (!data.success) {
                            console.error("Failed to save trip:", data.message);
                          } else {
                            console.log("Trip saved/updated successfully!");

                            localStorage.setItem(
                              "selectedTrip",
                              JSON.stringify({
                                id: updatedTrip.id,
                                name: updatedTrip.name,
                                countryCode: updatedTrip.countryCode,
                                startDate: updatedTrip.startDate,
                                endDate: updatedTrip.endDate,
                                imageUrl: updatedTrip.picture || "",
                                newTrip: false,
                              })
                            );

                            const checkinglocalSt =
                              localStorage.getItem("selectedTrip");
                            console.log("prrof is: ", checkinglocalSt);
                          }
                        })
                        .catch((err) => {
                          console.error("Error saving trip:", err);
                        });
                    }}
                  >
                    Save Dates
                  </button>
                </div>
              </div>
            )}

            {trip.id && (
              <TripHeader
                firstName={user?.firstName}
                lastName={user?.lastName}
                picture={trip?.picture}
                tripID={trip.id}
                isInvitee={isInvitee}
              />
            )}

            <TripDetails
              trip={trip}
              setShowModal={setShowModal}
              isInvitee={isInvitee}
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
            />

            {trip.id && (
              <DiscussionBar tripId={trip.id} isInvitee={isInvitee} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
