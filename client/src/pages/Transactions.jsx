import { useState, useEffect, useContext } from 'react';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';

export default function Transactions() {
  const { user } = useContext(AuthContext);
  // RBAC Visual Map strictly isolating administrative actions globally over the client route
  const isAdmin = user?.role === 'ADMIN';

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Custom Filters mapped natively bridging into controller limits
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // React Input Structures securely blocking invalid entries
  const [form, setForm] = useState({ amount: '', type: 'expense', category: '', date: '', note: '' });
  const [editId, setEditId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchTransactions = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (category) params.append('category', category);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await api.get(`/transactions?${params.toString()}`);
      setTransactions(res.data.transactions);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Database Sync Failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // Re-fires database retrieval specifically strictly checking RBAC isolation bounds
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, category, startDate, endDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return; // Strict block against interface tampering
    setErrorMsg('');
    
    try {
      if (editId) {
        await api.put(`/transactions/${editId}`, form);
      } else {
        await api.post('/transactions', form);
      }
      setForm({ amount: '', type: 'expense', category: '', date: '', note: '' });
      setEditId(null);
      fetchTransactions(); // Hydrate page cleanly preventing stale elements
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Backend failed to modify record structure.');
    }
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return;
    if (!window.confirm('Action Irreversible: Proceed with permanent destruction?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Target constraint deletion error.');
    }
  };

  const handleEdit = (tx) => {
    if (!isAdmin) return; // Disallows unauthorized components populating target properties entirely
    setEditId(tx._id);
    setForm({
      amount: tx.amount,
      type: tx.type,
      category: tx.category,
      date: tx.date ? tx.date.split('T')[0] : '', // Normalizes Native MongoDB schema layout against HTML formatting correctly
      note: tx.note || ''
    });
  };

  return (
    <div className={`max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 ${isAdmin ? 'lg:grid-cols-3' : ''} gap-8`}>
      
      {/* Read Output Display Matrix */}
      <div className={`col-span-1 ${isAdmin ? 'lg:col-span-2' : ''}`}>
        <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-3">
           Global Financial Records
           {!isAdmin && <span className="bg-yellow-100 text-yellow-800 text-xs py-1 px-2 uppercase tracking-wide rounded">Read-Only Bounds</span>}
        </h2>
        
        {/* Dynamic RBAC Filtering Box */}
        <div className="bg-white p-5 shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-4 items-end text-sm">
          <div>
            <label className="block text-gray-500 font-medium mb-1 text-xs uppercase tracking-wider">Transaction Type</label>
            <select className="border-gray-300 border p-2 focus:ring-green-500 focus:border-green-500" value={type} onChange={e => setType(e.target.value)}>
              <option value="">All Contexts</option>
              <option value="income">Income Streams</option>
              <option value="expense">Operating Expenses</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-500 font-medium mb-1 text-xs uppercase tracking-wider">Category</label>
            <input type="text" className="border-gray-300 border p-2 focus:ring-green-500 focus:border-green-500" placeholder="e.g. Software" value={category} onChange={e => setCategory(e.target.value)} />
          </div>
          <div>
            <label className="block text-gray-500 font-medium mb-1 text-xs uppercase tracking-wider">Start Date</label>
            <input type="date" className="border-gray-300 border p-2" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-gray-500 font-medium mb-1 text-xs uppercase tracking-wider">End Date</label>
            <input type="date" className="border-gray-300 border p-2" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <button onClick={() => { setType(''); setCategory(''); setStartDate(''); setEndDate(''); }} className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 shadow-sm border border-gray-300 transition-colors">Reset Limits</button>
        </div>

        {/* Mongoose Payload Render Table */}
        <div className="bg-white border border-gray-200 shadow-sm overflow-x-auto">
          {errorMsg && <div className="p-3 bg-red-50 text-red-600 border-b border-red-200">{errorMsg}</div>}
          {loading ? <p className="p-6 text-gray-500 animate-pulse text-center">Interrogating Server Database...</p> : (
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Classification</th>
                  <th className="p-4 font-semibold">Capital</th>
                  <th className="p-4 font-semibold">Note</th>
                  {isAdmin && <th className="p-4 font-semibold w-32">Administrative</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map(tx => (
                  <tr key={tx._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 whitespace-nowrap text-gray-600">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="p-4 font-medium text-gray-900">{tx.category}</td>
                    <td className="p-4 text-gray-500">{tx.type}</td>
                    <td className={`p-4 font-bold whitespace-nowrap ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>${tx.amount}</td>
                    <td className="p-4 text-gray-500 italic max-w-xs truncate">{tx.note || 'None'}</td>
                    {isAdmin && (
                      <td className="p-4 whitespace-nowrap flex gap-3">
                        <button 
                          onClick={() => handleEdit(tx)} 
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >Edit</button>
                        <button 
                          onClick={() => handleDelete(tx._id)} 
                          className="text-red-600 hover:text-red-800 font-medium"
                        >Terminate</button>
                      </td>
                    )}
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr><td colSpan={isAdmin ? 6 : 5} className="p-8 text-center text-gray-500 italic">No records mapped natively inside isolation boundary</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Write Modification Control Segment - STRICTLY INVISIBLE TO NON-ADMINS */}
      {isAdmin && (
        <div className="lg:mt-0 mt-4">
          <h2 className="text-xl font-bold mb-4 text-gray-800">{editId ? 'Mutate' : 'Establish'} Context Record</h2>
          <form onSubmit={handleSubmit} className="bg-white p-6 shadow-sm border border-gray-200 flex flex-col gap-5 text-sm">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Financial Classification</label>
              <select required className="w-full border-gray-300 border p-2.5 focus:border-green-500 focus:ring-green-500" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                <option value="income">Income Stream</option>
                <option value="expense">Operating Expense</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Capital Volume Structure</label>
              <input required type="number" step="0.01" min="0.01" className="w-full border-gray-300 border p-2.5 focus:border-green-500 focus:ring-green-500" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Identified Category</label>
              <input required type="text" className="w-full border-gray-300 border p-2.5 focus:border-green-500 focus:ring-green-500" value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="e.g. Licensing" />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Explicit Date Reference <span className="text-gray-400 font-normal">(defaults to current)</span></label>
              <input type="date" className="w-full border-gray-300 border p-2.5 focus:border-green-500 focus:ring-green-500" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Architectural Notes</label>
              <textarea className="w-full border-gray-300 border p-2.5 focus:border-green-500 focus:ring-green-500" value={form.note} onChange={e => setForm({...form, note: e.target.value})} rows="3" />
            </div>

            <button type="submit" className="w-full bg-green-600 text-white p-3 font-semibold hover:bg-green-700 transition-colors">
              {editId ? 'Commit Modification' : 'Deploy Record to Database'}
            </button>
            
            {editId && <button type="button" onClick={() => { setEditId(null); setForm({ amount: '', type: 'expense', category: '', date: '', note: '' }); }} className="w-full bg-gray-100 text-gray-700 p-3 font-semibold hover:bg-gray-200 transition-colors border border-gray-300">Abort Execution</button>}
          </form>
        </div>
      )}

    </div>
  );
}
