import { useState } from 'react';
import api from './api/api';

function App() {
  const [healthStatus, setHealthStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkBackendHealth = async () => {
    setLoading(true);
    setError('');
    setHealthStatus('');
    
    try {
      const response = await api.get('/health');
      setHealthStatus(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to connect to backend. Verify the Node server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Finance RBAC
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Secure Role-Based Access Control Dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow border border-gray-200 sm:rounded-lg sm:px-10">
          
          <button 
            onClick={checkBackendHealth}
            disabled={loading}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Checking System...' : 'Ping Backend System'}
          </button>

          <div className="mt-6 min-h-[70px]">
            {healthStatus && (
              <div className="rounded-md bg-green-50 p-4 border border-green-200">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      System Online
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>{healthStatus}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="rounded-md bg-red-50 p-4 border border-red-200">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Connection Failed
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default App;
