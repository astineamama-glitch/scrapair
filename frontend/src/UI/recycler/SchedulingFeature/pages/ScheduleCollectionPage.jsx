import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import collectionService from '../../../../services/collectionService';
import { convertBrowserLocalToManilaTime } from '../../../../utils/datetimeLocalConverter';

const ScheduleCollectionPage = () => {
  const { collectionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [collection, setCollection] = useState(null);
  const [formData, setFormData] = useState({
    scheduledDate: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadCollection();
  }, [collectionId]);

  const loadCollection = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await collectionService.getCollectionDetails(collectionId);
      const collectionData = response.data || response;
      setCollection(collectionData);
      
      // Verify collection status is 'approved' before allowing schedule
      if (collectionData.status !== 'approved') {
        setError(`Cannot schedule collection with status '${collectionData.status}'. Must be 'approved' first.`);
      }
      
      if (collectionData.scheduledDate) {
        // Format ISO string to datetime-local format (YYYY-MM-DDTHH:mm)
        const isoString = collectionData.scheduledDate;
        const dateObj = new Date(isoString);
        const localString = dateObj.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
        setFormData((prev) => ({
          ...prev,
          scheduledDate: localString,
        }));
      }
    } catch (err) {
      setError(err.message || 'Failed to load collection details.');
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

    if (!formData.scheduledDate) {
      setError('Please select a scheduled date.');
      return;
    }

    setSaving(true);

    try {
      // Convert datetime-local (browser's local time) to Manila time before sending to backend
      const manilaScheduledDate = convertBrowserLocalToManilaTime(formData.scheduledDate);
      const response = await collectionService.scheduleCollection(collectionId, {
        scheduledDate: manilaScheduledDate,
      });
      setSuccess('Collection scheduled successfully!');

      setTimeout(() => {
        navigate('/collections');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to schedule collection.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px 20px', textAlign: 'center' }}>Loading collection details...</div>;
  }

  if (!collection) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p>Collection not found.</p>
      </div>
    );
  }

  if (!user || user.type !== 'business') {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p>Only business owners can schedule collections.</p>
      </div>
    );
  }

  if (collection.status !== 'approved') {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p>Collection must be 'approved' before scheduling.</p>
        <p>Current status: <strong>{collection.status}</strong></p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Schedule Collection</h2>

      <div
        style={{
          backgroundColor: '#f5f5f5',
          padding: '20px',
          borderRadius: '4px',
          marginBottom: '20px',
        }}
      >
        <h4>Collection #{collection.id}</h4>
        {collection.post && (
          <>
            <p>
              <strong>Material:</strong> {collection.post.title}
            </p>
            <p>
              <strong>Quantity:</strong> {collection.post.quantity} {collection.post.unit}
            </p>
          </>
        )}
        <p>
          <strong>Status:</strong> <span style={{ color: '#0c5460', backgroundColor: '#d1ecf1', padding: '2px 6px', borderRadius: '3px' }}>{collection.status}</span>
        </p>
      </div>

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
          <label style={{ display: 'block', marginBottom: '5px' }}>Scheduled Date & Time *</label>
          <input
            type="datetime-local"
            name="scheduledDate"
            value={formData.scheduledDate}
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

        <button
          type="submit"
          disabled={saving}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? 'Scheduling...' : 'Schedule Collection'}
        </button>
      </form>
    </div>
  );
};

export default ScheduleCollectionPage;

