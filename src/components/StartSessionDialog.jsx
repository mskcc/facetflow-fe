import { useState } from 'react';
import { api } from '../utils/auth';

export default function StartSessionDialog({ isOpen, onClose, onSessionStarted }) {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Session name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.startSession(formData.name.trim(), formData.description.trim() || null);
      setFormData({ name: '', description: '' });
      onSessionStarted();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ name: '', description: '' });
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        width: '90%',
        maxWidth: '500px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#333' }}>Start New Session</h2>
          <button
            onClick={handleClose}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: loading ? 'not-allowed' : 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="name" style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#333' }}>
              Session Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="Enter session name"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="description" style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#333' }}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="Enter session description (optional)"
              rows="3"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {error && (
            <div style={{
              color: '#721c24',
              backgroundColor: '#f8d7da',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              style={{
                padding: '10px 20px',
                border: '1px solid #ddd',
                backgroundColor: '#f8f9fa',
                color: '#333',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              style={{
                padding: '10px 20px',
                border: 'none',
                backgroundColor: loading || !formData.name.trim() ? '#ccc' : '#28a745',
                color: 'white',
                borderRadius: '4px',
                cursor: loading || !formData.name.trim() ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              {loading ? 'Starting...' : 'Start Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}