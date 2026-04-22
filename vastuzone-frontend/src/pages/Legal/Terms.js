import React from 'react';
import Navbar from '../../components/Navbar';

const Terms = () => {
  return (
    <div className="legal-page">
      <Navbar />
      <div className="container section-padding">
        <header className="legal-header">
          <h1 className="serif">Terms of Service</h1>
          <p className="text-muted">Last updated: April 22, 2026</p>
        </header>
        
        <div className="legal-content">
          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing and using VastuZone, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
          </section>

          <section>
            <h2>2. Description of Service</h2>
            <p>VastuZone provides architectural and Vastu compliance analysis through rule-based scoring and expert consultation. Our reports are for informational and consulting purposes.</p>
          </section>

          <section>
            <h2>3. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials. You must be at least 18 years old to use this service.</p>
          </section>

          <section>
            <h2>4. Payments and Refunds</h2>
            <p>Payments for consultations are processed through Razorpay. Refunds are handled on a case-by-case basis as per our refund policy.</p>
          </section>

          <section>
            <h2>5. Limitation of Liability</h2>
            <p>VastuZone and its experts are not liable for any structural or financial decisions made based on the Vastu reports provided.</p>
          </section>
        </div>
      </div>

      <style>{`
        .legal-header { margin-bottom: 60px; border-bottom: 1px solid var(--stone); padding-bottom: 30px; }
        .legal-header h1 { font-size: 3.5rem; margin-bottom: 10px; }
        .legal-content section { margin-bottom: 40px; }
        .legal-content h2 { font-size: 1.8rem; margin-bottom: 15px; color: var(--ink); }
        .legal-content p { line-height: 1.8; color: var(--text-main); font-size: 1.1rem; }
      `}</style>
    </div>
  );
};

export default Terms;
