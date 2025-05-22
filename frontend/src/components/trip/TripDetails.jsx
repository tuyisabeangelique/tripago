import { memo, useEffect, useState } from "react";
import PropTypes from "prop-types";
import Accordion from "../Accordion";
import { resolvePath, useNavigate } from "react-router-dom";
import "../../styles/trip/TripDetails.css";
import { FaEdit, FaTimes } from "react-icons/fa";
import { encode } from "html-entities";
import axios from "axios";
import autofillIcon from "../../assets/autofill.png";
import { Slide } from "react-slideshow-image";
import "react-slideshow-image/dist/styles.css";
import ShareTripButton from "../../components/trip/ShareTripButton.jsx";
import TripTags from "./TripTags.jsx";
import HelpTooltip from "../HelpTooltip.jsx";

const Itinerary = ({ trip, setShowModal, isInvitee }) => {
  //THIS STORES THE ACTIVITIES FOR EACH DAY :)
  //Need to get saved activities from DB, (or at least check!)
  //its called "autofillMessages", but should handle manual ones too!
  const [autoFillMessages, setAutoFillMessages] = useState({});
  const [location, setLocation] = useState({}); // State to store location input for each day
  const [placeholderText, setPlaceholderText] = useState({}); // State to store the placeholder text for each day
  const [addActivityButtonText, setAddActivityButtonText] = useState({}); // State to store the text of the add activity button
  const tripID = trip?.id;

  console.log("In Itinerary, our trip is, ", trip);
  console.log("In Itinerary, our tripId is, ", tripID);
  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  const diffTime = Math.abs(endDate - startDate);

  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  /*
  This should be called exactly once when generating the day accordians
  Will populate the autoFillmMessages array with any saved trips from 
  the database. Database retrievals will be based on cookie email, and trip name
  to find any corresponding activities for that trip.
  Will also want to use fill activity function to fill any retrieved activities
  once you get them!
  */

  const getActivitiesFromDB = async () => {
    console.log("Fetching activities from DB...");

    try {
      //use trip start date and user email to get activities for trip
      //ASSUMES USER DOES NOT MAKE MULTIPLE TRIPS THAT START ON THE SAME DAY!!!!!!

      console.log("Before post");

      const response = await axios.post(
        "/CSE442/2025-Spring/cse-442aj/backend/api/amadeus/destinations/getAllActivities.php",
        { trip_id: tripID, start_date: startDate, city_name: trip.name },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(response.data);

      const data = response.data.activities;

      //should have a list which contains "activities"

      for (let i = 0; i < data.length; i++) {
        let day = data[i].day;
        let name = data[i].name;
        let price;

        //null check for safety
        if (data.price == null) {
          price = data[i].price;
        } else {
          price = "";
        }

        setAutoFillMessages((prevMessages) => ({
          ...prevMessages,
          [day]: { name: name, price: "Price: " + price },
        }));
      }

      console.log(data);
    } catch (error) {
      if (error.response) {
        console.error("Server responded with:", error.response.data);
        console.error("Status code:", error.response.status);
        console.error("Headers:", error.response.headers);
      } else if (error.request) {
        console.error("No response received. Request:", error.request);
      } else {
        console.error("Error setting up the request:", error.message);
      }
      console.error("Original error:", error); // Log the full error for debugging.
    }
  };

  useEffect(() => {
    getActivitiesFromDB();
  }, []);

  /*
  Main purpose of this is to get a activity from the API call
  Should call fillActivity function, since you want to immediately fill that
  activity!
  */
  const autoFillBtn = async (i) => {
    //gets day number in i, so we can set the correspending accordians activity

    setAutoFillMessages((prevMessages) => ({
      ...prevMessages,
      [i]: { name: "Fetching activity ideas...", price: null },
    }));

    try {
      const response = await axios.post(
        "/CSE442/2025-Spring/cse-442aj/backend/api/amadeus/destinations/generateActivity.php",
        { location: trip.name, trip_id: tripID },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("After generating an activity,:");
      const data = response.data;

      console.log(data);

      if (data.success) {
        //response is success and has trips
        if (data.has_trips) {
          fillActivity(i, data.activity_name, data.activity_price);
          //done?
        } else {
          //apologize for not findings any activities
          console.log(data.message);
          setAutoFillMessages((prevMessages) => ({
            ...prevMessages,
            [i]: { name: "Could not find any activities", price: "" },
          }));
        }
      } else {
        console.log("An error has occurred!");
      }
    } catch (error) {
      console.log("Error during login: ", error.response);
    }
  };

  /*
  This is called when you have an activity name, and the day that it should go into
  Inserts into the autoFillMessages array!

  This should call a function to save that activity to the database
  */
  const fillActivity = async (day, name, price) => {
    setAutoFillMessages((prevMessages) => ({
      ...prevMessages,
      [day]: { name: name, price: "Price: " + price },
    }));

    storeActivity(day, name, price);

    setPlaceholderText((prevPlaceholder) => ({
      ...prevPlaceholder,
      [day]: "Enter price",
    }));
  };

  /*
Takes activity information to be stored in the database
Will just be using the day, name, and price of it for now, 
but can expand it in the future, if need (or want) be!
*/
  const storeActivity = async (day, name, price) => {
    try {
      /*
      send day, name of activity, price, and start date of trip
      start date of trip is used as a safety precaution in case you have
      multiple different trips to the same place

      This safety measure assumes that a user will not create mutiple trips 
      to the same location on the same day, because why would they?
      */
      const response = await axios.post(
        "/CSE442/2025-Spring/cse-442aj/backend/api/amadeus/destinations/addActivity.php",
        {
          trip_id: tripID,
          day: day,
          name: name,
          price: price,
          start: startDate,
          city_name: trip.name,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;

      console.log("After addActivity: ");
      console.log(data);

      if (data.success) {
        console.log("Activity has been added successfully");
      } else {
        console.log("An error was encountered adding the activity");
      }
    } catch (error) {
      console.log("Error during login: ", error.response);
    }
  };

  const handleRemoveAutofilled = () => {};
  /*
  This will handle when the manual "add activity" button is clicked
  Should get the input from a text box and day, and make a new activity from that!
  Will also call the fill activity function!
  */
  const addActivityButton = async (day, name) => {
    //check if price is entered
    if (placeholderText[day] == "Enter price") {
      console.log("Detected that price is recieved!");

      const activity_price = name;
      const activityName = autoFillMessages[day]?.name;

      console.log(
        "Custom user activity: " +
          activityName +
          " and corresponding price: " +
          activity_price +
          " will be processed"
      );

      //update text box to include user entered price
      setAutoFillMessages((prevMessages) => ({
        ...prevMessages,
        [day]: { ...prevMessages[day], price: "Price: " + name },
      }));

      //change text box place holder to be "Done"
      setPlaceholderText((prevPlaceholder) => ({
        ...prevPlaceholder,
        [day]: "Done",
      }));

      //sets value of input box to empty
      setLocation((prevLocation) => ({
        ...prevLocation,
        [day]: "",
      }));

      //store the custom activity
      storeActivity(day, activityName, activity_price);
    } else {
      //sets text in text box
      setAutoFillMessages((prevMessages) => ({
        ...prevMessages,
        [day]: { name: name, price: "Price:  " },
      }));

      //sets place holder text in input box
      setPlaceholderText((prevPlaceholder) => ({
        ...prevPlaceholder,
        [day]: "Enter price",
      }));

      //sets value of input box to empty
      setLocation((prevLocation) => ({
        ...prevLocation,
        [day]: "",
      }));

      //change button text after it's clicked for first time
      setAddActivityButtonText((prevText) => ({
        ...prevText,
        [day]: "Add Price",
      }));
    }
  };

  const navigate = useNavigate();
  const generateDayAccordions = () => {
    if (!trip.startDate || !trip.endDate) return [];
    //const startDate = new Date(trip.startDate);
    //const endDate = new Date(trip.endDate);
    const dayAccordions = [];

    //const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    for (let i = 0; i < diffDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i + 1);

      const dateString = currentDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });

      const dayActivities =
        trip.days && trip.days[i] ? trip.days[i].activities : [];

      dayAccordions.push(
        <Accordion key={i} title={dateString}>
          <div className="day-content">
            {dayActivities && dayActivities.length > 0 ? (
              <div className="activities-list">
                {dayActivities.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-header">
                      <h3>{activity.name}</h3>
                    </div>
                    {activity.time && (
                      <p className="activity-time">
                        Open {encode(activity.time)}
                      </p>
                    )}
                    {activity.description && (
                      <p className="activity-description">
                        {activity.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : autoFillMessages[i]?.name ? (
              <div className="autofilled-activity-container">
                <button
                  className="autofilled-close-btn"
                  onClick={() => handleRemoveAutofilled(i)}
                  aria-label="Remove activity"
                >
                  ×
                </button>
                <p className="autofilled-activity-name">
                  {encode(autoFillMessages[i].name)}
                </p>
                <p className="autofilled-activity-price">
                  {encode(autoFillMessages[i].price)}
                </p>
              </div>
            ) : null}

            <div className="activity-controls">
              <input
                type="text"
                placeholder={placeholderText[i] || "Enter location"}
                className="location-input"
                value={location[i] || ""}
                onChange={(e) => {
                  setLocation((prevLocation) => ({
                    ...prevLocation,
                    [i]: e.target.value,
                  }));
                }}
              />
              <button
                className="add-activity-btn"
                onClick={() => addActivityButton(i, location[i])}
              >
                {addActivityButtonText[i] || "Add activity"}
              </button>
              {/* <button className="auto-fill-btn" onClick={() =>autoFillBtn(i)}>Autofill my day</button> */}
              <button className="auto-fill-btn" onClick={() => autoFillBtn(i)}>
                <img
                  src={autofillIcon}
                  alt="Autofill"
                  className="auto-fill-icon"
                />
                Autofill my day
              </button>
            </div>
          </div>
        </Accordion>
      );
    }

    return dayAccordions;
  };

  return (
    <div className="itinerary-container tab-pane-container">
      {!trip.startDate || !trip.endDate ? (
        <div className="no-dates-selected">
          <div>
            <p>
              Looks like you haven&apos;t selected the dates for your trip yet.
            </p>
            <p>Get started below.</p>
          </div>

          <div className="trip-dates-edit">
            <div className="trip-dates-bar">
              <div className="tooltip-container">
                <HelpTooltip>
                  <span className="tooltip-purple">Add your trip dates</span> to
                  begin setting your itinerary and hotel details. If you're not
                  sure, don't worry. You can change this later on!
                </HelpTooltip>
                <h3>Trip Dates:</h3>
              </div>

              <button
                className="edit-budget-btn"
                onClick={() => setShowModal(true)}
              >
                <FaEdit /> Edit dates
              </button>
            </div>
            <div className="days-container">{generateDayAccordions()}</div>
          </div>
        </div>
      ) : (
        <>
          <div className="hotel-details">
            <div className="tooltip-container">
              <HelpTooltip>
                Let us find you a hotel. Tripago uses live search to suggest <span className="tooltip-purple">a
                hotel that fits your trip.</span> You can always change it later on.
              </HelpTooltip>
              <h3>Hotel Details:</h3>
            </div>

            <div className="hotel-status">
              {trip.hotel.name ? (
                <div className="booked-hotel-details">
                  <h4>{trip.hotel.name}</h4>
                  <p className="hotel-price">Price: ${trip.hotel.price}</p>
                  <button
                    className="find-hotel-btn"
                    onClick={() =>
                      navigate(`/loading-screen?tripId=${tripID}&fromInvite=${isInvitee}`, {
                        state: {
                          headerText:
                            "Hang on! We're finding the best hotels for you",
                          redirectTo: "/browse-hotels",
                          hotels: {
                            location: trip.name,
                            checkIn: trip.startDate,
                            checkOut: trip.endDate,
                            adults: 2, // safe default
                            rooms: 1, // safe default
                          },
                        },
                      })
                    }
                  >
                    Change Hotel
                  </button>
                </div>
              ) : (
                <>
                  <p className="no-hotel-message">
                    Looks like you haven&apos;t booked a hotel yet for this
                    trip.
                  </p>
                  <button
                    className="find-hotel-btn"
                    onClick={() =>
                      navigate(`/loading-screen?tripId=${tripID}&fromInvite=${isInvitee}`, {
                        state: {
                          headerText:
                            "Hang on! We're finding the best hotels for you",
                          redirectTo: "/browse-hotels",
                          hotels: {
                            location: trip.name,
                            checkIn: trip.startDate,
                            checkOut: trip.endDate,
                            adults: 2, // safe default
                            rooms: 1, // safe default
                          },
                          
                        },
                      })
                    }
                  >
                    + Find a hotel
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="trip-dates-edit">
            <div className="trip-dates-bar">

               <div className="tooltip-container">
                <HelpTooltip>
                  Build your perfect day. Add activities manually by entering a location, or click “Autofill my day” to <span className="tooltip-purple">get suggestions based on your destination.</span> You can mix and match — it’s your trip!
                </HelpTooltip>
                <h3>Trip Dates:</h3>
              </div>

              <button
                className="edit-budget-btn"
                onClick={() => setShowModal(true)}
              >
                <FaEdit /> Edit dates
              </button>
            </div>
            <div className="days-container">{generateDayAccordions()}</div>
          </div>
        </>
      )}
    </div>
  );
};

const Budgeting = ({ trip, isInvitee }) => {
  const [budget, setBudget] = useState(trip.budget?.amount ?? 0); // Default to 0
  const [expenses, setExpenses] = useState(trip.budget?.expenses ?? []); // Default to empty list
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const tripID = trip?.id;

  useEffect(() => {
    console.log(
      "Incoming trip.budget.amount in Budgeting:",
      trip.budget?.amount
    );
    setBudget(trip.budget?.amount ?? 0);
    console.log("Setting budget to,", trip.budget?.amount ?? 0);
  }, [trip.budget?.amount]);

  useEffect(() => {
    setExpenses(trip.budget?.expenses ?? []);
    console.log("Setting expenses to,", trip.budget?.expenses ?? []);
  }, [trip.budget?.expenses]);

  const totalExpenses = expenses.reduce((sum, expense) => {
    const amount = parseFloat(expense.amount);
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  const hotelPrice =
    typeof trip?.hotel?.price === "number" ? trip.hotel.price : 0;

  const isOverBudget = totalExpenses + hotelPrice > budget;

  const handleEditBudget = () => {
    setShowBudgetModal(true);
  };

  const handleSaveBudget = async (newBudget) => {
    setBudget(newBudget);

    try {
      await fetch(
        "/CSE442/2025-Spring/cse-442aj/backend/api/trips/saveBudgetExpense.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            trip_id: tripID,
            city_name: trip.name,
            budget_amount: newBudget, // triggers the update block
          }),
        }
      );
    } catch (err) {
      console.error("Error saving budget amount:", err);
    }
  };

  const handleAddExpense = async (newExpense) => {
    setExpenses((prev) => [...prev, newExpense]);

    try {
      await fetch(
        "/CSE442/2025-Spring/cse-442aj/backend/api/trips/saveBudgetExpense.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            trip_id: tripID,
            city_name: trip.name,
            category: newExpense.category,
            amount: newExpense.amount,
          }),
        }
      );
    } catch (err) {
      console.error("Error saving expense:", err);
    }
  };

  // Whenever totalExpenses is updated
  useEffect(() => {
    const loadExpenses = async () => {
      try {
        const res = await fetch(
          `/CSE442/2025-Spring/cse-442aj/backend/api/trips/getTripExpenses.php?trip_id=${trip.id}`
        );

        const data = await res.json();
        if (data.success) {
          setExpenses(data.expenses || []);
        } else {
          console.warn("No expenses found:", data.message);
        }
      } catch (err) {
        console.error("Error fetching expenses:", err);
      }
    };

    if (trip?.id) {
      loadExpenses();
    }
  }, [trip]);

  return (
    <div className="budgeting-container tab-pane-container">
      <div className="budget-info">
        <div className="budget-header">
          <div className="tooltip-container">
            <HelpTooltip>
              Keep track of your trip spending. Set a budget, then{" "}
              <span className="tooltip-purple">
                log your expenses as you go
              </span>
              . We'll show you how much you've spent so far — and let you know
              if you’ve met your budget.
            </HelpTooltip>
            <h2>Budgeting</h2>
          </div>
          <button className="edit-budget-btn" onClick={handleEditBudget}>
            <FaEdit /> Edit budget
          </button>
        </div>

        <div className="budget-overview">
          <div className="budget-amount">${budget.toFixed(2)}</div>
          <div className="budget-spent">
            You spent ${Number(totalExpenses + hotelPrice).toFixed(2)}
            {isOverBudget && (
              <div className="budget-warning">
                <span className="warning-icon">ⓘ</span>
                You&apos;ve exceeded your budget.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="expenses-section">
        <h3>Expenses</h3>
        <button onClick={() => setShowExpenseModal(true)}>+ Add expense</button>
        <div className="expenses-list">
          {expenses.map((expense, index) => (
            <div key={index} className="expense-item">
              <div className="expense-details">
                <div className="expense-icon">
                  {expense.category.toLowerCase().includes("flight")
                    ? "✈️"
                    : expense.category.toLowerCase().includes("hotel")
                    ? "🏨"
                    : expense.category.toLowerCase().includes("food")
                    ? "🍽️"
                    : "💰"}
                </div>
                <p>{encode(expense.category)}</p>
              </div>
              <p>${Number(expense.amount).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      {showExpenseModal && (
        <ExpenseModal
          onClose={() => setShowExpenseModal(false)}
          onSave={handleAddExpense}
        />
      )}

      {showBudgetModal && (
        <BudgetModal
          currentBudget={budget}
          onClose={() => setShowBudgetModal(false)}
          onSave={handleSaveBudget}
        />
      )}
    </div>
  );
};

const BudgetModal = ({ currentBudget, onClose, onSave }) => {
  const [amount, setAmount] = useState(currentBudget.toString());
  const [errorMessage, setErrorMessage] = useState(""); // State for error message

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setErrorMessage("Please enter a valid budget amount"); // Set the error message
      return;
    }

    onSave(parseFloat(amount));
    onClose();
  };

  const handleAmountChange = (e) => {
    // Only allow numbers and decimal points
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
    setErrorMessage(""); // Clear error message on input change
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-close" onClick={onClose}>
            <FaTimes />
          </span>
          <h3>
            Edit <span className="modal-highlight">Budget</span>
          </h3>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="modal-input"
            placeholder="Budget Amount ($)"
            value={amount}
            onChange={handleAmountChange}
            required
          />
          {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Display error message */}
          <button type="submit" className="modal-button">
            Save Budget
          </button>
        </form>
      </div>
    </div>
  );
};

const ExpenseModal = ({ onClose, onSave }) => {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!category || !amount || isNaN(parseFloat(amount))) {
      alert("Please enter valid expense details");
      return;
    }

    onSave({
      category,
      amount: parseFloat(amount),
    });

    onClose();
  };

  const handleCategorySelect = (selectedCategory) => {
    setCategory(selectedCategory);
  };

  const handleAmountChange = (e) => {
    // Only allow numbers and decimal points
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-close" onClick={onClose}>
            <FaTimes />
          </span>
          <h3>
            Add <span className="modal-highlight">Expense</span>
          </h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="category-buttons-container">
            <button
              type="button"
              className={`category-button ${category === "Flight" && "active"}`}
              onClick={() => handleCategorySelect("Flight")}
            >
              <div className="category-icon">✈️</div>
              <div className="category-label">Flight</div>
            </button>
            <button
              type="button"
              className={`category-button ${category === "Hotel" && "active"}`}
              onClick={() => handleCategorySelect("Hotel")}
            >
              <div className="category-icon">🏨</div>
              <div className="category-label">Hotel</div>
            </button>
            <button
              type="button"
              className={`category-button ${category === "Food" && "active"}`}
              onClick={() => handleCategorySelect("Food")}
            >
              <div className="category-icon">🍽️</div>
              <div className="category-label">Food</div>
            </button>
          </div>

          <input
            type="text"
            className="modal-input"
            placeholder="Amount ($)"
            value={amount}
            onChange={handleAmountChange}
            required
          />

          <button type="submit" className="modal-button">
            Save Expense
          </button>
        </form>
      </div>
    </div>
  );
};

const Memories = ({ trip }) => {

  const [memories, setMemories] = useState([]);

  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {

    const fetchMemories = async () => {

      try {
        // CHANGE THIS BACK TO BACKEND
        const response = await axios.post("/CSE442/2025-Spring/cse-442aj/backend/api/trips/getMemories.php", {id: trip.id}, {
          headers: { "Content-Type": "application/json" },
        });
        const result = response.data;
        console.log("getMemories form response: ", result);

        const mem = []
        for (const memory of result.memories) {
          memory["images"] = []
          for (const image of result.images) {
            if (image.memory_id === memory.id) {
              memory["images"].push(image.image_url)
            }
          }
          mem.push(memory);
        }
        setMemories(mem);

      } catch(err) {
          console.log("Error fetching memories: ", err);
      }
    };

    fetchMemories();
  }, [showShareModal]);

  // Style for image slideshow
  const divStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundSize: "cover",
    height: "400px",
  };

  // Properties of image slideshow
  const properties = {
    transitionDuration: 200,
    prevArrow: <a className="prev">◀</a>,
    nextArrow: <a className="next">▶</a>,
    autoplay: false,
    canSwipe: true,
    cssClass: "slide-container",
  };

  return (
    <div className="memories-container tab-pane-container">
      <ShareTripButton trip={trip} showShareModal={showShareModal} setShowShareModal={setShowShareModal} />
      {memories.length === 0 ? (
        <p className="no-memories-message">
          Looks like this trip has no memories. Use the button above to post a
          memory to this trip. Memories can include pictures and comments about
          your trip.
        </p>
      ) : (
        memories.map((memory) => (
          <div key={memory.id} className="memory-card">
            <div className="slide-container">
              <Slide {...properties} arrows={memory.images.length > 1}>
                {memory.images.map((slideImage, index) => (
                  <div key={index}>
                    <div
                      className="memory-image"
                      style={{
                        ...divStyle,
                        backgroundImage: `url(${slideImage})`,
                      }}
                    />
                  </div>
                ))}
              </Slide>
            </div>

            <p>{memory.caption}</p>
          </div>
        ))
      )}
    </div>
  );
};

const TripDetails = ({
  trip,
  setShowModal,
  isInvitee,
  currentTab,
  setCurrentTab,
}) => {
  const navigate = useNavigate();

  console.log("Trip is:", trip);
  const tripId = trip?.id;

  // const [currentTab, setCurrentTab] = useState("itinerary");

  return (
    <div className="trip-details">
      {trip.name ? (
        // if trip is selected
        <div className="trips-status">
          <div className="title-container divider">
            <div className="trip-title-wrapper">
              <h2>
                {isInvitee ? (
                  <>
                    Group trip to{" "}
                    <span className="title-accent">{encode(trip.name)}</span>
                  </>
                ) : (
                  <>
                    Your trip to{" "}
                    <span className="title-accent">{encode(trip.name)}</span>
                  </>
                )}
              </h2>
            </div>
            {/* <p>Select a different trip</p> */}
            <p
              className="select-different-p"
              onClick={() => navigate("/all-trips")}
              style={{ cursor: "pointer", textDecoration: "none" }}
            >
              Select a different trip
            </p>
          </div>

          <TripTags tripId={tripId} isInvitee={isInvitee} />

          <div className="itin-budget-container">
            <p
              className={`itin-budget-tab ${
                currentTab === "itinerary" && "active"
              }`}
              onClick={() => setCurrentTab("itinerary")}
            >
              Itinerary
            </p>

            <p
              className={`itin-budget-tab ${
                currentTab === "budgeting" && "active"
              }`}
              onClick={() => setCurrentTab("budgeting")}
            >
              Budgeting
            </p>
            <p
              className={`itin-budget-tab ${
                currentTab === "memories" && "active"
              }`}
              onClick={() => setCurrentTab("memories")}
            >
              Memories
            </p>
          </div>

          <div className="tab-content">
            {currentTab === "itinerary" && (
              <Itinerary
                trip={trip}
                setShowModal={setShowModal}
                isInvitee={isInvitee}
              />
            )}
            {currentTab === "budgeting" && (
              <Budgeting trip={trip} isInvitee={isInvitee} />
            )}
            {currentTab === "memories" && <Memories trip={trip} />}
          </div>
        </div>
      ) : (
        // if NO trip is selected
        <div className="trips-status">
          <h2 className="divider trip-status-pad">
            Looks like you don&apos;t have any trips scheduled yet.
          </h2>
          <p>Get started below.</p>

          <button
            className="start-trip-btn-all-trips"
            onClick={() => navigate("/profile/new-destination")}
          >
            Start new trip
          </button>
        </div>
      )}
    </div>
  );
};

const tripProps = PropTypes.shape({
  name: PropTypes.string.isRequired,
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  id: PropTypes.number,
  countryCode: PropTypes.string,
  days: PropTypes.arrayOf(
    PropTypes.shape({
      activities: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string.isRequired,
          time: PropTypes.string,
          description: PropTypes.string,
        })
      ),
    })
  ),
  hotel: PropTypes.shape({
    name: PropTypes.string,
    price: PropTypes.number,
  }),
  budget: PropTypes.shape({
    amount: PropTypes.number.isRequired,
    expenses: PropTypes.arrayOf(
      PropTypes.shape({
        category: PropTypes.string.isRequired,
        amount: PropTypes.number.isRequired,
      })
    ),
  }),
});

TripDetails.propTypes = {
  trip: tripProps,
  setShowModal: PropTypes.func.isRequired,
  isInvitee: PropTypes.bool,
  currentTab: PropTypes.string.isRequired,
  setCurrentTab: PropTypes.func.isRequired,
};

Itinerary.propTypes = {
  trip: tripProps,
  setShowModal: PropTypes.func.isRequired,
  isInvitee: PropTypes.bool,
};

Budgeting.propTypes = {
  trip: tripProps,
  isInvitee: PropTypes.bool,
};

ExpenseModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

BudgetModal.propTypes = {
  currentBudget: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};
Memories.propTypes = {
  trip: tripProps,
}

export default TripDetails;
