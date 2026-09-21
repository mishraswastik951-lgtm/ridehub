import React from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const TermsAndConditionsView: React.FC = () => {
  const { setCurrentView } = useApp();

  return (
    <div style={{ backgroundColor: 'var(--color-canvas)', minHeight: '85vh', padding: '3.5rem 0 6rem 0' }}>
      <div className="container" style={{ maxWidth: 840 }}>
        {/* Navigation back */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <button
            type="button"
            onClick={() => setCurrentView('landing')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--color-ink)',
              fontSize: '0.88rem',
              fontWeight: 600,
              background: 'none'
            }}
          >
            <ArrowLeft size={16} />
            <span>Return to Home</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => window.print()}
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
          >
            <Printer size={15} />
            <span>Print Terms</span>
          </button>
        </div>

        {/* Editorial Terms Document */}
        <div
          className="card"
          style={{
            padding: 'clamp(2rem, 5vw, 4rem)',
            backgroundColor: '#FFFFFF',
            boxShadow: 'var(--shadow-md)',
            lineHeight: 1.7,
            color: 'var(--color-ink)'
          }}
        >
          <div style={{ borderBottom: '2px solid var(--color-ink)', paddingBottom: '1.5rem', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-brand)', fontWeight: 700 }}>
              Legal Agreement
            </span>
            <h1 style={{ fontSize: '2.4rem', margin: '0.3rem 0' }}>TERMS AND CONDITIONS</h1>
            {/* Sensible defaults filled for brackets per quality checklist */}
            <span style={{ fontSize: '0.88rem', color: 'var(--color-ink-muted)' }}>
              Last updated: September 21, 2026
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', fontSize: '0.95rem' }}>
            <p>
              Please read these Terms and Conditions ("Terms") carefully before using
              HubX (the "Platform"). By creating an account or using the Platform, you
              agree to be bound by these Terms. If you do not agree, do not use the
              Platform.
            </p>

            <h2 style={{ fontSize: '1.4rem', marginTop: '1rem', color: 'var(--color-brand)' }}>
              1. WHO WE ARE
            </h2>
            <p>
              HubX is a platform that connects Customers seeking to rent scooters,
              bikes, and cars ("Vehicles") with independent rental shops ("Shopkeepers").
              HubX is not itself a vehicle rental company: Shopkeepers are independent
              businesses responsible for the Vehicles they list, and rental agreements
              are between the Customer and the Shopkeeper. HubX facilitates discovery,
              verification, booking, payment, and dispute-support tools.
            </p>

            <h2 style={{ fontSize: '1.4rem', marginTop: '1rem', color: 'var(--color-brand)' }}>
              2. ELIGIBILITY AND ACCOUNTS
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p>
                2.1 You must be at least 18 years old and hold a valid driving licence
                appropriate to the Vehicle category you wish to rent.
              </p>
              <p>
                2.2 You must provide accurate, current information when creating an
                account, including a valid email address and phone number, both verified
                by one-time password (OTP).
              </p>
              <p>
                2.3 Each phone number may be linked to only one verified identity. Creating
                multiple accounts to bypass this restriction, to repeatedly claim
                promotional trials, or for any other fraudulent purpose is prohibited and
                may result in suspension or termination of your account.
              </p>
              <p>
                2.4 You are responsible for maintaining the confidentiality of your account
                credentials and for all activity under your account.
              </p>
            </div>

            <h2 style={{ fontSize: '1.4rem', marginTop: '1rem', color: 'var(--color-brand)' }}>
              3. DOCUMENT VERIFICATION
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p>
                3.1 Customers must upload a valid driving licence and government-issued ID
                before booking a Vehicle. You confirm that all documents and information
                you submit are genuine, current, and belong to you.
              </p>
              <p>
                3.2 Submitting fraudulent, altered, or another person's documents is
                strictly prohibited and will result in immediate account termination and
                may be reported to relevant authorities.
              </p>
            </div>

            <h2 style={{ fontSize: '1.4rem', marginTop: '1rem', color: 'var(--color-brand)' }}>
              4. BOOKINGS, PAYMENTS, AND PRICING
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p>
                4.1 Prices shown for a Vehicle may vary based on demand, day of the week,
                season, festival periods, how far in advance you book, and available
                inventory ("Dynamic Pricing"). The final price is shown to you before
                payment is confirmed, and confirming payment constitutes acceptance of that
                price.
              </p>
              <p>
                4.2 Payments are processed through third-party payment providers. HubX does
                not store your full payment card or bank account details.
              </p>
              <p>
                4.3 A security deposit may be required for certain bookings and is refunded
                according to the Shopkeeper's stated damage policy, subject to any
                deductions for verified damage, traffic violations, or late return, as
                documented through the Platform's before/after vehicle condition record.
              </p>
            </div>

            <h2 style={{ fontSize: '1.4rem', marginTop: '1rem', color: 'var(--color-brand)' }}>
              5. RENTAL EXTENSIONS
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p>
                5.1 You may request to extend an active rental through the Platform,
                subject to instant payment for the additional period.
              </p>
              <p>
                5.2 If the Vehicle is already reserved by another Customer for the period
                you wish to extend into, the extension will be declined. The Platform may
                offer a replacement Vehicle from a nearby participating shop where
                available; acceptance of a replacement is optional.
              </p>
            </div>

            <h2 style={{ fontSize: '1.4rem', marginTop: '1rem', color: 'var(--color-brand)' }}>
              6. CANCELLATIONS AND REFUNDS
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p>
                6.1 Refunds for cancellations made before pickup are calculated based on
                the proportion of time elapsed between the time of booking and the
                scheduled pickup time, as follows:
              </p>
              <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <li>Cancelled within the first 25% of that time period: 100% refund.</li>
                <li>Cancelled within 50% of that time period: 50% refund.</li>
                <li>Cancelled after 50% of that time period has elapsed, up to pickup: no refund.</li>
              </ul>
              <p>
                6.2 No refund is provided for cancellations made after the scheduled
                pickup time or for early returns, except where required by law or at the
                Shopkeeper's discretion.
              </p>
            </div>

            <h2 style={{ fontSize: '1.4rem', marginTop: '1rem', color: 'var(--color-brand)' }}>
              7. HUBX SUBSCRIPTION (SHOPKEEPERS)
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p>
                7.1 Shopkeepers may list Vehicles on the Platform by subscribing to HubX.
                New Shopkeepers receive one month free; thereafter, a Monthly, 6-Month, or
                Yearly plan applies, at the pricing displayed on the Platform at the time
                of subscription, which may change with notice.
              </p>
              <p>
                7.2 HubX benefits include the HubX label, priority listing placement,
                access to the rewards program, the AI-powered dashboard, dynamic pricing
                tools, and eligibility for premium delivery, as described on the
                Platform at the time of subscription.
              </p>
              <p>
                7.3 Shopkeepers are solely responsible for the accuracy of their listings,
                the condition and legal roadworthiness of their Vehicles, applicable
                insurance, and compliance with local laws governing vehicle rental.
              </p>
              <p>
                7.4 HubX reserves the right to suspend or remove a listing or subscription
                for violation of these Terms, repeated verified customer complaints, or
                fraudulent activity.
              </p>
            </div>

            <h2 style={{ fontSize: '1.4rem', marginTop: '1rem', color: 'var(--color-brand)' }}>
              8. REWARDS, POINTS, AND SPONSOR COUPONS
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p>
                8.1 Points earned on HubX-labeled rentals may be redeemed for discounts on
                future HubX rentals, subject to redemption caps disclosed on the Platform.
                Points have no cash value and are non-transferable.
              </p>
              <p>
                8.2 Coupons offered by third-party hotel sponsors are provided by those
                sponsors and subject to their own terms and availability. HubX is not
                responsible for the fulfillment of sponsor offers.
              </p>
              <p>
                8.3 HubX may modify, suspend, or discontinue the rewards program at any
                time, with reasonable notice where practicable.
              </p>
            </div>

            <h2 style={{ fontSize: '1.4rem', marginTop: '1rem', color: 'var(--color-brand)' }}>
              9. TRUST SCORES AND RATINGS
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p>
                9.1 Trust scores are calculated from data including verified rental
                outcomes, dispute history, and customer feedback, as described on the
                Platform. Trust scores are provided as a general guide and do not
                guarantee the condition, safety, or performance of any Vehicle or
                Shopkeeper.
              </p>
              <p>
                9.2 Reviews and ratings must be honest and based on an actual rental
                experience. HubX may remove reviews that are fraudulent, abusive, or
                violate applicable law.
              </p>
            </div>

            <h2 style={{ fontSize: '1.4rem', marginTop: '1rem', color: 'var(--color-brand)' }}>
              10. PROHIBITED CONDUCT
            </h2>
            <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li>Provide false information or impersonate another person.</li>
              <li>
                Use a rented Vehicle for any illegal purpose, racing, or in violation of
                traffic laws.
              </li>
              <li>Sublet or transfer a rented Vehicle to a third party.</li>
              <li>
                Attempt to circumvent Platform payments, verification, or the one-phone-
                per-identity rule.
              </li>
              <li>Interfere with the operation or security of the Platform.</li>
            </ul>

            <h2 style={{ fontSize: '1.4rem', marginTop: '1rem', color: 'var(--color-brand)' }}>
              11. LIABILITY
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p>
                11.1 To the maximum extent permitted by law, HubX acts as an intermediary
                platform and is not liable for the acts or omissions of Shopkeepers or
                Customers, the condition of any Vehicle, or any accident, injury, or loss
                arising from a rental arranged through the Platform.
              </p>
              <p>
                11.2 HubX's total liability arising out of or relating to these Terms or
                your use of the Platform shall not exceed the total fees paid by you to
                HubX (excluding amounts paid to Shopkeepers) in the three months preceding
                the claim, except where such limitation is not permitted by law.
              </p>
            </div>

            <h2 style={{ fontSize: '1.4rem', marginTop: '1rem', color: 'var(--color-brand)' }}>
              12. TERMINATION
            </h2>
            <p>
              We may suspend or terminate your account at any time for violation of
              these Terms, fraudulent activity, or as required by law. You may close
              your account at any time by contacting support, subject to settlement of
              any outstanding bookings or payments.
            </p>

            <h2 style={{ fontSize: '1.4rem', marginTop: '1rem', color: 'var(--color-brand)' }}>
              13. CHANGES TO THESE TERMS
            </h2>
            <p>
              We may update these Terms from time to time. Continued use of the Platform
              after changes take effect constitutes acceptance of the updated Terms. We
              will update the "Last updated" date above and, for material changes, notify
              you through the Platform or by email.
            </p>

            <h2 style={{ fontSize: '1.4rem', marginTop: '1rem', color: 'var(--color-brand)' }}>
              14. GOVERNING LAW
            </h2>
            <p>
              These Terms are governed by the laws of India and Karnataka, without regard to
              its conflict of law principles, and any disputes shall be subject to the
              exclusive jurisdiction of the courts located in Bengaluru, Karnataka, India.
            </p>

            <h2 style={{ fontSize: '1.4rem', marginTop: '1rem', color: 'var(--color-brand)' }}>
              15. CONTACT US
            </h2>
            <p>Questions about these Terms can be sent to:</p>
            <div style={{ backgroundColor: 'var(--color-canvas)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-sm)' }}>
              <strong>RideHub Technologies Private Limited</strong><br />
              100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038, India<br />
              Email: <strong>legal@ridehub.co</strong> / <strong>support@ridehub.co</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
