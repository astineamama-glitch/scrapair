import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../shared/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { COLORS, FONTS } from '../../../../shared/styles/colors';
import { useWindowScroll } from '../../../../shared/hooks/useWindowScroll';
import wastePostService from '../../../../services/wastePostService';
import collectionService from '../../../../services/collectionService';
import messageService from '../../../../services/messageService';
import Navbar from '../../../../shared/components/Navbar';
import FilterPanel from '../../../../shared/components/FilterPanel';
import MaterialCard from '../../components/MaterialCard';

const RecyclerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const scrollY = useWindowScroll();
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [filters, setFilters] = useState({
    wasteType: '',
    city: '',
    searchQuery: '',
  });

  const fetchCategories = useCallback(async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/waste-posts/categories`);
      const data = await response.json();
      setCategories(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const fetchMaterials = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await collectionService.getAvailablePosts();
      // Backend returns { message, pagination, data: [...materials] }
      const materialsArray = Array.isArray(response.data) ? response.data : response.data?.data || response || [];
      setMaterials(materialsArray);
    } catch (err) {
      setError(err.message || 'Failed to load materials');
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch on component mount only. Filters must not auto-apply via useEffect.
  // User must click "Apply Filters" button to trigger new searches.
  useEffect(() => {
    fetchMaterials();
  }, []); // Empty dependency array - only runs once on mount

  const applyFilters = () => {
    let filtered = materials;

    if (filters.wasteType) {
      filtered = filtered.filter((m) => 
        m.wasteType?.toLowerCase() === filters.wasteType.toLowerCase()
      );
    }

    if (filters.city) {
      filtered = filtered.filter((m) => 
        m.city?.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter((m) =>
        m.title?.toLowerCase().includes(query) ||
        m.description?.toLowerCase().includes(query)
      );
    }

    setFilteredMaterials(filtered);
  };

  // Apply filters when materials or filters change
  useEffect(() => {
    applyFilters();
  }, [materials, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleRequestCollection = (postId) => {
    if (!user) {
      navigate('/role-selection');
      return;
    }
    navigate(`/collection/request/${postId}`);
  };

  const handleMessageBusiness = async (businessId, postId) => {
    if (!user) {
      navigate('/role-selection');
      return;
    }
    try {
      const response = await messageService.startConversation(businessId, postId);
      const conversationId = response.data?.id || response.id;
      navigate(`/messages/${conversationId}`);
    } catch (err) {
      alert('Failed to message business: ' + err.message);
    }
  };

  const quickActions = [
    { icon: '💬', title: 'Messages', desc: 'Chat with businesses about materials', route: '/messages' },
    { icon: '🔔', title: 'Notifications', desc: 'View collection updates and alerts', route: '/notifications' },
    { icon: '✓', title: 'Approved Collections', desc: 'Manage your approved pickups', route: '/recycler/approved-collections' },
    { icon: '📦', title: 'My Collections', desc: 'Track all your collection requests', route: '/collections' },
      { icon: '??', title: 'Transaction History', desc: 'View your transaction history', route: '/recycler/transaction-history' },

  ];

  return (
    <div style={{ minHeight: '100vh', background: COLORS.darker, fontFamily: FONTS.primary, overflowX: 'hidden', color: COLORS.text }}>

      {/* Grain overlay */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E")`, pointerEvents: 'none', zIndex: 1 }} />

      {/* Navbar */}
      <Navbar user={user} onLogout={() => { logout(); navigate('/'); }} scrollY={scrollY} role="recycler" />

      {/* Main Content */}
      <section style={{ maxWidth: 1360, margin: '0 auto', padding: '60px 40px', position: 'relative', zIndex: 2 }}>

        {/* Header */}
        <div style={{ marginBottom: 80 }}>
          <div style={{ fontSize: 12, color: COLORS.bright, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 16 }}>Dashboard</div>
          <h1 style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.08, letterSpacing: '-2px', margin: '0 0 12px', color: COLORS.text }}>
            Welcome back, {user?.businessName || 'Recycler'}
          </h1>
          <p style={{ fontSize: 16, color: COLORS.textMid, margin: 0 }}>Find and manage waste materials from verified businesses</p>
        </div>

        {/* Quick Action Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 80 }}>
          {quickActions.map((action, i) => (
            <div
              key={i}
              onClick={() => navigate(action.route)}
              onMouseEnter={() => setHoveredCard(action.title)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                background: COLORS.surface,
                border: `1px solid ${hoveredCard === action.title ? COLORS.borderHover : COLORS.border}`,
                borderRadius: 24,
                padding: 32,
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                transform: hoveredCard === action.title ? 'translateY(-8px)' : 'translateY(0)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <div style={{ fontSize: 40 }}>{action.icon}</div>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.4px', color: COLORS.text, margin: '0 0 8px' }}>
                  {action.title}
                </h3>
                <p style={{ fontSize: 14, color: COLORS.textMid, margin: 0, lineHeight: 1.6 }}>
                  {action.desc}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: COLORS.bright, fontSize: 13, fontWeight: 700, marginTop: 'auto', transition: 'all 0.3s', transform: hoveredCard === action.title ? 'translateX(4px)' : 'translateX(0)' }}>
                <span>View</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8h12M9 3l5 5-5 5" stroke={COLORS.bright} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filter Section */}
        <FilterPanel 
          filters={filters}
          onFilterChange={handleFilterChange}
          categories={categories}
          onApply={fetchMaterials}
        />

        {/* Error Message */}
        {error && (
          <div style={{
            background: 'rgba(255,107,107,0.1)',
            border: `1px solid rgba(255,107,107,0.3)`,
            borderRadius: 16,
            padding: '16px 20px',
            marginBottom: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="10" cy="10" r="9" stroke="#ff6b6b" strokeWidth="2"/>
              <path d="M10 6v4M10 14h.01" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize: 14, color: '#ff6b6b', fontWeight: 500 }}>{error}</span>
          </div>
        )}

        {/* Materials Section */}
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 16, color: COLORS.textMid }}>Loading materials...</div>
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: COLORS.surface, borderRadius: 24, border: `1px solid ${COLORS.border}` }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <p style={{ fontSize: 16, color: COLORS.textMid }}>No waste materials available at the moment.</p>
              <p style={{ fontSize: 14, color: COLORS.textLow }}>Try adjusting your filters or check back later.</p>
            </div>
          ) : (
            <>
              {(() => {
                const activeMaterials = filteredMaterials.filter((m) => m.status === 'active');
                const inCollectionMaterials = filteredMaterials.filter((m) => m.status === 'reserved');

                return (
                  <>
                    {/* ACTIVE MATERIALS */}
                    {activeMaterials.length > 0 && (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
                          <div style={{ fontSize: 24 }}>♻️</div>
                          <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.5px', color: COLORS.text, margin: 0 }}>
                            Available Materials ({activeMaterials.length})
                          </h2>
                        </div>
                        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', marginBottom: 80 }}>
                          {activeMaterials.map((material) => (
                            <div
                              key={material.id}
                              style={{
                                background: COLORS.surface,
                                border: `1px solid ${COLORS.border}`,
                                borderRadius: 20,
                                overflow: 'hidden',
                                transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.borderColor = COLORS.borderHover;
                                e.currentTarget.style.transform = 'translateY(-8px)';
                                e.currentTarget.style.boxShadow = '0 16px 40px rgba(100,255,67,0.15)';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.borderColor = COLORS.border;
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            >
                              {/* Image */}
                              {material.images && material.images.length > 0 && (
                                <img
                                  src={material.images[0]}
                                  alt={material.title}
                                  style={{
                                    width: '100%',
                                    height: 200,
                                    objectFit: 'cover',
                                  }}
                                />
                              )}

                              {/* Content */}
                              <div style={{ padding: 24 }}>
                                <h3 style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.3px', color: COLORS.text, margin: '0 0 12px' }}>
                                  {material.title}
                                </h3>
                                <p style={{ fontSize: 13, color: COLORS.textMid, lineHeight: 1.6, margin: '0 0 16px' }}>
                                  {material.description.substring(0, 80)}...
                                </p>

                                {/* Details */}
                                <div style={{ display: 'grid', gap: 8, marginBottom: 20, fontSize: 13 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', color: COLORS.textMid }}>
                                    <span>Type:</span>
                                    <span style={{ color: COLORS.bright, fontWeight: 700 }}>{material.wasteType}</span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', color: COLORS.textMid }}>
                                    <span>Quantity:</span>
                                    <span style={{ color: COLORS.text }}>{material.quantity} {material.unit}</span>
                                  </div>
                                  {material.city && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: COLORS.textMid }}>
                                      <span>Location:</span>
                                      <span style={{ color: COLORS.text }}>{material.city}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                  <button
                                    onClick={() => navigate(`/business/posts/waste-post/${material.id}`)}
                                    style={{
                                      padding: '10px 16px',
                                      background: 'transparent',
                                      border: `1px solid ${COLORS.border}`,
                                      borderRadius: 10,
                                      color: COLORS.bright,
                                      fontSize: 12,
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={e => { e.target.style.borderColor = COLORS.borderHover; e.target.style.background = 'rgba(100,255,67,0.08)'; }}
                                    onMouseLeave={e => { e.target.style.borderColor = COLORS.border; e.target.style.background = 'transparent'; }}
                                  >
                                    ?? Details
                                  </button>
                                  <button
                                    onClick={() => handleRequestCollection(material.id)}
                                    style={{
                                      padding: '10px 16px',
                                      background: `linear-gradient(135deg, ${COLORS.bright}, #4de029)`,
                                      border: 'none',
                                      borderRadius: 10,
                                      color: '#062400',
                                      fontSize: 12,
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      transition: 'all 0.2s',
                                      boxShadow: '0 0 12px rgba(100,255,67,0.3)',
                                    }}
                                    onMouseEnter={e => { e.target.style.boxShadow = '0 0 20px rgba(100,255,67,0.5)'; e.target.style.transform = 'scale(1.02)'; }}
                                    onMouseLeave={e => { e.target.style.boxShadow = '0 0 12px rgba(100,255,67,0.3)'; e.target.style.transform = 'scale(1)'; }}
                                  >
                                    ?? Collect
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* IN-COLLECTION MATERIALS */}
                    {inCollectionMaterials.length > 0 && (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
                          <div style={{ fontSize: 24 }}>??</div>
                          <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.5px', color: COLORS.text, margin: 0 }}>
                            In Collection ({inCollectionMaterials.length})
                          </h2>
                        </div>
                        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                          {inCollectionMaterials.map((material) => (
                            <div
                              key={material.id}
                              style={{
                                background: COLORS.surface,
                                border: `1px solid rgba(100,255,67,0.08)`,
                                borderRadius: 20,
                                overflow: 'hidden',
                                opacity: 0.6,
                                transition: 'all 0.3s',
                              }}
                            >
                              {material.images && material.images.length > 0 && (
                                <img
                                  src={material.images[0]}
                                  alt={material.title}
                                  style={{
                                    width: '100%',
                                    height: 200,
                                    objectFit: 'cover',
                                    filter: 'grayscale(60%)',
                                  }}
                                />
                              )}
                              <div style={{ padding: 24 }}>
                                <h3 style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.3px', color: COLORS.textLow, margin: '0 0 12px' }}>
                                  {material.title}
                                </h3>
                                <p style={{ fontSize: 13, color: COLORS.textLow, lineHeight: 1.6, margin: '0 0 16px' }}>
                                  {material.description.substring(0, 80)}...
                                </p>
                                <div style={{ background: 'rgba(100,255,67,0.08)', color: COLORS.bright, padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, textAlign: 'center' }}>
                                  ⏳ In Collection
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                );
              })()}
            </>
          )}
        </div>
      </section>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RecyclerDashboard;

