import { useState, useEffect, useContext } from 'react';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  // Hydrate visual components directly mapping against API boundaries
  useEffect(() => {
    // Structural Guard protecting backend API from raw Viewers
    if (user?.role === 'VIEWER') return;

    const fetchSummary = async () => {
      try {
        const res = await api.get('/dashboard/summary');
        setData(res.data.data);
      } catch (err) {
        if (err.response?.status === 403) {
          setError('Access Denied (403): Analytical structures natively mandate Analyst or Admin clearance layers.');
        } else {
          setError(err.response?.data?.message || 'Failed to initialize metric pipelines.');
        }
      }
    };
    fetchSummary();
  }, [user]);

  // Fast-fail UX conditional halting rendering natively preventing loading flashes
  if (user?.role === 'VIEWER') {
    return (
      <div className="max-w-7xl mx-auto mt-10 p-6 flex justify-center">
        <div className="p-8 bg-gray-50 text-gray-700 text-center border border-gray-200 shadow-sm max-w-lg">
          <h2 className="text-2xl font-bold mb-2 text-red-600">Access Denied (403)</h2>
          <p className="font-medium">Your current <b className="text-gray-900">VIEWER</b> security clearance does not map privileges sufficient to interrogate global organizational analytics or internal reporting structures.</p>
        </div>
      </div>
    );
  }

  if (error) return <div className="max-w-7xl mx-auto mt-10 p-4 text-red-600 font-medium bg-red-50 border border-red-200">{error}</div>;
  if (!data) return <div className="max-w-7xl mx-auto mt-10 p-4 font-bold text-gray-500 animate-pulse text-center">Synchronizing Complex Dashboard Pipelines...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Dashboard Analytics
      </h2>

      {/* Prime KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="border border-gray-200 p-6 shadow-sm bg-white">
          <h3 className="text-gray-500 uppercase text-xs tracking-wider mb-2 font-semibold">Total Cumulative Income</h3>
          <p className="text-3xl text-green-600 font-bold">${data.totalIncome}</p>
        </div>
        <div className="border border-gray-200 p-6 shadow-sm bg-white">
          <h3 className="text-gray-500 uppercase text-xs tracking-wider mb-2 font-semibold">Total Operating Expenses</h3>
          <p className="text-3xl text-red-600 font-bold">${data.totalExpense}</p>
        </div>
        <div className="border border-gray-200 p-6 shadow-sm bg-white">
          <h3 className="text-gray-500 uppercase text-xs tracking-wider mb-2 font-semibold">Net Active Balance</h3>
          <p className="text-3xl text-blue-600 font-bold">${data.netBalance}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-bold mb-4 text-gray-800 text-lg border-b pb-2">Category Financial Matrix</h3>
          <ul className="bg-white border border-gray-200 shadow-sm p-0 overflow-hidden divide-y divide-gray-100">
            {data.categoryBreakdown.length === 0 && <li className="p-4 text-gray-500 text-sm italic">No categorical logic determined.</li>}
            {data.categoryBreakdown.map((cat, i) => (
              <li key={i} className="flex justify-between items-center p-4 hover:bg-gray-50">
                <span className="text-gray-700 font-medium">{cat.category}</span>
                <span className="font-bold text-gray-900">${cat.total}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-4 text-gray-800 text-lg border-b pb-2">Recent Execution Traces</h3>
          <ul className="bg-white border border-gray-200 shadow-sm p-0 overflow-hidden divide-y divide-gray-100">
            {data.recentTransactions.length === 0 && <li className="p-4 text-gray-500 text-sm italic">No transactions available within boundary.</li>}
            {data.recentTransactions.map(tx => (
              <li key={tx._id} className="p-4 text-sm flex justify-between items-center hover:bg-gray-50">
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-gray-800">{tx.category}</span>
                  <span className="text-xs text-gray-500 uppercase">{new Date(tx.date).toLocaleDateString()}</span>
                </div>
                <span className={`font-bold text-base ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.type === 'income' ? '+' : '-'}${tx.amount}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
