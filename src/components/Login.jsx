import { useState } from 'react';
import { TextInput } from '@mskcc/carbon-react';
import { api } from '../utils/auth';
import backgroundImage from '../assets/background.png';
import logoStacked from '../assets/logo-stacked-9900e6125e85b9da52f9b63c3868054f.svg';
import { Button } from '@mskcc/components-react';

export default function Login({ onLoginSuccess }) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
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
    setLoading(true);
    setError('');

    try {
      await api.login(formData.username, formData.password);
      setFormData({ username: '', password: '' });
      onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      flex: 1,
      width: '100%',
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'repeat',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        padding: '40px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <img src={logoStacked} alt="MSKCC Logo" style={{ maxWidth: '200px', height: 'auto' }} />
        </div>
        <h2 style={{ marginBottom: '25px', textAlign: 'center' }}>Welcome to FacetsFlow</h2>
        <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '5px', display: 'flex', justifyContent: 'center' }}>
          <TextInput
            id="username"
            name="username"
            labelText="Username:"
            value={formData.username}
            onChange={handleInputChange}
            size='lg'
            required
          />
        </div>

        <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'center', }}>
          <TextInput
            id="password"
            name="password"
            type="password"
            labelText="Password:"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>

        {error && (
          <div style={{ 
            color: 'red', 
            marginBottom: '15px',
            padding: '10px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            type="submit"
            disabled={loading}
            style={{
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </div>
      </form>
      </div>
    </div>
  );
}