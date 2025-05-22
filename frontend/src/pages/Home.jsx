import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home__wrapper">
      <div className="home-content">
        <p className="title-text">
          The smarter way to <span className="title-text-accent">go.</span>
        </p>
        <p className="description-text">
          Effortless trip planning – from itinerary creation to budgeting and
          beyond.
        </p>

        <button onClick={() => navigate("/login")} className="plan-button">
          Plan your next trip.
        </button>
      </div>

      <div className="api-sources__container">
        <section className="trust-section">
          <h2 className="trust-header">Why should you trust Tripago?</h2>
          <p className="trust-text">
            The information you get is sourced from the best travel APIs:{" "}
            <strong>Amadeus</strong>.
          </p>
        </section>
      </div>

      <div className="style-guide_container">
        <button
          className="link-button"
          onClick={() => navigate("/style-guide")}
        >
          Tripago Style Guide
        </button>
      </div>
    </div>
  );
};

export default Home;
