import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../../../../services/authService';
import { useAuth } from '../../../../shared/context/AuthContext';

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const email = searchParams.get('email');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.verifyEmail(email, code);
      // Redirect based on user type
      if (user?.type === 'business') {
        navigate('/business/dashboard');
      } else if (user?.type === 'recycler') {
        navigate('/recycler/dashboard');
      } else {
        navigate('/role-selection');
      }
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('Resend verification is not available. Please check your email for the verification code.');
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '400px', margin: '50px auto' }}>
      <h2>Verify Email Address</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        We've sent a verification code to <strong>{email}</strong>
      </p>

      {error && (
        <div style={{ backgroundColor: '#fee', padding: '10px', borderRadius: '4px', color: '#c33', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {resendSuccess && (
        <div style={{ backgroundColor: '#efe', padding: '10px', borderRadius: '4px', color: '#3c3', marginBottom: '20px' }}>
          {resendSuccess}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Verification Code:</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter 6-digit code"
            maxLength="6"
            required
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box',
              fontSize: '24px',
              letterSpacing: '5px',
              textAlign: 'center',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            marginBottom: '10px',
          }}
        >
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>

      <button
        onClick={handleResend}
        disabled={resendLoading}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: resendLoading ? 'not-allowed' : 'pointer',
          opacity: resendLoading ? 0.6 : 1,
        }}
      >
        {resendLoading ? 'Sending...' : 'Resend Code'}
      </button>
    </div>
  );
};

export default EmailVerificationPage;
