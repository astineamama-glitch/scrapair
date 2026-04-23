/* eslint-disable unicode-bom */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import wastePostService from '../../../../services/wastePostService';
import imageService from '../../../../services/imageService';

const EditWastePostPage = () => {
  const { postId } = useParams();
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

  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchCategories = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/waste-posts/categories`);
      const data = await response.json();
      setCategories(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
    }
  };

  const loadPost = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await wastePostService.getWastePostById(postId);
      const post = response.data;
      setFormData({
        title: post.title,
        description: post.description,
        wasteType: post.wasteType,
        condition: post.condition,
        quantity: post.quantity,
        unit: post.unit,
        city: post.city,
        address: post.address,
        location: post.location,
        latitude: post.latitude || '',
        longitude: post.longitude || '',
      });
      if (post.images && post.images.length > 0) {
        setCurrentImageUrl(post.images[0]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load post.');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchCategories();
    loadPost();
  }, [postId, loadPost]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
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
    if (!imageFile) return currentImageUrl;

    setImageLoading(true);
    try {
      // Delete old image if it exists
      if (currentImageUrl) {
        try {
          await imageService.deleteImage(currentImageUrl);
        } catch (err) {
        }
      }

      const response = await imageService.uploadImage(imageFile);
      return response.data.url;  // Backend returns data.url
    } catch (err) {
      setError('Failed to upload image. ' + (err.message || ''));
      throw err;
    } finally {
      setImageLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title || !formData.description) {
      setError('Please fill in all required fields.');
      return;
    }

    setSaving(true);

    try {
      let imageUrl = currentImageUrl;

      // Upload new image if selected
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      const updateData = {
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
      };

      if (imageUrl) {
        updateData.imageUrl = imageUrl;
      }

      await wastePostService.updateWastePost(postId, updateData);
      setSuccess('Post updated successfully!');
      
      setTimeout(() => {
        navigate('/business/posts');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to update post. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px 20px', textAlign: 'center' }}>Loading post...</div>;
  }

  if (!user) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p>Please login to edit posts.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Edit Waste Post</h2>

      {error && (
        <div style={{ backgroundColor: '#fee', padding: '10px', borderRadius: '4px', color: '#c33', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ backgroundColor: '#efe', padding: '10px', borderRadius: '4px', color: '#3c3', marginBottom: '20px' }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Waste Type *</label>
            <select
              name="wasteType"
              value={formData.wasteType}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.name.toLowerCase()}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Condition *</label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            >
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Quantity *</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              min="1"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Unit *</label>
            <select
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            >
              <option value="kg">Kilograms</option>
              <option value="ton">Tons</option>
              <option value="units">Units</option>
              <option value="m3">Cubic Meters</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Location Description</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Location</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <input
              type="number"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              placeholder="Latitude"
              step="0.0001"
              style={{
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            />
            <input
              type="number"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              placeholder="Longitude"
              step="0.0001"
              style={{
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Material Image</label>
          {(imagePreview || currentImageUrl) && (
            <div style={{ marginBottom: '10px' }}>
              <img 
                src={imagePreview || currentImageUrl} 
                alt="Current" 
                style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }} 
              />
              {imagePreview && <p style={{ fontSize: '12px', color: '#666' }}>New image selected</p>}
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
          />
          {imageLoading && <p style={{ color: '#666' }}>Uploading image...</p>}
        </div>

        <button
          type="submit"
          disabled={saving || imageLoading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: saving || imageLoading ? 'not-allowed' : 'pointer',
            opacity: saving || imageLoading ? 0.6 : 1,
          }}
        >
          {saving ? 'Updating Post...' : 'Update Post'}
        </button>
      </form>
    </div>
  );
};

export default EditWastePostPage;

