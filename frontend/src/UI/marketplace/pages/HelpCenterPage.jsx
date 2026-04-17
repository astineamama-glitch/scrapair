import React, { useState, useEffect } from 'react';

const C = { bright: '#64ff43', darker: '#0a2e03', surface: '#0d3806', border: 'rgba(100,255,67,0.18)', text: '#e6ffe0', textMid: 'rgba(230,255,224,0.55)' };

const HelpCenterPage = () => {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const faqs = [
    { q: 'How do I post waste materials?', a: 'Go to your Business Dashboard and click "Post Waste Materials". Fill in the form with material details, upload images, and submit.' },
    { q: 'How are prices determined?', a: 'Your local recycler network determines prices based on material type, quantity, and current market rates.' },
    { q: 'Can I cancel a collection request?', a: 'Yes, you can cancel requests up to 24 hours before the scheduled pickup.' },
    { q: 'How do ratings work?', a: 'Both businesses and recyclers rate each other after completed transactions. Ratings help build community trust.' },
    { q: 'What payment methods are accepted?', a: 'We support bank transfers, credit cards, and digital wallets for all transactions.' },
    { q: 'How do I report a problem?', a: 'Use the report feature in the marketplace or contact our support team directly.' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.darker, color: C.text, padding: '40px', fontFamily: "'DM Sans','Helvetica Neue',sans-serif", maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontSize: 40, fontWeight: 900, margin: '0 0 12px' }}>Help Center</h1>
      <p style={{ fontSize: 16, color: C.textMid, margin: '0 0 40px' }}>Find answers to common questions.</p>

      <div style={{ display: 'grid', gap: 12 }}>
        {faqs.map((faq, i) => (
          <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
            <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)} style={{ width: '100%', padding: '16px 20px', background: 'transparent', border: 'none', color: C.text, cursor: 'pointer', textAlign: 'left', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14 }}>
              <span>{faq.q}</span>
              <span style={{ fontSize: 16, transition: 'transform 0.2s', transform: expandedFaq === i ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
            </button>
            {expandedFaq === i && (
              <div style={{ padding: '0 20px 16px', borderTop: `1px solid ${C.border}`, color: C.textMid, fontSize: 14, lineHeight: 1.6 }}>
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 40, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, textAlign: 'center' }}>
        <h3>Didn't find your answer?</h3>
        <p style={{ color: C.textMid, margin: '12px 0' }}>Contact our support team for additional assistance.</p>
        <button style={{ padding: '10px 24px', background: C.bright, color: '#062400', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Email Support</button>
      </div>
    </div>
  );
};

export default HelpCenterPage;
