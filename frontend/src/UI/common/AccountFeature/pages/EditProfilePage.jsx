import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import userService from '../../../../services/userService';
import DeleteAccountModal from '../../../../components/DeleteAccountModal';

const C = {
  bright: '#64ff43',
  darker: '#0a2e03',
  surface: '#0d3806',
  border: 'rgba(100,255,67,0.18)',
  borderHover: 'rgba(100,255,67,0.45)',
  text: '#e6ffe0',
  textMid: 'rgba(230,255,224,0.55)',
  textLow: 'rgba(230,255,224,0.3)',
  error: '#ff6b6b',
  errorBg: 'rgba(255,107,107,0.1)',
  errorBorder: 'rgba(255,107,107,0.3)',
  success: '#4ade80',
  successBg: 'rgba(74,222,128,0.1)',
  successBorder: 'rgba(74,222,128,0.3)',
};

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [focusedField, setFocusedField] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    businessName: '',
    companyName: '',
    specialization: '',
  });

  useEffect(() => {
    const mm = (e) => setMouse({ x: e.clientX, y: e.clientY });
    const sc = () => setScrollY(window.scrollY);
    window.addEventListener('mousemove', mm);
    window.addEventListener('scroll', sc);
    return () => {
      window.removeEventListener('mousemove', mm);
      window.removeEventListener('scroll', sc);
    };
  }, []);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await userService.getProfile();
      const profileData = response.user || response.data;
      setFormData({
        email: profileData.email || '',
        phone: profileData.phone || '',
        businessName: profileData.businessName || '',
        companyName: profileData.companyName || '',
        specialization: profileData.specialization || '',
      });
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const updateData = { phone: formData.phone };
      if (user?.type === 'business') {
        updateData.businessName = formData.businessName;
      } else if (user?.type === 'recycler') {
        updateData.companyName = formData.companyName;
        updateData.specialization = formData.specialization;
      }

      await userService.updateProfile(updateData);
      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        navigate(user?.type === 'business' ? '/business/dashboard' : '/recycler/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    setChangingPassword(true);
    try {
      await userService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordSuccess('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setShowChangePassword(false), 1500);
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password. Please try again.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccountSuccess = () => {
    setShowDeleteModal(false);
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.darker, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans','Helvetica Neue','Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol',sans-serif", color: C.text }}>
        <div>Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: C.darker, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans','Helvetica Neue','Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol',sans-serif", color: C.text }}>
        <p>Please login to edit your profile.</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: C.darker, fontFamily: "'DM Sans','Helvetica Neue','Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol',sans-serif", overflowX: 'hidden', color: C.text }}>
      <div style={{ position: 'fixed', top: mouse.y - 320, left: mouse.x - 320, width: 640, height: 640, background: 'radial-gradient(circle, rgba(100,255,67,0.055) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0, transition: 'top 0.35s ease, left 0.35s ease' }} />
      <div style={{ position: 'fixed', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E")`, pointerEvents: 'none', zIndex: 1 }} />

      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: scrollY > 60 ? 'rgba(10,46,3,0.93)' : 'transparent', backdropFilter: scrollY > 60 ? 'blur(28px)' : 'none', borderBottom: scrollY > 60 ? `1px solid ${C.border}` : '1px solid transparent', transition: 'all 0.35s ease' }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: '18px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate(-1)}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(100,255,67,0.12)', border: '1px solid rgba(100,255,67,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2zm0 2a6 6 0 0 1 5.917 5H10V4zm-1 0v5H3.083A6 6 0 0 1 9 4zM3.444 11H9v5.472A6.002 6.002 0 0 1 3.444 11zm6.556 5.472V11h5.556A6.002 6.002 0 0 1 10 16.472z" fill={C.bright}/>
              </svg>
            </div>
            <span style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.5px', color: C.text }}>ScraPair</span>
          </div>
          <button onClick={() => navigate(-1)} style={{ padding: '10px 24px', fontSize: 14, fontWeight: 700, borderRadius: 100, border: 'none', background: C.bright, color: '#082800', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 0 16px rgba(100,255,67,0.35)' }} onMouseEnter={e => { e.target.style.boxShadow = '0 0 28px rgba(100,255,67,0.6)'; e.target.style.transform = 'translateY(-1px)'; }} onMouseLeave={e => { e.target.style.boxShadow = '0 0 16px rgba(100,255,67,0.35)'; e.target.style.transform = 'translateY(0)'; }}>? Back</button>
        </div>
      </nav>

      <section style={{ maxWidth: 700, margin: '0 auto', padding: '60px 40px', position: 'relative', zIndex: 2 }}>
        <div style={{ marginBottom: 60 }}>
          <div style={{ fontSize: 12, color: C.bright, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 16 }}>Settings</div>
          <h1 style={{ fontSize: 48, fontWeight: 900, lineHeight: 1.08, letterSpacing: '-2px', margin: '0 0 12px', color: C.text }}>Edit Profile</h1>
          <p style={{ fontSize: 16, color: C.textMid, margin: 0 }}>{user.type === 'business' ? '👔 Business Account' : '♻️ Recycler Account'}</p>
        </div>

        {error && <div style={{ background: C.errorBg, border: `1px solid ${C.errorBorder}`, borderRadius: 16, padding: '16px 20px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}><svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}><circle cx="10" cy="10" r="9" stroke={C.error} strokeWidth="2"/><path d="M10 6v4M10 14h.01" stroke={C.error} strokeWidth="2" strokeLinecap="round"/></svg><span style={{ fontSize: 14, color: C.error, fontWeight: 500 }}>{error}</span></div>}
        {success && <div style={{ background: C.successBg, border: `1px solid ${C.successBorder}`, borderRadius: 16, padding: '16px 20px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}><svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}><path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4z" fill={C.success}/></svg><span style={{ fontSize: 14, color: C.success, fontWeight: 500 }}>{success}</span></div>}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 24, marginBottom: 60 }}>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 24, padding: 40, display: 'grid', gap: 24 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 10, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Email Address</label>
              <input type="email" value={formData.email} disabled style={{ width: '100%', padding: '12px 16px', border: `1px solid ${C.border}`, borderRadius: 14, background: 'rgba(100,255,67,0.02)', color: C.textLow, fontSize: 14, boxSizing: 'border-box', cursor: 'not-allowed' }} />
              <small style={{ display: 'block', marginTop: 6, color: C.textLow, fontSize: 12 }}>Email cannot be changed</small>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 10, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Phone Number</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} onFocus={() => setFocusedField('phone')} onBlur={() => setFocusedField(null)} required placeholder="e.g., +1234567890" style={{ width: '100%', padding: '12px 16px', border: `1px solid ${focusedField === 'phone' ? C.borderHover : C.border}`, borderRadius: 14, background: 'rgba(100,255,67,0.03)', color: C.text, fontSize: 14, boxSizing: 'border-box', transition: 'all 0.2s ease', outline: 'none', boxShadow: focusedField === 'phone' ? `0 0 0 3px rgba(100,255,67,0.1)` : 'none' }} />
            </div>

            {user.type === 'business' && <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 10, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Business Name</label>
              <input type="text" name="businessName" value={formData.businessName} disabled style={{ width: '100%', padding: '12px 16px', border: `1px solid ${C.border}`, borderRadius: 14, background: 'rgba(100,255,67,0.02)', color: C.textLow, fontSize: 14, boxSizing: 'border-box', cursor: 'not-allowed' }} />
              <small style={{ display: 'block', marginTop: 6, color: C.textLow, fontSize: 12 }}>Business name cannot be changed</small>
            </div>}

            {user.type === 'recycler' && <>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 10, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Company Name</label>
                <input type="text" name="companyName" value={formData.companyName} disabled style={{ width: '100%', padding: '12px 16px', border: `1px solid ${C.border}`, borderRadius: 14, background: 'rgba(100,255,67,0.02)', color: C.textLow, fontSize: 14, boxSizing: 'border-box', cursor: 'not-allowed' }} />
                <small style={{ display: 'block', marginTop: 6, color: C.textLow, fontSize: 12 }}>Company name cannot be changed</small>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 10, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Specialization</label>
                <input type="text" name="specialization" value={formData.specialization} onChange={handleChange} onFocus={() => setFocusedField('specialization')} onBlur={() => setFocusedField(null)} placeholder="e.g., Plastic, Metal, Electronics" style={{ width: '100%', padding: '12px 16px', border: `1px solid ${focusedField === 'specialization' ? C.borderHover : C.border}`, borderRadius: 14, background: 'rgba(100,255,67,0.03)', color: C.text, fontSize: 14, boxSizing: 'border-box', transition: 'all 0.2s ease', outline: 'none', boxShadow: focusedField === 'specialization' ? `0 0 0 3px rgba(100,255,67,0.1)` : 'none' }} />
                <small style={{ display: 'block', marginTop: 6, color: C.textLow, fontSize: 12 }}>What materials do you specialize in?</small>
              </div>
            </>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <button type="button" onClick={() => navigate(-1)} style={{ padding: '14px 24px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 14, color: C.bright, fontSize: 14, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.target.style.borderColor = C.borderHover; e.target.style.background = 'rgba(100,255,67,0.08)'; }} onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.background = 'transparent'; }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ padding: '14px 24px', background: saving ? 'linear-gradient(135deg, rgba(100,255,67,0.4), rgba(100,255,67,0.3))' : `linear-gradient(135deg, ${C.bright}, #4de029)`, border: 'none', borderRadius: 14, color: '#062400', fontSize: 14, fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer', transition: 'all 0.22s', boxShadow: saving ? '0 0 0 0px transparent, 0 4px 16px rgba(100,255,67,0.2)' : '0 0 0 0px transparent, 0 8px 24px rgba(100,255,67,0.35)', transform: saving ? 'scale(0.98)' : 'scale(1)' }} onMouseEnter={e => { if (!saving) { e.target.style.boxShadow = '0 0 0 5px rgba(100,255,67,0.15), 0 12px 36px rgba(100,255,67,0.5)'; e.target.style.transform = 'translateY(-2px) scale(1.01)'; } }} onMouseLeave={e => { if (!saving) { e.target.style.boxShadow = '0 0 0 0px transparent, 0 8px 24px rgba(100,255,67,0.35)'; e.target.style.transform = 'scale(1)'; } }}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>

        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 24, padding: 40, marginBottom: 40 }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.4px', color: C.text, margin: '0 0 24px' }}>🔐 Password Management</h2>

          {!showChangePassword ? (
            <button type="button" onClick={() => setShowChangePassword(true)} style={{ padding: '12px 24px', background: `linear-gradient(135deg, ${C.bright}, #4de029)`, color: '#062400', fontSize: 13, fontWeight: 800, border: 'none', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 0 12px rgba(100,255,67,0.3)' }} onMouseEnter={e => { e.target.style.boxShadow = '0 0 20px rgba(100,255,67,0.5)'; e.target.style.transform = 'scale(1.02)'; }} onMouseLeave={e => { e.target.style.boxShadow = '0 0 12px rgba(100,255,67,0.3)'; e.target.style.transform = 'scale(1)'; }}>Change Password</button>
          ) : (
            <form onSubmit={handleChangePassword} style={{ display: 'grid', gap: 24 }}>
              {passwordError && <div style={{ background: C.errorBg, border: `1px solid ${C.errorBorder}`, borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}><svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}><circle cx="10" cy="10" r="9" stroke={C.error} strokeWidth="2"/><path d="M10 6v4M10 14h.01" stroke={C.error} strokeWidth="2" strokeLinecap="round"/></svg><span style={{ fontSize: 13, color: C.error, fontWeight: 500 }}>{passwordError}</span></div>}
              {passwordSuccess && <div style={{ background: C.successBg, border: `1px solid ${C.successBorder}`, borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}><svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}><path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4z" fill={C.success}/></svg><span style={{ fontSize: 13, color: C.success, fontWeight: 500 }}>{passwordSuccess}</span></div>}

              <div style={{ display: 'grid', gap: 20, background: 'rgba(100,255,67,0.02)', borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 10, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Current Password</label>
                  <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={(e) => setPasswordData(p => ({ ...p, currentPassword: e.target.value }))} required placeholder="Enter your current password" style={{ width: '100%', padding: '12px 16px', border: `1px solid ${C.border}`, borderRadius: 12, background: 'rgba(100,255,67,0.03)', color: C.text, fontSize: 14, boxSizing: 'border-box', transition: 'all 0.2s', outline: 'none' }} onFocus={e => { e.target.style.borderColor = C.borderHover; e.target.style.boxShadow = '0 0 0 3px rgba(100,255,67,0.1)'; }} onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 10, letterSpacing: '0.05em', textTransform: 'uppercase' }}>New Password</label>
                  <input type="password" name="newPassword" value={passwordData.newPassword} onChange={(e) => setPasswordData(p => ({ ...p, newPassword: e.target.value }))} required placeholder="Enter new password (minimum 8 characters)" style={{ width: '100%', padding: '12px 16px', border: `1px solid ${C.border}`, borderRadius: 12, background: 'rgba(100,255,67,0.03)', color: C.text, fontSize: 14, boxSizing: 'border-box', transition: 'all 0.2s', outline: 'none' }} onFocus={e => { e.target.style.borderColor = C.borderHover; e.target.style.boxShadow = '0 0 0 3px rgba(100,255,67,0.1)'; }} onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 10, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Confirm Password</label>
                  <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={(e) => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))} required placeholder="Confirm your new password" style={{ width: '100%', padding: '12px 16px', border: `1px solid ${C.border}`, borderRadius: 12, background: 'rgba(100,255,67,0.03)', color: C.text, fontSize: 14, boxSizing: 'border-box', transition: 'all 0.2s', outline: 'none' }} onFocus={e => { e.target.style.borderColor = C.borderHover; e.target.style.boxShadow = '0 0 0 3px rgba(100,255,67,0.1)'; }} onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <button type="button" onClick={() => { setShowChangePassword(false); setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }); setPasswordError(''); }} style={{ padding: '12px 24px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 12, color: C.bright, fontSize: 13, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.target.style.borderColor = C.borderHover; e.target.style.background = 'rgba(100,255,67,0.08)'; }} onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.background = 'transparent'; }}>Cancel</button>
                <button type="submit" disabled={changingPassword} style={{ padding: '12px 24px', background: changingPassword ? 'linear-gradient(135deg, rgba(100,255,67,0.4), rgba(100,255,67,0.3))' : `linear-gradient(135deg, ${C.bright}, #4de029)`, border: 'none', borderRadius: 12, color: '#062400', fontSize: 13, fontWeight: 800, cursor: changingPassword ? 'not-allowed' : 'pointer', transition: 'all 0.22s', boxShadow: changingPassword ? '0 0 0 0px transparent' : '0 0 12px rgba(100,255,67,0.3)' }} onMouseEnter={e => { if (!changingPassword) { e.target.style.boxShadow = '0 0 20px rgba(100,255,67,0.5)'; e.target.style.transform = 'scale(1.02)'; } }} onMouseLeave={e => { if (!changingPassword) { e.target.style.boxShadow = '0 0 12px rgba(100,255,67,0.3)'; e.target.style.transform = 'scale(1)'; } }}>{changingPassword ? 'Changing...' : 'Change Password'}</button>
              </div>
            </form>
          )}
        </div>

        <div style={{ background: 'rgba(255,107,107,0.05)', border: `1px solid ${C.errorBorder}`, borderRadius: 24, padding: 40 }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.4px', color: '#ff6b6b', margin: '0 0 24px' }}>⚠️ Danger Zone</h2>
          <p style={{ fontSize: 14, color: C.textMid, marginBottom: 20 }}>Permanently delete your account and all associated data. This action cannot be undone.</p>
          <button onClick={() => setShowDeleteModal(true)} style={{ padding: '12px 24px', background: C.error, border: 'none', borderRadius: 12, color: 'white', fontSize: 13, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 0 12px rgba(255,107,107,0.3)' }} onMouseEnter={e => { e.target.style.boxShadow = '0 0 20px rgba(255,107,107,0.5)'; e.target.style.transform = 'scale(1.02)'; }} onMouseLeave={e => { e.target.style.boxShadow = '0 0 12px rgba(255,107,107,0.3)'; e.target.style.transform = 'scale(1)'; }}>Delete Account</button>
        </div>
      </section>

      <DeleteAccountModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onSuccess={handleDeleteAccountSuccess} />
    </div>
  );
};

export default EditProfilePage;

