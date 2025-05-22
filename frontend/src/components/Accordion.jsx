import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import "../styles/Accordion.css";
import { encode } from "html-entities";


const Accordion = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [children]);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="accordion">
      <button
        className={`accordion-header ${isOpen && "active"}`}
        onClick={toggleAccordion}
      >
        <span className={`accordion-icon ${isOpen && "open"}`}>▼</span>
        <span>{encode(title)}</span>
      </button>
      <div
        className="accordion-content"
        style={{
          height: isOpen ? `${contentHeight}px` : "0",
        }}
      >
        <div ref={contentRef}>{children}</div>
      </div>
    </div>
  );
};

Accordion.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default Accordion;
