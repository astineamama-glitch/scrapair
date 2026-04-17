import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import wastePostService from '../../../../services/wastePostService';
import imageService from '../../../../services/imageService';

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
  info: '#7dd3fc',
  infoBg: 'rgba(125,211,252,0.1)',
  infoBorder: 'rgba(125,211,252,0.3)',
};

const CreateWastePostPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    wasteType: 'plastic',
    condition: 'good',
    quantity: '',
    unit: 'kg',
    city: '',
    address: '',
    location: '',
    latitude: '',
    longitude: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

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
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/waste-posts/categories`);
      const data = await response.json();
      if (Array.isArray(data.data) && data.data.length > 0) {
        setCategories(data.data);
        setFormData((prev) => ({ ...prev, wasteType: data.data[0].name.toLowerCase() }));
      }
    } catch (err) {}
  };

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: C.darker, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans','Helvetica Neue',sans-serif", color: C.text }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ fontSize: 16, color: C.error, marginBottom: 16 }}>Please login to create a waste post</p>
          <button onClick={() => navigate('/role-selection')} style={{ padding: '12px 28px', fontSize: 13, fontWeight: 700, borderRadius: 100, border: 'none', background: C.bright, color: '#082800', cursor: 'pointer' }}>Login</button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    setImageLoading(true);
    try {
      const response = await imageService.uploadImage(imageFile);
      return response.data.url;
    } catch (err) {
      setError('Failed to upload image. ' + (err.message || ''));
      return null;
    } finally {
      setImageLoading(false);
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));
        setSuccess('Location captured successfully');
      });
    } else {
      setError('Geolocation is not supported by your browser');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title || !formData.description || !formData.quantity) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!imageFile) {
      setError('Please upload a material image before submitting.');
      return;
    }

    setLoading(true);

    try {
      let imageUrl = '';
      imageUrl = await uploadImage();

      if (!imageUrl) {
        setError('Failed to upload image. Please try again.');
        return;
      }

      const postData = {
        title: formData.title,
        description: formData.description,
        wasteType: formData.wasteType,
        condition: formData.condition,
        quantity: parseInt(formData.quantity),
        unit: formData.unit,
        city: formData.city,
        address: formData.address,
        location: formData.location,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        imageUrl,
      };

      await wastePostService.createWastePost(postData);
      setSuccess('Waste post created successfully!');

      setTimeout(() => {
        navigate('/business/posts');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to create waste post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (name, label, type = 'text', required = false, placeholder = '') => (
    <div style={{ marginBottom: 20 }}>
      <label style={{ fontSize: 13, fontWeight: 700, color: C.bright, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>{label} {required && '*'}</label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        required={required}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '14px 16px',
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          color: C.text,
          fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
          fontSize: 14,
          boxSizing: 'border-box',
          transition: 'all 0.2s',
          outline: 'none',
        }}
        onFocus={e => { e.target.style.borderColor = C.borderHover; e.target.style.boxShadow = `0 0 0 3px rgba(100,255,67,0.15)`; }}
        onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
      />
    </div>
  );

  const renderSelect = (name, label, options, required = false) => (
    <div style={{ marginBottom: 20 }}>
      <label style={{ fontSize: 13, fontWeight: 700, color: C.bright, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>{label} {required && '*'}</label>
      <select
        name={name}
        value={formData[name]}
        onChange={handleChange}
        required={required}
        style={{
          width: '100%',
          padding: '14px 16px',
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          color: C.text,
          fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
          fontSize: 14,
          boxSizing: 'border-box',
          transition: 'all 0.2s',
          outline: 'none',
          cursor: 'pointer',
        }}
        onFocus={e => { e.target.style.borderColor = C.borderHover; e.target.style.boxShadow = `0 0 0 3px rgba(100,255,67,0.15)`; }}
        onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ background: C.darker, color: C.text }}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: C.darker, fontFamily: "'DM Sans','Helvetica Neue',sans-serif", overflowX: 'hidden', color: C.text }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ position: 'fixed', top: mouse.y - 320, left: mouse.x - 320, width: 640, height: 640, background: 'radial-gradient(circle, rgba(100,255,67,0.055) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0, transition: 'top 0.35s ease, left 0.35s ease' }} />
      <div style={{ position: 'fixed', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E")`, pointerEvents: 'none', zIndex: 1 }} />
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: scrollY > 60 ? 'rgba(10,46,3,0.93)' : 'transparent', backdropFilter: scrollY > 60 ? 'blur(28px)' : 'none', borderBottom: scrollY > 60 ? `1px solid ${C.border}` : '1px solid transparent', transition: 'all 0.35s ease' }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: '18px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(100,255,67,0.12)', border: '1px solid rgba(100,255,67,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2zm0 2a6 6 0 0 1 5.917 5H10V4zm-1 0v5H3.083A6 6 0 0 1 9 4zM3.444 11H9v5.472A6.002 6.002 0 0 1 3.444 11zm6.556 5.472V11h5.556A6.002 6.002 0 0 1 10 16.472z" fill={C.bright}/>
              </svg>
            </div>
            <span style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.5px', color: C.text }}>ScraPair</span>
          </div>
          <button onClick={() => navigate(-1)} style={{ padding: '10px 24px', fontSize: 14, fontWeight: 700, borderRadius: 100, border: 'none', background: C.bright, color: '#082800', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 0 16px rgba(100,255,67,0.35)' }} onMouseEnter={e => { e.target.style.boxShadow = '0 0 28px rgba(100,255,67,0.6)'; e.target.style.transform = 'translateY(-1px)'; }} onMouseLeave={e => { e.target.style.boxShadow = '0 0 16px rgba(100,255,67,0.35)'; e.target.style.transform = 'translateY(0)'; }}>← Back</button>
        </div>
      </nav>

      <section style={{ maxWidth: 700, margin: '0 auto', padding: '60px 40px', position: 'relative', zIndex: 2 }}>
        <div style={{ marginBottom: 60 }}>
          <div style={{ fontSize: 12, color: C.bright, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 16 }}>Post Material</div>
          <h1 style={{ fontSize: 48, fontWeight: 900, lineHeight: 1.08, letterSpacing: '-2px', margin: '0 0 12px', color: C.text }}>Create Post</h1>
          <p style={{ fontSize: 16, color: C.textMid, margin: 0 }}>List your waste material for recyclers to collect</p>
        </div>

        {error && <div style={{ background: C.errorBg, border: `1px solid ${C.errorBorder}`, borderRadius: 16, padding: '16px 20px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}><svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}><circle cx="10" cy="10" r="9" stroke={C.error} strokeWidth="2"/><path d="M10 6v4M10 14h.01" stroke={C.error} strokeWidth="2" strokeLinecap="round"/></svg><span style={{ fontSize: 14, color: C.error, fontWeight: 500 }}>{error}</span></div>}
        {success && <div style={{ background: C.infoBg, border: `1px solid ${C.infoBorder}`, borderRadius: 16, padding: '16px 20px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}><svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}><path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.707-10.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fill={C.info}/></svg><span style={{ fontSize: 14, color: C.info, fontWeight: 500 }}>{success}</span></div>}

        <form onSubmit={handleSubmit}>
          {/* Material Info Section */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: 32, marginBottom: 32 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.bright, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 24px' }}>📦 Material Details</h3>
            {renderInput('title', 'Title', 'text', true, 'e.g., Plastic Bottles from Production')}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: C.bright, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Describe the waste material and its condition"
                rows="4"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: C.darker,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  color: C.text,
                  fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
                  fontSize: 14,
                  boxSizing: 'border-box',
                  transition: 'all 0.2s',
                  outline: 'none',
                  resize: 'vertical',
                }}
                onFocus={e => { e.target.style.borderColor = C.borderHover; e.target.style.boxShadow = `0 0 0 3px rgba(100,255,67,0.15)`; }}
                onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {renderSelect('wasteType', 'Waste Type', categories.map(c => ({ value: c.name.toLowerCase(), label: c.name })), true)}
              {renderSelect('condition', 'Condition', [{ value: 'good', label: 'Good' }, { value: 'fair', label: 'Fair' }, { value: 'poor', label: 'Poor' }], true)}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {renderInput('quantity', 'Quantity', 'number', true, 'Amount')}
              {renderSelect('unit', 'Unit', [{ value: 'kg', label: 'Kilograms' }, { value: 'ton', label: 'Tons' }, { value: 'units', label: 'Units' }, { value: 'm3', label: 'Cubic Meters' }], true)}
            </div>
          </div>

          {/* Location Section */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: 32, marginBottom: 32 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.bright, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 24px' }}>📍 Location</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {renderInput('city', 'City', 'text', true, 'e.g., New York')}
              {renderInput('address', 'Address', 'text', true, 'e.g., 123 Main St')}
            </div>
            {renderInput('location', 'Location Description', 'text', false, 'e.g., Near central warehouse')}

            <label style={{ fontSize: 13, fontWeight: 700, color: C.bright, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Coordinates</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
              <input type="number" name="latitude" value={formData.latitude} onChange={handleChange} placeholder="Latitude" step="0.0001" style={{ padding: '12px 14px', background: C.darker, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontFamily: "'DM Sans','Helvetica Neue',sans-serif", fontSize: 13, boxSizing: 'border-box', outline: 'none', transition: 'all 0.2s' }} onFocus={e => e.target.style.borderColor = C.borderHover} onBlur={e => e.target.style.borderColor = C.border} />
              <input type="number" name="longitude" value={formData.longitude} onChange={handleChange} placeholder="Longitude" step="0.0001" style={{ padding: '12px 14px', background: C.darker, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontFamily: "'DM Sans','Helvetica Neue',sans-serif", fontSize: 13, boxSizing: 'border-box', outline: 'none', transition: 'all 0.2s' }} onFocus={e => e.target.style.borderColor = C.borderHover} onBlur={e => e.target.style.borderColor = C.border} />
              <button type="button" onClick={handleGetLocation} style={{ padding: '12px 14px', background: C.bright, border: 'none', borderRadius: 10, color: '#082800', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', fontSize: 12 }} onMouseEnter={e => e.target.style.transform = 'scale(1.05)'} onMouseLeave={e => e.target.style.transform = 'scale(1)'}>📍 Detect</button>
            </div>
          </div>

          {/* Image Section */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: 32, marginBottom: 32 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.bright, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 24px' }}>📷 Material Image</h3>
            {imagePreview && (
              <div style={{ marginBottom: 20, borderRadius: 12, overflow: 'hidden', border: `1px solid ${C.border}` }}>
                <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: 250, objectFit: 'cover' }} />
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleImageChange} style={{ width: '100%', padding: '12px 14px', background: C.darker, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontFamily: "'DM Sans','Helvetica Neue',sans-serif", fontSize: 13, boxSizing: 'border-box', outline: 'none', cursor: 'pointer' }} />
            {imageLoading && <p style={{ color: C.info, fontSize: 13, marginTop: 8 }}>⏳ Uploading image...</p>}
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={loading || imageLoading} style={{ width: '100%', padding: '16px 24px', fontSize: 14, fontWeight: 800, borderRadius: 100, border: 'none', background: loading || imageLoading ? `${C.bright}99` : C.bright, color: '#082800', cursor: loading || imageLoading ? 'not-allowed' : 'pointer', opacity: loading || imageLoading ? 0.6 : 1, transition: 'all 0.2s', boxShadow: loading || imageLoading ? 'none' : '0 0 24px rgba(100,255,67,0.4)' }} onMouseEnter={e => { if (!loading && !imageLoading) { e.target.style.boxShadow = '0 0 40px rgba(100,255,67,0.6)'; e.target.style.transform = 'scale(1.02)'; } }} onMouseLeave={e => { if (!loading && !imageLoading) { e.target.style.boxShadow = '0 0 24px rgba(100,255,67,0.4)'; e.target.style.transform = 'scale(1)'; } }}>
            {loading ? '⏳ Creating Post...' : '✓ Create Waste Post'}
          </button>
        </form>
      </section>
    </div>
  );
};

export default CreateWastePostPage;

