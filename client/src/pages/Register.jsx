import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(name, email, password);
      // Wait for 2 seconds demonstrating the logical mapping securely 
      setSuccessMsg('Account securely registered as a Viewer! Redirecting...');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white border border-gray-200 py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Create an Account</h2>
        {error && <div className="p-3 mb-4 bg-red-50 text-red-600 border border-red-200 text-sm">{error}</div>}
        {successMsg && <div className="p-3 mb-4 bg-green-50 text-green-700 border border-green-200 font-medium text-sm">{successMsg}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input 
            type="text" placeholder="Full Name" required 
            className="border p-2 focus:ring-green-500 focus:border-green-500"
            value={name} onChange={e => setName(e.target.value)} 
          />
          <input 
            type="email" placeholder="Email Address" required 
            className="border p-2 focus:ring-green-500 focus:border-green-500"
            value={email} onChange={e => setEmail(e.target.value)} 
          />
          <input 
            type="password" placeholder="Secure Password" required 
            className="border p-2 focus:ring-green-500 focus:border-green-500"
            value={password} onChange={e => setPassword(e.target.value)} 
          />
          <button type="submit" disabled={loading} className="bg-green-600 text-white p-2 font-medium hover:bg-green-700 disabled:opacity-50">
            {loading ? 'Processing...' : 'Register'}
          </button>
        </form>
        <p className="mt-4 text-sm text-center">Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Sign In</Link></p>
      </div>
    </div>
  );
}
