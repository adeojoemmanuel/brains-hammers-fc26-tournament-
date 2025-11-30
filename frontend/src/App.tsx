import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import RegistrationForm from './components/RegistrationForm';
import PlayerTable from './components/PlayerTable';
import TeamPairings from './components/TeamPairings';
import AdminController from './components/AdminController';

function AppContent() {
  const location = useLocation();
  const isRegistrationPage = location.pathname === '/';
  
  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col overflow-hidden">
      {/* Modern Navigation */}
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20 flex-shrink-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">⚽</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                B&H FC26 Championship
              </h1>
            </div>
            <div className="flex space-x-1">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-purple-500/50'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                Register
              </NavLink>
              <NavLink
                to="/table"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-purple-500/50'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                Players
              </NavLink>
              <NavLink
                to="/pairings"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-purple-500/50'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                Team Pairings
              </NavLink>
              <NavLink
                to="/admin-controller"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-purple-500/50'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                Admin
              </NavLink>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className={`container mx-auto px-4 sm:px-6 lg:px-8 h-full py-4 ${
          isRegistrationPage ? 'flex items-center justify-center' : 'overflow-y-auto'
        }`}>
          <Routes>
            <Route path="/" element={<RegistrationForm />} />
            <Route path="/table" element={<PlayerTable />} />
            <Route path="/pairings" element={<TeamPairings />} />
            <Route path="/admin-controller" element={<AdminController />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
