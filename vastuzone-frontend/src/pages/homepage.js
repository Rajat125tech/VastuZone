import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { ShieldCheck, Zap, Globe, Users } from 'lucide-react';

import papaimage from "../assets/papa.png";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="landing-wrapper">
      <Navbar />
      
      {/* --- HERO SECTION --- */}
      <section className="hero-modern-wrap" style={{ background: '#F8F8F7', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
        <div className="hero-modern container section-padding">
          <div className="hero-content">
            <span className="eyebrow">Scientific Spatial Audits</span>
            <h1 className="hero-title">
              Architecture of <i>Prosperity</i>.
            </h1>
            <p className="hero-description">
              VastuZone provides empirical spatial analysis for the modern discerning property owner. 
              Our methodology bridges the gap between ancient geometric laws and contemporary architectural logic to foster environments of peak potential.
            </p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => navigate("/login")}>
                Start Analysis
              </button>
              <button className="btn-secondary" onClick={() => document.getElementById('report-details').scrollIntoView({behavior: 'smooth'})}>
                The Report Methodology
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <img
              src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1200"
              alt="Minimalist Luxury Interior"
              className="hero-main-img"
            />
          </div>
        </div>
      </section>

      {/* --- TRUST BAR --- */}
      <section className="trust-bar-lux">
        <div className="container">
          <div className="trust-grid">
            <div className="trust-item">
              <ShieldCheck size={20} color="var(--brass)" />
              <span>Certified Expert Audits</span>
            </div>
            <div className="trust-item">
              <Zap size={20} color="var(--brass)" />
              <span>Real-time Energy Analysis</span>
            </div>
            <div className="trust-item">
              <Globe size={20} color="var(--brass)" />
              <span>Global Vastu Standards</span>
            </div>
            <div className="trust-item">
              <Users size={20} color="var(--brass)" />
              <span>Multiple Properties Harmonized</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- SERVICES GRID --- */}
      <section className="services-section section-padding">
        <div className="container">
          <div className="section-header center-text">
            <span className="eyebrow">Strategic Consultancy</span>
            <h2 className="serif">Specialized Domains</h2>
          </div>
          
          <div className="services-grid-modern">
            <div className="service-card-premium">
              <span className="card-cat">Residential</span>
              <h3>Vastu for Estates</h3>
              <p>A comprehensive 30-page spatial audit. We utilize satellite telemetry and birth-chart alignment to ensure your private residence acts as a catalyst for well-being.</p>
            </div>
            <div className="service-card-premium">
              <span className="card-cat">Commercial</span>
              <h3>Vastu for Office & Workspace</h3>
              <p>Maximize administrative synergy and operational growth. Our audits focus on executive positioning and financial zone activation for commercial entities.</p>
            </div>
            <div className="service-card-premium">
              <span className="card-cat">Industrial</span>
              <h3>Vastu for Factory</h3>
              <p>Industrial audits for maximum efficiency. We optimize machinery ergonomics and raw material logistics according to the 16 Vastu Zones.</p>
            </div>
            <div className="service-card-premium">
              <span className="card-cat">Geometric</span>
              <h3>Vastu for Plot & Land Selection</h3>
              <p>Pre-construction soil analysis and energy field mapping. Ensure the foundation of your legacy is built on mathematically sound Vastu principles.</p>
            </div>
            <div className="service-card-premium">
              <span className="card-cat">Urban</span>
              <h3>Vastu for Flats</h3>
              <p>Navigation of complex multi-unit energies. We provide selection guidance and non-structural rectification for contemporary apartment living.</p>
            </div>
            <div className="service-card-premium">
              <span className="card-cat">Design</span>
              <h3>Vastu for Architectural Planning</h3>
              <p>Collaborative design services. Work with our team to draft floor plans that are intrinsically aligned with the Vastu Purusha Mandala from inception.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- REPORT CONTENTS --- */}
      <section id="report-details" className="report-contents-section section-padding" style={{ background: '#0A0A0A', color: 'var(--paper)' }}>
        <div className="container">
          <div className="report-split">
            <div className="report-info">
              <span className="eyebrow" style={{ color: 'var(--brass)' }}>The Deliverable</span>
              <h2 className="serif" style={{ fontSize: '3.5rem' }}>Detailed Vastu Audit Report</h2>
              <p style={{ opacity: 0.8, marginBottom: '40px', fontSize: '1.1rem', lineHeight: '1.6' }}>
                A comprehensive and personalized analysis based on your property layout, direction, and usage — 
                designed to provide clear, practical, and effective Vastu recommendations.
              </p>
              
              <ul className="report-list-premium">
                <li>Direction & Layout Analysis (using floor plans and map reference)</li>
                <li>Vastu Purusha Mandala-based zone evaluation</li>
                <li>Identification of imbalances and their effects</li>
                <li>Practical rectification without major structural changes</li>
                <li>Room-wise guidance (entrance, kitchen, bedroom, etc.)</li>
                <li>Interior placement recommendations</li>
                <li>Colour and energy balancing suggestions</li>
                <li>Simple remedies for immediate improvement</li>
              </ul>
            </div>
            <div className="report-visual-card">
              <div className="glass-overlay">
                <span className="serif" style={{ color: 'var(--brass)', fontSize: '4rem' }}>CUSTOMIZED REPORTS</span>
                <p className="eyebrow" style={{ color: '#FFF', marginTop: '20px', textAlign: 'center', lineHeight: '1.4' }}>
                  Comprehensive Analysis <br /> Tailored to Your Space
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- EXPERT SECTION --- */}
      <section className="expert-editorial section-padding container">
        <div className="expert-split">
          <div className="expert-img-container">
            <img src={papaimage} alt="Dr. Rajni Kant Srivastava" className="expert-portrait" />
            <div className="expert-label">
              <p>Dr. Rajni Kant Srivastava</p>
              <span>Vastu Expert</span>
            </div>
          </div>
          <div className="expert-info">
            <span className="eyebrow">The Authority</span>
            <h2 className="serif" style={{ fontSize: '4rem', marginBottom: '30px' }}>Guiding Spaces <br /> Towards Balance</h2>
            <p className="expert-bio">
              With years of dedicated practice in Vastu Shastra, Dr. Rajni Kant Srivastava (+91 80900 00080) has transformed many living and commercial environments across India. 
            </p>
            <p className="expert-bio">
              His methodology is rooted in the belief that architectural logic and energy flow are the primary drivers of prosperity. He specializes in "Vastu without Breakage," providing non-structural remedies that align with modern lifestyles while respecting ancient traditions.
            </p>
            <div className="expert-quote-box">
              <p className="expert-quote-text">
                "True Vastu is not a ritual of fear; it is the science of aligning your physical environment with your highest intentions."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS --- */}
      <section className="testimonials section-padding" style={{ background: 'var(--paper)' }}>
        <div className="container">
          <div className="section-header center-text">
            <span className="eyebrow">The Record</span>
            <h2 className="serif">Client Testimonials</h2>
          </div>
          <div className="testimonial-grid-premium">
            <div className="testimonial-card-lux">
              <p>"I had a great experience consulting the VastuZone service. The analysis was very detailed and practical, and the suggestions were easy to implement without major changes. I noticed a positive shift in the overall energy and comfort of my space. Highly recommended for anyone looking for genuine and knowledgeable guidance."</p>
              <div className="testi-author">
                <span className="author-name">Aditya kumar Jha</span>
                <span className="author-loc">Dhanbad</span>
              </div>
            </div>
            <div className="testimonial-card-lux">
              <p>"The advice was simple and actually made sense. Made a few small changes at home and things already feel better. Definitely worth trying if you are curious about Vastu."</p>
              <div className="testi-author">
                <span className="author-name">Samarth Dixit</span>
                <span className="author-loc">Lucknow</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer-expanded section-padding">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <h3 className="serif" style={{ fontSize: '2rem' }}>VastuZone</h3>
              <p style={{ marginTop: '15px' }}>The global authority in scientific Vastu consultancy and architectural harmony.</p>
            </div>
            <div className="footer-col">
              <h4>Consultancy</h4>
              <button className="footer-link" onClick={() => { navigate("/add-property"); window.scrollTo(0,0); }}>Residential Audit</button>
              <button className="footer-link" onClick={() => { navigate("/book-appointment"); window.scrollTo(0,0); }}>Expert Strategy</button>
              <button className="footer-link" onClick={() => { navigate("/chat"); window.scrollTo(0,0); }}>Live Consultation</button>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <button className="footer-link" onClick={() => { navigate("/terms"); window.scrollTo(0,0); }}>Terms of Service</button>
              <button className="footer-link" onClick={() => { navigate("/privacy"); window.scrollTo(0,0); }}>Privacy Policy</button>
              <button className="footer-link" onClick={() => { navigate("/refund-policy"); window.scrollTo(0,0); }}>Refund Policy</button>
            </div>
            <div className="footer-col">
              <h4>Contact</h4>
              <p>kant.online@gmail.com</p>
              <p>+91 80900 00080</p>
              <p>Lucknow, India</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 VastuZone. All rights reserved. Coded by Rajat </p>
          </div>
        </div>
      </footer>

      <style>{`
        .landing-wrapper { overflow-x: hidden; }
        .footer-link { 
          display: block; 
          background: none; 
          border: none; 
          padding: 0; 
          color: var(--text-muted); 
          font-size: 0.9rem; 
          margin-bottom: 15px; 
          cursor: pointer; 
          text-align: left;
          transition: 0.3s;
        }
        .footer-link:hover { color: var(--ink); padding-left: 5px; }
        .eyebrow { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.3em; color: var(--brass); font-weight: 700; margin-bottom: 20px; display: block; }
        
        .hero-modern { display: grid; grid-template-columns: 0.8fr 1.2fr; gap: 80px; align-items: center; }
        .hero-title { font-size: 5.5rem; line-height: 0.95; margin-bottom: 30px; color: #111; }
        .hero-title i { font-family: 'Instrument Serif', serif; font-style: italic; color: var(--brass); }
        .hero-description { font-size: 1.2rem; color: var(--text-muted); max-width: 540px; margin-bottom: 40px; line-height: 1.7; }
        .hero-actions { display: flex; gap: 20px; }
        .hero-main-img { border-radius: 0; box-shadow: 40px 40px 0 var(--stone); width: 100%; height: auto; scale: 1.15; transition: var(--transition-smooth); }
        .hero-main-img:hover { scale: 1.18; }

        /* Trust Bar */
        .trust-bar-lux { background: #FFF; border-bottom: 1px solid var(--stone); padding: 40px 0; }
        .trust-grid { display: flex; justify-content: space-between; align-items: center; gap: 30px; }
        .trust-item { display: flex; align-items: center; gap: 12px; }
        .trust-item span { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); }
        @media (max-width: 768px) {
          .trust-grid { flex-direction: column; align-items: flex-start; gap: 20px; }
        }

        .section-header { margin-bottom: 80px; }
        .section-header h2 { font-size: 4rem; color: #111; }

        .expert-split { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 100px; align-items: center; margin-top: 60px; }
        .expert-img-container { position: relative; width: 100%; }
        .expert-portrait { width: 100%; height: 750px; object-fit: cover; border-radius: 0; filter: contrast(1.05); box-shadow: 40px 40px 0px var(--stone); }
        .expert-label { position: absolute; bottom: 40px; right: -40px; background: var(--ink); color: var(--paper); padding: 40px; min-width: 320px; box-shadow: var(--shadow-soft); z-index: 2; }
        .expert-label p { font-family: 'Instrument Serif', serif; font-size: 2.2rem; line-height: 1; margin-bottom: 8px; }
        .expert-label span { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.3em; color: var(--brass); font-weight: 700; }

        .expert-info { padding: 40px 0; }
        .expert-bio { font-size: 1.25rem; line-height: 1.8; margin-bottom: 30px; color: var(--text-main); }
        .expert-quote-box { margin-top: 60px; border-top: 1px solid rgba(0,0,0,0.1); padding-top: 40px; }
        .expert-quote-text { font-family: 'Instrument Serif', serif; font-size: 2.8rem; font-style: italic; color: var(--ink); line-height: 1.2; position: relative; }

        /* Services Grid - Modern Luxury */

        .services-grid-modern { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; }
        .service-card-premium { background: #111; padding: 60px 40px; border-radius: 2px; transition: var(--transition-smooth); border: 1px solid rgba(176, 141, 87, 0.1); }
        .service-card-premium:hover { transform: translateY(-10px); border-color: var(--brass); box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
        .card-cat { font-size: 0.65rem; text-transform: uppercase; color: var(--brass); letter-spacing: 0.2em; margin-bottom: 20px; display: block; font-weight: 700; }
        .service-card-premium h3 { color: #FFF; font-size: 1.6rem; margin-bottom: 20px; font-family: 'Instrument Serif', serif; }
        .service-card-premium p { color: rgba(255,255,255,0.6); font-size: 0.9rem; line-height: 1.8; }

        /* Report Section */
        .report-split { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 100px; align-items: center; }
        .report-list-premium { list-style: none; display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
        .report-list-premium li { font-size: 0.95rem; opacity: 0.8; padding-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); transition: 0.3s; }
        .report-list-premium li:hover { border-color: var(--brass); color: var(--brass); }

        .report-visual-card { background: #151515; height: 500px; border: 1px solid rgba(176, 141, 87, 0.3); display: flex; align-items: center; justify-content: center; position: relative; }
        .glass-overlay { text-align: center; }
        .glass-overlay span { font-size: 8rem; display: block; line-height: 1; font-weight: 300; }

        /* Testimonials LUX - Fixed Bottom Author */
        .testimonial-grid-premium { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
        .testimonial-card-lux { padding: 60px; background: var(--stone); border-radius: 2px; transition: 0.3s; display: flex; flex-direction: column; justify-content: space-between; min-height: 320px; }
        .testimonial-card-lux:hover { background: #FFF; box-shadow: var(--shadow-soft); }
        .testimonial-card-lux p { font-size: 1.2rem; line-height: 1.8; color: var(--text-main); font-family: 'Instrument Serif', serif; font-style: italic; margin-bottom: 30px; }
        .testi-author { border-top: 1px solid rgba(0,0,0,0.05); padding-top: 20px; margin-top: auto; }
        .author-name { display: block; font-weight: 700; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--ink); }
        .author-loc { font-size: 0.8rem; color: var(--brass); }

        .footer-expanded { background: var(--paper); border-top: var(--border-subtle); color: var(--ink); }
        .footer-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; gap: 40px; }
        .footer-col h4 { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 30px; color: var(--brass); font-weight: 700; }
        .footer-col a, .footer-col p { display: block; font-size: 0.9rem; color: var(--text-muted); margin-bottom: 15px; text-decoration: none; transition: 0.3s; }
        .footer-col a:hover { color: var(--ink); padding-left: 5px; }

        @media (max-width: 1000px) {
          .hero-modern, .report-split, .services-grid-modern, .testimonial-grid-premium, .footer-grid { grid-template-columns: 1fr; gap: 50px; }
          .hero-title { font-size: 3.5rem; }
          .report-list-premium { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
          .hero-modern { gap: 40px; }
          .hero-title { font-size: 3rem; }
          .section-header h2 { font-size: 2.8rem; }
          .expert-split { grid-template-columns: 1fr; gap: 60px; }
          .expert-portrait { height: 500px; }
          .expert-label { position: static; margin-top: -60px; margin-left: 20px; padding: 30px; min-width: auto; width: calc(100% - 40px); }
          .expert-quote-text { font-size: 2rem; }
          .report-visual-card { height: 350px; }

          .glass-overlay span { font-size: 5rem; }
        }

        @media (max-width: 480px) {
          .hero-title { font-size: 2.5rem; }
          .hero-description { font-size: 1rem; }
          .hero-actions { flex-direction: column; width: 100%; }
          .hero-actions button { width: 100%; }
          .section-header h2 { font-size: 2.2rem; }
          .service-card-premium { padding: 40px 25px; }
          .testimonial-card-lux { padding: 40px 25px; min-height: auto; }
          .expert-portrait { height: 400px; }
          .expert-label { padding: 25px; }
          .expert-label p { font-size: 1.8rem; }
          .expert-quote-text { font-size: 1.6rem; }
        }
      `}</style>
    </div>
  );
}

export default Home;
