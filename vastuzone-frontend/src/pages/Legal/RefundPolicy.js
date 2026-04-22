import React from 'react';
import Navbar from '../../components/Navbar';

const RefundPolicy = () => {
  return (
    <div className="legal-page">
      <Navbar />
      <div className="container section-padding">
        <header className="legal-header">
          <h1 className="serif">Refund & Cancellation Policy</h1>
          <p className="text-muted">Last updated: April 22, 2026</p>
        </header>
        
        <div className="legal-content">
          <section>
            <h2>1. Consultation Bookings</h2>
            <p>Once a consultation is booked and payment is made, the appointment slot is reserved specifically for you. You may reschedule your appointment up to 24 hours before the scheduled time at no extra cost.</p>
          </section>

          <section>
            <h2>2. Cancellation & Refunds</h2>
            <p>If you wish to cancel your consultation, please notify us at least 48 hours in advance. Cancellations made 48 hours before the appointment are eligible for a 90% refund (10% processing fee deducted).</p>
            <p>Cancellations made between 24 and 48 hours before the appointment are eligible for a 50% refund.</p>
            <p>Cancellations made less than 24 hours before the appointment or "no-shows" are not eligible for a refund.</p>
          </section>

          <section>
            <h2>3. Service Satisfaction</h2>
            <p>As our service involves professional consulting and time, we do not offer refunds once the consultation has been conducted or the final Vastu report has been delivered.</p>
          </section>

          <section>
            <h2>4. Processing Refunds</h2>
            <p>Approved refunds will be processed through Razorpay and will typically reflect in your original payment method within 5-7 business days.</p>
          </section>

          <section>
            <h2>5. Contact for Support</h2>
            <p>For any refund-related queries, please email us at payments@vastuzone.com with your Appointment Reference Number.</p>
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

export default RefundPolicy;
