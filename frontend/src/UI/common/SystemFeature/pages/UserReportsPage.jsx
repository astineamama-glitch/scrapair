import React, { useState, useEffect } from 'react';
import reportService from '../../../../services/reportService';
import ReportForm from '../../../../components/ReportForm';
import '../../../../styles/AdminPages.css';

const UserReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportedUserId, setReportedUserId] = useState(null);
  const [reportedUserEmail, setReportedUserEmail] = useState('');
  const [searchingUser, setSearchingUser] = useState(false);

  useEffect(() => {
    fetchUserReports();
  }, []);

  const fetchUserReports = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await reportService.getMyReports(1, 20);
      setReports(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch your reports');
    } finally {
      setLoading(false);
    }
  };

  const handleReportSubmitted = () => {
    setSelectedReport(null);
    setReportedUserId(null);
    setReportedUserEmail('');
    fetchUserReports();
  };

  const handleSelectUserToReport = async () => {
    if (!reportedUserEmail.trim()) {
      setError('Please enter a user email');
      return;
    }

    try {
      setSearchingUser(true);
      setError('');
      
      // Try to find user by email
      const response = await fetch(`/api/users/search?email=${encodeURIComponent(reportedUserEmail)}`);
      if (!response.ok) {
        throw new Error('User not found');
      }

      const userData = await response.json();
      const foundUser = userData.data || userData;
      
      if (!foundUser || !foundUser.id) {
        setError('User not found. Please check the email and try again.');
        return;
      }

      setReportedUserId(foundUser.id);
    } catch (err) {
      setError(err.message || 'Failed to find user. Please check the email.');
      setReportedUserId(null);
    } finally {
      setSearchingUser(false);
    }
  };

  const getReasonLabel = (reason) => {
    const map = {
      poor_quality: 'Poor Quality',
      late_pickup: 'Late Pickup',
      damaged_materials: 'Damaged Materials',
      incomplete_delivery: 'Incomplete Delivery',
      bad_behavior: 'Bad Behavior',
      other: 'Other'
    };
    return map[reason] || reason;
  };

  const getStatusBadgeColor = (status) => {
    if (status === 'approved') return 'badge-success';
    if (status === 'rejected') return 'badge-danger';
    if (status === 'pending') return 'badge-warning';
    return 'badge-secondary';
  };

  if (loading) return <div className="admin-page">Loading your reports...</div>;

  return (
    <div className="admin-page user-reports">
      <h2>My Reports</h2>

      {error && <div className="alert alert-error">{error}</div>}

      {!selectedReport && reportedUserId === null && (
        <div style={{ marginBottom: '30px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
          <h3>Report a User</h3>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
            Enter the email of the user you want to report. After verification, you'll be able to submit a detailed report.
          </p>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <input 
              type="email" 
              placeholder="Enter user email to report..."
              value={reportedUserEmail}
              onChange={(e) => setReportedUserEmail(e.target.value)}
              disabled={searchingUser}
              style={{
                flex: 1,
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
            <button 
              onClick={handleSelectUserToReport} 
              disabled={searchingUser || !reportedUserEmail.trim()}
              className="btn btn-primary"
              style={{
                padding: '10px 20px',
                cursor: searchingUser ? 'not-allowed' : 'pointer',
                opacity: searchingUser ? 0.7 : 1
              }}
            >
              {searchingUser ? 'Searching...' : 'Find User'}
            </button>
          </div>
        </div>
      )}

      {!selectedReport && reportedUserId !== null && (
        <div style={{ marginBottom: '30px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3>Submit Report</h3>
            <button 
              onClick={() => {
                setReportedUserId(null);
                setReportedUserEmail('');
              }}
              className="btn btn-secondary"
              style={{ fontSize: '12px', padding: '5px 10px' }}
            >
              Change User
            </button>
          </div>
          <ReportForm 
            reportedUserId={reportedUserId}
            onSubmitSuccess={handleReportSubmitted}
          />
        </div>
      )}

      {selectedReport ? (
        <div className="report-detail">
          <button onClick={() => {
            setSelectedReport(null);
            setReportedUserId(null);
            setReportedUserEmail('');
          }} className="btn btn-secondary">
            ← Back to List
          </button>

          <h3>Report #{selectedReport.id}</h3>

          <div className="report-info">
            <p><strong>Status:</strong> <span className={`badge ${getStatusBadgeColor(selectedReport.status)}`}>{selectedReport.status.toUpperCase()}</span></p>
            <p><strong>Reason:</strong> {getReasonLabel(selectedReport.reason)}</p>
            <p><strong>Against:</strong> {selectedReport.reportedUser?.email}</p>
            {selectedReport.collection && <p><strong>Collection ID:</strong> {selectedReport.collectionId}</p>}
            {selectedReport.post && <p><strong>Post ID:</strong> {selectedReport.postId}</p>}
            <p><strong>Validity Score:</strong> {(selectedReport.validityScore * 100).toFixed(1)}%</p>
            <p><strong>Submitted:</strong> {new Date(selectedReport.createdAt).toLocaleString()}</p>
            
            {selectedReport.status === 'approved' && selectedReport.pointsDeducted > 0 && (
              <div className="success-box">
                <p>✓ <strong>Report Approved!</strong></p>
                <p>Rating points deducted from reported user: {selectedReport.pointsDeducted.toFixed(2)}</p>
              </div>
            )}

            {selectedReport.status === 'rejected' && selectedReport.rejectionReason && (
              <div className="error-box">
                <p>✗ <strong>Report Rejected</strong></p>
                <p><strong>Reason:</strong> {selectedReport.rejectionReason}</p>
              </div>
            )}

            <div className="description-section">
              <h4>Description:</h4>
              <p>{selectedReport.description}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="reports-list">
          {reports.length === 0 ? (
            <div className="empty-state">
              <p>You haven't submitted any reports yet.</p>
              <p>If you encounter issues with users or transactions, you can submit a report to help us maintain community standards.</p>
            </div>
          ) : (
            <table className="reports-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Reported User</th>
                  <th>Reason</th>
                  <th>Validity</th>
                  <th>Status</th>
                  <th>Points Deducted</th>
                  <th>Submitted</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td>#{report.id}</td>
                    <td>{report.reportedUser?.email}</td>
                    <td>{getReasonLabel(report.reason)}</td>
                    <td>
                      <div className="validity-percentage">
                        {(report.validityScore * 100).toFixed(0)}%
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeColor(report.status)}`}>
                        {report.status === 'approved' ? '✓ Approved' : report.status === 'rejected' ? '✗ Rejected' : '⏳ Pending'}
                      </span>
                    </td>
                    <td>
                      {report.status === 'approved' ? (
                        <span className="positive">{report.pointsDeducted.toFixed(2)} pts</span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="btn btn-sm btn-info"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default UserReportsPage;
