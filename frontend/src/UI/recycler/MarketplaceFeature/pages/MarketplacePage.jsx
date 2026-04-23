import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import collectionService from '../../../../services/collectionService';
import messageService from '../../../../services/messageService';

const MarketplacePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    wasteType: '',
    condition: '',
    city: '',
    searchQuery: '',
  });

  useEffect(() => {
    fetchCategories();
    loadPosts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, posts]);

  const fetchCategories = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/waste-posts/categories`);
      const data = await response.json();
      setCategories(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setCategories([]);
    }
  };

  const loadPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await collectionService.getAvailablePosts();
      // Backend returns { message, pagination, data: [...posts] }
      // Extract the actual posts array from the response
      const postsArray = Array.isArray(response.data) ? response.data : response.data?.data || response || [];
      setPosts(postsArray);
    } catch (err) {
      setError(err.message || 'Failed to load marketplace posts.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = posts;

    if (filters.wasteType) {
      filtered = filtered.filter((post) => 
        post.wasteType?.toLowerCase() === filters.wasteType.toLowerCase()
      );
    }

    if (filters.condition) {
      filtered = filtered.filter((post) => 
        post.condition?.toLowerCase() === filters.condition.toLowerCase()
      );
    }

    if (filters.city) {
      filtered = filtered.filter((post) => 
        post.city?.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter((post) =>
        post.title?.toLowerCase().includes(query) ||
        post.description?.toLowerCase().includes(query)
      );
    }

    setFilteredPosts(filtered);
  };

  // Separate posts by status for display
  const activePosts = filteredPosts.filter((post) => post.status === 'active');
  const inCollectionPosts = filteredPosts.filter((post) => post.status === 'reserved');

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleViewDetails = (postId) => {
    navigate(`/waste-post/${postId}`);
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

  if (loading) {
    return <div style={{ padding: '40px 20px', textAlign: 'center' }}>Loading marketplace...</div>;
  }

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2>Waste Materials Marketplace</h2>

      {error && (
        <div style={{ backgroundColor: '#fee', padding: '10px', borderRadius: '4px', color: '#c33', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '4px', marginBottom: '20px' }}>
        <h3>Filters</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
          <input
            type="text"
            name="searchQuery"
            placeholder="Search by title or description"
            value={filters.searchQuery}
            onChange={handleFilterChange}
            style={{
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />

          <select
            name="wasteType"
            value={filters.wasteType}
            onChange={handleFilterChange}
            style={{
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          >
            <option value="">All Materials</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            name="condition"
            value={filters.condition}
            onChange={handleFilterChange}
            style={{
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          >
            <option value="">All Conditions</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </select>

          <input
            type="text"
            name="city"
            placeholder="Search by city"
            value={filters.city}
            onChange={handleFilterChange}
            style={{
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
        </div>
      </div>

      <p style={{ marginBottom: '20px', color: '#666' }}>
        Found {filteredPosts.length} waste material(s) ({activePosts.length} available, {inCollectionPosts.length} in collection)
      </p>

      {filteredPosts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
          <p>No waste materials found. Try adjusting your filters.</p>
        </div>
      ) : (
        <>
          {/* AVAILABLE POSTS SECTION */}
          {activePosts.length > 0 && (
            <>
              <h3 style={{ marginBottom: '15px', color: '#28a745' }}>✅ Available for Collection ({activePosts.length})</h3>
              <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', marginBottom: '40px' }}>
                {activePosts.map((post) => (
                  <div
                    key={post.id}
                    style={{
                      border: '2px solid #28a745',
                      borderRadius: '4px',
                      padding: '15px',
                      backgroundColor: 'white',
                    }}
                  >
                    {post.images && post.images.length > 0 && (
                      <img
                        src={post.images[0]}
                        alt={post.title}
                        style={{
                          width: '100%',
                          height: '200px',
                          objectFit: 'cover',
                          borderRadius: '4px',
                          marginBottom: '10px',
                        }}
                      />
                    )}

                    <h4 style={{ margin: '10px 0' }}>{post.title}</h4>

                    <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
                      {post.description.substring(0, 100)}...
                    </p>

                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                      <p>
                        <strong>Type:</strong> {post.wasteType} | <strong>Condition:</strong> {post.condition}
                      </p>
                      <p>
                        <strong>Quantity:</strong> {post.quantity} {post.unit}
                      </p>
                      {post.city && <p><strong>Location:</strong> {post.city}</p>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                      <button
                        onClick={() => handleViewDetails(post.id)}
                        style={{
                          padding: '8px',
                          backgroundColor: '#6c757d',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        📋 Details
                      </button>
                      <button
                        onClick={() => handleMessageBusiness(post.businessId, post.id)}
                        style={{
                          padding: '8px',
                          backgroundColor: '#17a2b8',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        💬 Message
                      </button>
                      <button
                        onClick={() => handleRequestCollection(post.id)}
                        style={{
                          padding: '8px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        🚚 Collect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* IN-COLLECTION POSTS SECTION */}
          {inCollectionPosts.length > 0 && (
            <>
              <h3 style={{ marginBottom: '15px', color: '#ffc107' }}>🔄 In Collection ({inCollectionPosts.length})</h3>
              <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {inCollectionPosts.map((post) => (
                  <div
                    key={post.id}
                    style={{
                      border: '2px solid #ccc',
                      borderRadius: '4px',
                      padding: '15px',
                      backgroundColor: '#f5f5f5',
                      opacity: 0.7,
                    }}
                  >
                    <div style={{ position: 'relative', marginBottom: '10px' }}>
                      {post.images && post.images.length > 0 && (
                        <img
                          src={post.images[0]}
                          alt={post.title}
                          style={{
                            width: '100%',
                            height: '200px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            marginBottom: '10px',
                            filter: 'grayscale(100%)',
                          }}
                        />
                      )}
                      <div
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          backgroundColor: '#ffc107',
                          color: '#333',
                          padding: '5px 10px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                        }}
                      >
                        🔄 In Collection
                      </div>
                    </div>

                    <h4 style={{ margin: '10px 0', color: '#666' }}>{post.title}</h4>

                    <p style={{ color: '#999', fontSize: '14px', marginBottom: '10px' }}>
                      {post.description.substring(0, 100)}...
                    </p>

                    <div style={{ fontSize: '14px', color: '#999', marginBottom: '10px' }}>
                      <p>
                        <strong>Type:</strong> {post.wasteType} | <strong>Condition:</strong> {post.condition}
                      </p>
                      <p>
                        <strong>Quantity:</strong> {post.quantity} {post.unit}
                      </p>
                      {post.city && <p><strong>Location:</strong> {post.city}</p>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                      <button
                        onClick={() => handleViewDetails(post.id)}
                        style={{
                          padding: '8px',
                          backgroundColor: '#6c757d',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        📋 Details
                      </button>
                      <button
                        onClick={() => handleMessageBusiness(post.businessId, post.id)}
                        style={{
                          padding: '8px',
                          backgroundColor: '#17a2b8',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        💬 Message
                      </button>
                      <button
                        disabled
                        style={{
                          padding: '8px',
                          backgroundColor: '#ccc',
                          color: '#666',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'not-allowed',
                          fontSize: '12px',
                        }}
                        title="This material is already being collected by another recycler"
                      >
                        🚚 Collect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default MarketplacePage;

