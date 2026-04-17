import React, { useState } from 'react';
import { useAuth } from '../shared/context/AuthContext';
import reportService from '../services/reportService';
import '../styles/ReportForm.css';

const ReportForm = ({ reportedUserId, collectionId, postId, onSubmitSuccess }) => {
  const { token } = useAuth();
  const [reason, setReason] = useState('poor_quality');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const REPORT_REASONS = [
    { value: 'poor_quality', label: 'Poor Quality', description: 'Items are damaged or not as described' },
    { value: 'late_pickup', label: 'Late Pickup', description: 'Pickup was delayed or missed' },
    { value: 'damaged_materials', label: 'Damaged Materials', description: 'Materials were damaged during handling' },
    { value: 'incomplete_delivery', label: 'Incomplete Delivery', description: 'Not all items were delivered' },
    { value: 'bad_behavior', label: 'Bad Behavior', description: 'Unprofessional or disrespectful conduct' },
    { value: 'other', label: 'Other', description: 'Other issues' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!reportedUserId) {
      setError('Missing user information');
      return;
    }

    if (!description.trim()) {
      setError('Please provide details about the report');
      return;
    }

    if (description.length < 10) {
      setError('Description must be at least 10 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await reportService.submitReport({
        reportedUserId,
        collectionId: collectionId || null,
        postId: postId || null,
        reason,
        description: description.trim()
      });

      setSuccess(`Report submitted successfully. ${result?.status === 'approved' ? 'Auto-approved and processed.' : 'Awaiting admin review.'}`);
      setReason('poor_quality');
      setDescription('');
      
      if (onSubmitSuccess) {
        onSubmitSuccess(result);
      }
    } catch (err) {
      setError(err.message || 'Error submitting report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="report-form-container">
      <h3>Submit a Report</h3>
      <p className="report-info">Help us maintain a safe community by reporting inappropriate behavior or issues.</p>
      
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="reason">Report Reason *</label>
          <select
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="form-control"
          >
            {REPORT_REASONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label} - {opt.description}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Details *</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please provide detailed information about your report. Include specific examples if possible."
            maxLength={1000}
            rows={6}
            className="form-control"
          />
          <small>
            {description.length}/1000 characters
            {description.length > 0 && (
              <span className="validity-hint">
                {description.length < 10 ? '⚠️ Too short' : '✓ Good detail'}
              </span>
            )}
          </small>
        </div>

        <div className="form-info">
          <p>💡 <strong>Tip:</strong> Include specific details and examples to help with validation. Detailed reports are more likely to be auto-approved.</p>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="btn btn-danger"
        >
          {isSubmitting ? 'Submitting Report...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
};

export default ReportForm;

