import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

import homeIcon from "../assets/home.png";
import chartIcon from "../assets/chart.png";
import expertIcon from "../assets/expert.png";
import planImage from "../assets/plan.png";
import vastuScoreImage from "../assets/scoring.png";
import expertRemarksImage from "../assets/remarks.png";
import papaimage from "../assets/papa.png";

function Home() {
  const navigate = useNavigate();

  return (
    <div>
      <Navbar />
      <div className="hero">
        <div className="hero-text">
          <h1>
            Harmonize Your Home <br />
            with VastuZone
          </h1>

          <p>
            Unlock the ancient science of Vastu Shastra for modern living.
            Get professional guidance to bring balance, prosperity,
            and well-being to your space.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn" onClick={() => navigate("/login")}>
              Get Started
            </button>
            <a href="#process-section">
              <button className="secondary-btn">Learn More</button>
            </a>
          </div>
        </div>

        <div className="hero-image">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
            alt="Modern Home"
          />
        </div>
      </div>
      <div id="process-section" className="how-it-works">
        <h2>A Simple Path to a Balanced Home</h2>
        <p className="how-subtitle">
          Our streamlined process makes getting a professional Vastu
          analysis easier than ever.
        </p>

        <div className="steps">
          <div className="step">
            <div className="step-icon">
              <img src={homeIcon} alt="Submit Plan" />
            </div>
            <h3>1. Submit Your Plan</h3>
            <p>
              Use our intuitive form to provide details about your property,
              including room layouts and facing direction.
            </p>
          </div>

          <div className="step">
            <div className="step-icon">
              <img src={chartIcon} alt="Instant Analysis" />
            </div>
            <h3>2. Instant Analysis</h3>
            <p>
              Receive an immediate, AI-powered preliminary Vastu report
              highlighting key issues and an overall compliance score.
            </p>
          </div>

          <div className="step">
            <div className="step-icon">
              <img src={expertIcon} alt="Expert Review" />
            </div>
            <h3>3. Expert Review</h3>
            <p>
              Our certified Vastu Shastris review your plan, validate the
              analysis, and provide personalized, actionable remedies.
            </p>
          </div>
        </div>
      </div>
      <section className="about-expert">
        <div className="about-expert-content">
          <h2>Meet Our Vastu Expert</h2>

          <h3>Dr. Rajni Kant Srivastava</h3>
          <p className="expert-title">
            Certified Vastu Shastri & Spiritual Guide
          </p>

          <p>
            With decades of experience in the ancient science of Vastu Shastra,
            Dr. Rajni Kant Srivastava (+91 80900 00080) has guided hundreds of families towards harmony,
            prosperity, and peace. His approach blends traditional wisdom with
            practical solutions suited for modern lifestyles.
          </p>

          <p>
            Every consultation at VastuZone is personally reviewed by him,
            ensuring authenticity, accuracy, and deeply personalized guidance.
            His philosophy is simple — a balanced space creates a balanced life.
          </p>

          <p className="expert-quote">
            “True Vastu is not about fear — it is about flow, balance, and positive
            energy.”
          </p>
        </div>

        <div className="about-expert-image">
          <img
            src={papaimage}   
            alt="Vastu Shastri Expert"
          />
        </div>
      </section>
      <section className="features">
        <div className="features-header">
          <h2>Features Designed for You</h2>
          <p>Everything you need for a comprehensive Vastu consultation.</p>
        </div>
        <div className="feature-row">
          <div className="feature-text">
            <h3>Client Dashboard</h3>
            <p>
              Keep all your submitted properties organized in one central dashboard. Easily track their progress at every stage, from the initial AI-based analysis to the final expert-reviewed Vastu report, all at a single glance.
            </p>
          </div>

          <div className="feature-image">
            <img src={planImage} alt="Client Dashboard" />
          </div>
        </div>
        <div className="feature-row ">
          <div className="feature-image">
            <img src={vastuScoreImage} alt="Automated Vastu Scoring" />
          </div>

          <div className="feature-text">
            <h3>Automated Vastu Scoring</h3>
            <p>
              Powered by advanced AI, our system evaluates your inputs in real time to deliver an instant Vastu score, helping you understand your property’s energetic alignment with precision and clarity.
            </p>
          </div>
        </div>
        <div className="feature-row reverse">
          <div className="feature-image">
            <img
              src={expertRemarksImage}
              alt="Personalized Expert Remarks"
            />
          </div>

          <div className="feature-text">
            <h3>Personalized Expert Remarks</h3>
            <p>
              Go beyond automated reports with expert human insight. Our certified Vastu Shastri carefully reviews your property analysis and provides personalized suggestions and detailed remarks, ensuring that every recommendation is tailored specifically to your space and lifestyle.
            </p>
          </div>
        </div>
      </section>
      <section className="cta">
        <h2>Ready to Create Your Harmonious Space?</h2>

        <p>
          Join VastuZone today and take the first step towards a home
          filled with positive energy and prosperity.
        </p>

        <button className="cta-btn" onClick={() => navigate("/login")}>
          Start Your Vastu Journey
        </button>
      </section>

      <footer className="footer">
        <p className="footer-left">
          © 2025 VastuZone. Coded by Rajat.
        </p>

        <div className="footer-right">
          <a href="/privacy-policy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
        </div>
      </footer>

    </div>
  );
}

export default Home;
