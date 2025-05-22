import React from "react";
import "../App.css";
import "../styles/StyleGuide.css";

const StyleGuide = () => {
  return (
    <div className="style-guide">
      <h1>Design System & Style Guide</h1>
      <p>
        This is a style guide for the website. It is used to ensure consistency
        across the website.
      </p>
      <section className="style-section">
        <h2>Color Palette</h2>
        <div className="color-grid">
          <div className="color-item">
            <div
              className="color-preview"
              style={{ backgroundColor: "var(--primary-color)" }}
            ></div>
            <p>Primary Color</p>
            <code>#795BF1</code>
            <code>var(--primary-color)</code>
          </div>
          <div className="color-item">
            <div
              className="color-preview"
              style={{ backgroundColor: "var(--secondary-color)" }}
            ></div>
            <p>Secondary Color</p>
            <code>#52DDA2</code>
            <code>var(--secondary-color)</code>
          </div>
          <div className="color-item">
            <div
              className="color-preview"
              style={{ backgroundColor: "var(--dark-grey)" }}
            ></div>
            <p>Dark Grey</p>
            <code>#555555</code>
            <code>var(--dark-grey)</code>
          </div>
          <div className="color-item">
            <div
              className="color-preview"
              style={{ backgroundColor: "var(--background-color)" }}
            ></div>
            <p>Background Color</p>
            <code>#F8F8F8</code>
            <code>var(--background-color)</code>
          </div>
          <div className="color-item">
            <div
              className="color-preview"
              style={{ backgroundColor: "var(--secondary-text)" }}
            ></div>
            <p>Secondary Text</p>
            <code>#B99C9C</code>
            <code>var(--secondary-text)</code>
          </div>
        </div>
      </section>

      <section className="style-section">
        <h2>Typography</h2>
        <div className="typography-showcase">
          <div className="type-item">
            <h1>Heading 1</h1>
            <p className="type-details">Font: Inter, 3.2em</p>
          </div>
          <div className="type-item">
            <h2>Heading 2</h2>
            <p className="type-details">Font: Inter, 2.4em</p>
          </div>
          <div className="type-item">
            <h3>Heading 3</h3>
            <p className="type-details">Font: Inter, 1.8em</p>
          </div>
          <div className="type-item">
            <p>Body Text</p>
            <p className="type-details">Font: Inter, 1em, Line Height: 1.5</p>
          </div>
          <div className="type-item">
            <a href="#" onClick={(e) => e.preventDefault()}>
              Link Style
            </a>
            <p className="type-details">Weight: 500, Hover: Secondary Color</p>
          </div>
        </div>
      </section>

      <section className="style-section">
        <h2>Components</h2>
        <div className="component-showcase">
          <div className="component-item">
            <h3>Buttons</h3>
            <div className="button-group">
              <button>Primary Button</button>
              <button disabled>Disabled Button</button>
            </div>
            <p className="component-details">
              Border Radius: 8px
              <br />
              Padding: 0.6em 1.2em
              <br />
              Shadow: 0px 4px 4px rgba(0, 0, 0, 0.25)
            </p>
          </div>
        </div>
      </section>

      <section className="style-section">
        <h2>Form Inputs</h2>
        <div className="component-showcase">
          <div className="component-item">
            <h3>Dropdown</h3>
            <div class="dropdown">
              <button class="dropbtn">
                Select item <i class="arrow down"></i>
              </button>
              <div class="dropdown-content">
                <a href="#" onClick={(e) => e.preventDefault()}>
                  Link 1
                </a>
                <a href="#" onClick={(e) => e.preventDefault()}>
                  Link 2
                </a>
                <a href="#" onClick={(e) => e.preventDefault()}>
                  Link 3
                </a>
              </div>
            </div>
          </div>
          <div className="component-item">
            <h3>Text Input</h3>
            <input
              type="text"
              className="input-field"
              placeholder="Enter text"
            />
            <p className="component-details">
              Border Radius: 8px, Padding: 12px
            </p>
          </div>
        </div>
      </section>

      <section className="style-section">
        <h2>Modals</h2>
        <div className="component-showcase modals-container">
          <div className="component-item ">
            <div className="modal">
              <div className="modal-header">
                <span className="modal-close">&times;</span>
                <h3>
                  Enter <span className="modal-highlight">title</span>
                </h3>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="modal-input"
                  placeholder="Placeholder text"
                />
                <button className="modal-button">Save</button>
              </div>
            </div>
            <p className="component-details">
              Width: 320px
              <br />
              Border Radius: 12px
              <br />
              Shadow: 0px 4px 10px rgba(0, 0, 0, 0.2)
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StyleGuide;
