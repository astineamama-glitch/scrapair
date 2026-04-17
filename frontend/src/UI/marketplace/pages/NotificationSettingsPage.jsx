import React, { useState, useEffect } from 'react';

const C = { bright: '#64ff43', darker: '#0a2e03', surface: '#0d3806', border: 'rgba(100,255,67,0.18)', text: '#e6ffe0', textMid: 'rgba(230,255,224,0.55)' };

const NotificationSettingsPage = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    collectionAlerts: true,
    messageAlerts: true,
    ratingAlerts: true,
  });
  const [saved, setSaved] = useState(false);

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      // API call to save settings
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.darker, color: C.text, padding: '40px', fontFamily: "'DM Sans','Helvetica Neue',sans-serif", maxWidth: 600, margin: '0 auto' }}>
      <h2>Notification Settings</h2>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
        {Object.entries(settings).map(([key, value]) => (
          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: `1px solid ${C.border}` }}>
            <label style={{ fontWeight: 700, textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1').trim()}</label>
            <button onClick={() => handleToggle(key)} style={{ padding: '4px 12px', background: value ? C.bright : C.border, color: value ? '#062400' : C.text, border: 'none', borderRadius: 100, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
              {value ? 'On' : 'Off'}
            </button>
          </div>
        ))}
      </div>

      <button onClick={handleSave} style={{ marginTop: 24, width: '100%', padding: '12px', background: C.bright, color: '#062400', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
        Save Settings
      </button>

      {saved && <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(100,255,67,0.1)', color: C.bright, borderRadius: 6, textAlign: 'center' }}>✓ Settings saved!</div>}
    </div>
  );
};

export default NotificationSettingsPage;
