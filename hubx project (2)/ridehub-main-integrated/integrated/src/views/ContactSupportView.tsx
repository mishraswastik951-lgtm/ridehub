import React, { useState } from 'react';
import {
  ArrowLeft,
  PhoneCall,
  Mail,
  MapPin,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Send,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ContactSupportView: React.FC = () => {
  const { setCurrentView, currentUser, addToast } = useApp();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How and when is my security deposit refunded?',
      a: 'Your security deposit is refunded automatically to your linked UPI account within 2 hours after vehicle drop-off inspection. Under HubX rules, shops cannot make arbitrary deductions—any claim must be supported by comparing before/after digital walkaround records.'
    },
    {
      q: 'What happens if I need to extend my rental but the vehicle is already booked?',
      a: 'If another customer has reserved your vehicle for the next slot, our system will block the direct extension and automatically present an available replacement vehicle from a nearby partner HubX shop with a 1-click transition flow.'
    },
    {
      q: 'How are cancellation refunds calculated?',
      a: 'Refunds depend on the proportion of time elapsed between booking confirmation and your scheduled pickup: Cancelled within the first 25% of the lead time = 100% refund. Within 50% = 50% refund. After 50% has elapsed = no refund.'
    },
    {
      q: 'Do I need to leave my physical driving licence with the shopkeeper?',
      a: 'Never. Once you complete the digital verification flow on RideHub, your credential is cryptographically verified against the national transport database. Shopkeepers are strictly prohibited from holding physical customer IDs.'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    addToast({
      type: 'success',
      title: 'Support Ticket Created',
      message: 'Our dispatch desk has received your request. Expect a reply in < 5 minutes.'
    });
  };

  return (
    <div style={{ backgroundColor: 'var(--color-canvas)', minHeight: '85vh', padding: '3.5rem 0 6rem 0' }}>
      <div className="container" style={{ maxWidth: 880 }}>
        {/* Navigation back */}
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
            marginBottom: '1.75rem',
            background: 'none'
          }}
        >
          <ArrowLeft size={16} />
          <span>Return to Home</span>
        </button>

        {/* Title */}
        <div style={{ marginBottom: '3rem' }}>
          <span className="badge badge-brand" style={{ marginBottom: '0.5rem' }}>
            Rider & Shopkeeper Desk
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', letterSpacing: '-0.02em', margin: '0.2rem 0' }}>
            Help & Emergency Support
          </h1>
          <p style={{ color: 'var(--color-ink-muted)', fontSize: '1rem' }}>
            24/7 Roadside breakdown dispatch, dispute mediation, and general rental inquiries.
          </p>
        </div>

        {/* 24/7 Emergency Breakdown Card */}
        <div
          className="card"
          style={{
            padding: '2rem',
            backgroundColor: '#FFFFFF',
            borderLeft: '4px solid var(--color-accent)',
            marginBottom: '3rem',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-accent)', marginBottom: '0.25rem' }}>
                <PhoneCall size={18} />
                <strong style={{ fontSize: '1.1rem' }}>Active Roadside Emergency Hotline</strong>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-ink-muted)', margin: 0 }}>
                Stranded on the highway, mechanical failure, or puncture? Our rapid-response van arrives in under 25 minutes.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <a
                href="tel:1800123456"
                className="btn btn-accent"
                style={{ padding: '0.75rem 1.4rem' }}
              >
                <span>Call 1800-RIDE-HUB</span>
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form & Office Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2.5rem',
            marginBottom: '4rem'
          }}
        >
          {/* Inquiry Form */}
          <div className="card" style={{ padding: '2rem', backgroundColor: '#FFFFFF' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Open a Support Ticket</h3>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    defaultValue={currentUser.fullName}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Email or Mobile Number
                  </label>
                  <input
                    type="text"
                    required
                    defaultValue={currentUser.phone}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Subject / Category
                  </label>
                  <select
                    className="input-field"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  >
                    <option value="Deposit Refund Inquiry">Deposit Refund Inquiry</option>
                    <option value="Booking Extension Question">Booking Extension Question</option>
                    <option value="Shopkeeper HubX Onboarding">Shopkeeper HubX Onboarding</option>
                    <option value="Damage Dispute Mediation">Damage Dispute Mediation</option>
                    <option value="Other">Other Inquiry</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Detailed Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your issue or booking ID..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="input-field"
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    style={{ accentColor: 'var(--color-accent)' }}
                  />
                  <span>Mark as active rental urgent (escalates ticket to live phone desk)</span>
                </label>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}
                >
                  <Send size={16} />
                  <span>Submit Ticket</span>
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <CheckCircle2 size={42} color="var(--color-trust)" style={{ margin: '0 auto 1rem auto' }} />
                <h4 style={{ fontSize: '1.2rem', marginBottom: '0.35rem' }}>Ticket Received!</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-ink-muted)' }}>
                  Our agent will respond to {currentUser.phone} shortly.
                </p>
              </div>
            )}
          </div>

          {/* Contact Details & Headquarters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '2rem', backgroundColor: '#FFFFFF' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Regional Support Centers</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <MapPin size={18} color="var(--color-brand)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong style={{ display: 'block' }}>Bengaluru Headquarters</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-ink-muted)' }}>
                      100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <Mail size={18} color="var(--color-brand)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong style={{ display: 'block' }}>Email Support Channels</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-ink-muted)' }}>
                      General: support@ridehub.co<br />
                      Shopkeeper HubX: partners@ridehub.co
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--color-canvas-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--color-trust)' }}>
                <ShieldCheck size={18} />
                <strong style={{ fontSize: '0.9rem' }}>Dispute Mediation Guarantee</strong>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-ink-muted)', margin: 0, lineHeight: 1.5 }}>
                If a shopkeeper holds any deposit amount that you believe is unwarranted, RideHub's neutral escrow arbitration team steps in within 12 hours.
              </p>
            </div>
          </div>
        </div>

        {/* FAQs Accordion */}
        <div>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>
            Frequently Asked Questions
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;

              return (
                <div
                  key={idx}
                  className="card"
                  style={{
                    backgroundColor: '#FFFFFF',
                    overflow: 'hidden',
                    cursor: 'pointer'
                  }}
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                >
                  <div
                    style={{
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <strong style={{ fontSize: '0.95rem', color: 'var(--color-ink)' }}>
                      {faq.q}
                    </strong>
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>

                  {isOpen && (
                    <div
                      style={{
                        padding: '0 1.5rem 1.25rem 1.5rem',
                        fontSize: '0.88rem',
                        color: 'var(--color-ink-muted)',
                        lineHeight: 1.6,
                        borderTop: '1px solid var(--color-canvas)'
                      }}
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
