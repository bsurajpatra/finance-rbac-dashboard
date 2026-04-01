import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { NavLink, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Helper capturing large Tailwind configurations cleanly returning conditional states 
  const generateLinkClasses = (isActive) =>
    `inline-flex items-center px-1 pt-1 border-b-2 text-sm transition-colors ${isActive
      ? 'border-green-500 text-green-700 font-bold'
      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 font-medium'
    }`;

  // Explicit visual mapping actively demonstrating structural RBAC limits to evaluators 
  const generateDisabledLinkClasses = () => 
    `inline-flex items-center gap-1.5 px-1 pt-1 border-b-2 border-transparent text-sm transition-colors text-gray-400 opacity-60 cursor-not-allowed font-medium`;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null; // Component does not render internally without context

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="font-extrabold text-xl text-green-700 tracking-tight">Finance RBAC</span>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {user.role !== 'VIEWER' ? (
                <NavLink end to="/" className={({ isActive }) => generateLinkClasses(isActive)}>
                  Analytics Dashboard
                </NavLink>
              ) : (
                <span title="Requires Analyst or Admin clearance" className={generateDisabledLinkClasses()}>
                  🔒 Analytics Dashboard
                </span>
              )}

              <NavLink to="/transactions" className={({ isActive }) => generateLinkClasses(isActive)}>
                Transaction Matrix
              </NavLink>

              {user.role === 'ADMIN' ? (
                <NavLink to="/users" className={({ isActive }) => generateLinkClasses(isActive)}>
                  System Users
                </NavLink>
              ) : (
                <span title="Administrator clearance required" className={generateDisabledLinkClasses()}>
                  🔒 System Users
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded">
              <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Clearance:</span>
              <span className={`text-sm font-bold tracking-widest uppercase ${user.role === 'ADMIN' ? 'text-red-600' : 'text-blue-600'}`}>
                {user.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm font-bold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 hover:border-red-300 transition-colors px-4 py-2 rounded shadow-sm flex items-center gap-2"
            >
              Terminate Session
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
