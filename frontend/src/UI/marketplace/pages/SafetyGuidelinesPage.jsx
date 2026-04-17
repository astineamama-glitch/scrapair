import React, { useState, useEffect } from 'react';

const C = { bright: '#64ff43', darker: '#0a2e03', surface: '#0d3806', border: 'rgba(100,255,67,0.18)', text: '#e6ffe0', textMid: 'rgba(230,255,224,0.55)' };

const SafetyGuidelinesPage = () => {
  const guidelines = [
    { title: 'Verify Before Trading', desc: 'Always verify material quantities and conditions before pickup.' },
    { title: 'Safe Handling', desc: 'Use appropriate protective equipment when handling waste materials.' },
    { title: 'Secure Transactions', desc: 'Complete all transactions through the platform for protection.' },
    { title: 'Report Suspicious Activity', desc: 'Use the report feature to flag inappropriate behavior or listings.' },
    { title: 'Privacy Protection', desc: 'Never share personal information outside the platform messaging.' },
    { title: 'Scheduled Meetups', desc: 'Always schedule pickups at agreed-upon times and locations.' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.darker, color: C.text, padding: '40px', fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
      <h1 style={{ fontSize: 40, fontWeight: 900, margin: '0 0 12px', letterSpacing: '-0.5px' }}>Safety Guidelines</h1>
      <p style={{ fontSize: 16, color: C.textMid, margin: '0 0 40px', maxWidth: 600 }}>Follow these guidelines to ensure a safe and secure experience on ScraPair.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        {guidelines.map((guide, i) => (
          <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
            <div style={{ width: 48, height: 48, background: 'rgba(100,255,67,0.15)', border: `1px solid ${C.border}`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: C.bright, marginBottom: 16 }}>
              {i + 1}
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 800 }}>{guide.title}</h3>
            <p style={{ margin: 0, fontSize: 14, color: C.textMid, lineHeight: 1.6 }}>{guide.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 48, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, textAlign: 'center' }}>
        <h3>Need Help?</h3>
        <p style={{ color: C.textMid, margin: '12px 0' }}>Contact our support team for any safety concerns.</p>
        <button style={{ padding: '10px 20px', background: C.bright, color: '#062400', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Contact Support</button>
      </div>
    </div>
  );
};

export default SafetyGuidelinesPage;
