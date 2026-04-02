import { useState, useEffect, useContext } from 'react';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';

export default function Users() {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'ADMIN';

  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [emailQuery, setEmailQuery] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.get(`/users?page=${page}&limit=10&email=${emailQuery}`);
      setUsersList(res.data.data.users);
      setTotalPages(res.data.data.pagination.pages);
    } catch (err) {
      if (err.response?.status === 403) {
        setErrorMsg('Access Denied: You require Administrator privileges to view this page.');
      } else {
        setErrorMsg(err.response?.data?.message || 'Database Sync Failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, emailQuery, isAdmin]);

  const handleRoleChange = async (userId, newRole) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole });
      setSuccessMsg('Role updated successfully.');
      fetchUsers(); // Cleanly re-hydrate application rendering dynamically avoiding stale matrices
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Logic Exception: Failed to execute role constraint assignment.');
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await api.patch(`/users/${userId}/status`, { isActive: !currentStatus });
      setSuccessMsg('Status updated successfully.');
      fetchUsers();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Logic Exception: Unable to modify operational target statuses.');
    }
  };

  // 1. RBAC Guard mapping Viewer/Analyst payloads outside the DOM natively
  if (!isAdmin) {
    return (
      <div className="max-w-7xl mx-auto mt-10 p-6 flex justify-center">
         <div className="p-8 bg-red-50 text-red-700 text-center border border-red-200 shadow-sm max-w-lg">
            <h2 className="text-2xl font-bold mb-2">Access Denied (403)</h2>
            <p className="text-sm">You must possess full <b>ADMIN</b> capabilities to query the identity architecture.</p>
         </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">User Governance Matrix</h2>
      
      {/* 2. Intelligent Data Filtering UI Element */}
      <div className="bg-white p-4 shadow-sm border border-gray-200 mb-6 flex items-end gap-4 text-sm">
        <div className="flex-1 max-w-sm">
          <label className="block text-gray-500 font-medium mb-1 text-xs uppercase tracking-wider">Target Node (Email)</label>
          <input 
            type="text" className="w-full border-gray-300 border p-2 focus:ring-green-500 focus:border-green-500" 
            placeholder="Search email parameter..." 
            value={emailQuery} onChange={e => { setEmailQuery(e.target.value); setPage(1); }} 
          />
        </div>
        <button onClick={() => { setEmailQuery(''); setPage(1); }} className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 shadow-sm border border-gray-300 transition-colors">Wipe Param Bounds</button>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm overflow-x-auto">
        {errorMsg && <div className="p-4 bg-red-50 text-red-600 border-b border-red-200 font-medium">{errorMsg}</div>}
        {successMsg && <div className="p-4 bg-green-50 text-green-700 border-b border-green-200 font-medium transition-all">{successMsg}</div>}
        {loading ? <p className="p-6 text-gray-500 animate-pulse text-center font-medium">Interrogating Server Directory Hash Arrays...</p> : (
          <table className="w-full text-left text-sm border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">User Identity String</th>
                <th className="p-4 font-semibold">Address Parameter</th>
                <th className="p-4 font-semibold w-40">Role Clearance Level</th>
                <th className="p-4 font-semibold w-32">Architectural Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {usersList.map(u => (
                <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-900">
                    {u.name} 
                    {user.userId === u._id && <span className="text-xs ml-2 uppercase text-green-600 tracking-wider font-bold">(Self)</span>}
                  </td>
                  <td className="p-4 text-gray-500">{u.email}</td>
                  <td className="p-4 whitespace-nowrap">
                     <select 
                       className="border border-gray-300 p-1.5 focus:ring-green-500 text-sm disabled:opacity-50 disabled:bg-gray-100"
                       value={u.role}
                       onChange={(e) => handleRoleChange(u._id, e.target.value)}
                       disabled={user.userId === u._id} // Prevents disastrous self-demotion from Admin
                     >
                        <option value="VIEWER">VIEWER</option>
                        <option value="ANALYST">ANALYST</option>
                        <option value="ADMIN">ADMIN</option>
                     </select>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <select
                      className={`border p-1.5 focus:ring-2 focus:ring-offset-1 text-sm disabled:opacity-50 disabled:bg-gray-100 w-full ${
                        u.isActive ? 'border-green-300 text-green-700 bg-green-50' : 'border-red-300 text-red-700 bg-red-50'
                      }`}
                      value={u.isActive ? 'active' : 'suspended'}
                      onChange={(e) => handleStatusToggle(u._id, u.isActive)}
                      disabled={user.userId === u._id} // Prevents self-suspension
                    >
                      <option value="active">Operating</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </td>
                </tr>
              ))}
              {usersList.length === 0 && (
                <tr><td colSpan="4" className="p-8 text-center text-gray-500 italic">No mapped identities successfully conform to the lookup structures.</td></tr>
              )}
            </tbody>
          </table>
        )}
        
        {/* 3. Logical Sequential Pagination Framework */}
        {!loading && totalPages > 1 && (
           <div className="p-4 border-t border-gray-200 flex justify-between items-center text-sm bg-gray-50">
             <button 
                 disabled={page === 1} 
                 onClick={() => setPage(p => Math.max(1, p - 1))}
                 className="px-4 py-2 border border-gray-300 bg-white disabled:opacity-50 hover:bg-gray-100 text-gray-700 font-medium transition-colors"
             >
                 Previous Phase
             </button>
             <span className="text-gray-500 font-medium">Rendering Index {page} of {totalPages}</span>
             <button 
                 disabled={page === totalPages} 
                 onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                 className="px-4 py-2 border border-gray-300 bg-white disabled:opacity-50 hover:bg-gray-100 text-gray-700 font-medium transition-colors"
             >
                 Next Phase
             </button>
           </div>
        )}
      </div>
    </div>
  );
}
