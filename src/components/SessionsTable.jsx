import { useState, useEffect } from 'react';
import { api } from '../utils/auth';
import { Button, Label } from '@mskcc/components-react';
import StartSessionDialog from './StartSessionDialog';

const SESSION_STATUS = {
  0: 'CREATED',
  1: 'STARTING',
  2: 'RUNNING',
  3: 'STOPPED'
};

const getStatusAppearance = (status) => {
  const appearances = {
    0: 'gray',      // CREATED - gray
    1: 'yellow',    // STARTING - yellow
    2: 'green',     // RUNNING - green
    3: 'red'        // STOPPED - red
  };
  return appearances[status] || 'gray';
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString();
};

export default function SessionsTable() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [showStartDialog, setShowStartDialog] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getSessions();
      setSessions(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchSessions();
  };

  const handleSessionAction = async (sessionId, action) => {
    try {
      setActionLoading(prev => ({ ...prev, [sessionId]: true }));
      
      if (action === 'start') {
        await api.resumeSession(sessionId);
      } else if (action === 'stop') {
        await api.stopSession(sessionId);
      }
      
      await fetchSessions();
    } catch (err) {
      setError(err.message || `Failed to ${action} session`);
    } finally {
      setActionLoading(prev => ({ ...prev, [sessionId]: false }));
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading sessions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ 
          color: '#721c24', 
          backgroundColor: '#f8d7da',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '10px'
        }}>
          Error: {error}
        </div>
        <button onClick={handleRefresh}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Sessions</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            onClick={() => setShowStartDialog(true)}
          >
            Start Session
          </Button>
          <Button onClick={handleRefresh} style={{ padding: '8px 16px' }}>
            Refresh
          </Button>
        </div>
      </div>

      {sessions.length === 0 ? (
        <p>No sessions found.</p>
      ) : (
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ 
            width: '100%', 
            minWidth: '1000px',
            borderCollapse: 'collapse',
            border: '1px solid #dee2e6'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#343a40' }}>
                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6', color: 'white' }}>
                  Name
                </th>
                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6', color: 'white' }}>
                  Description
                </th>
                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #dee2e6', color: 'white' }}>
                  Started At
                </th>
                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #dee2e6', color: 'white' }}>
                  Stopped At
                </th>
                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #dee2e6', color: 'white' }}>
                  Status
                </th>
                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #dee2e6', color: 'white' }}>
                  Session URL
                </th>
                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #dee2e6', color: 'white' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => {
                const canStart = session.status === 0 || session.status === 3; // CREATED or STOPPED
                const canStop = session.status === 1 || session.status === 2; // STARTING or RUNNING
                const isLoading = actionLoading[session.id];
                
                return (
                  <tr key={session.id}>
                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                      {session.name}
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                      {session.description || '-'}
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'center' }}>
                      {formatDate(session.started_at)}
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'center' }}>
                      {formatDate(session.stopped_at)}
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Label appearance={getStatusAppearance(session.status)}>
                          {SESSION_STATUS[session.status] || 'UNKNOWN'}
                        </Label>
                      </div>
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                      {session.session_url ? (
                        <Button
                          onClick={() => window.open(session.session_url, '_blank')}
                          style={{
                            justifyContent: 'center',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
                        >
                          Open Session
                        </Button>
                      ) : '-'}
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'center' }}>
                      {canStart && (
                        <Button
                          onClick={() => handleSessionAction(session.id, 'start')}
                          disabled={isLoading}
                          style={{
                            backgroundColor: isLoading ? '#ccc' : '#28a745',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            fontSize: '12px',
                            marginRight: '5px'
                          }}
                        >
                          {isLoading ? 'Starting...' : 'Start'}
                        </Button>
                      )}
                      {canStop && (
                        <button
                          onClick={() => handleSessionAction(session.id, 'stop')}
                          disabled={isLoading}
                          style={{
                            backgroundColor: isLoading ? '#ccc' : '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          {isLoading ? 'Stopping...' : 'Stop'}
                        </button>
                      )}
                      {!canStart && !canStop && '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <StartSessionDialog
        isOpen={showStartDialog}
        onClose={() => setShowStartDialog(false)}
        onSessionStarted={fetchSessions}
      />
    </div>
  );
}