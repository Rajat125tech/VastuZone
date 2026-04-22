import React from 'react';
import Navbar from '../../components/Navbar';

const Privacy = () => {
  return (
    <div className="legal-page">
      <Navbar />
      <div className="container section-padding">
        <header className="legal-header">
          <h1 className="serif">Privacy Policy</h1>
          <p className="text-muted">Last updated: April 22, 2026</p>
        </header>
        
        <div className="legal-content">
          <section>
            <h2>1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as when you create an account, upload property details, or communicate with our experts.</p>
          </section>

          <section>
            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to provide, maintain, and improve our services, including performing Vastu analysis and facilitating consultations.</p>
          </section>

          <section>
            <h2>3. Data Security</h2>
            <p>We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access.</p>
          </section>

          <section>
            <h2>4. Sharing of Information</h2>
            <p>We do not share your personal information with third parties except as described in this policy or with your consent.</p>
          </section>

          <section>
            <h2>5. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at support@vastuzone.com.</p>
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

export default Privacy;
