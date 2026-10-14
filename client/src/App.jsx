import { NavLink, Route, Routes } from 'react-router-dom';
import Search from './pages/Search.jsx';
import RepoDetails from './pages/RepoDetails.jsx';
import Saved from './pages/Saved.jsx';

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-1 rounded ${isActive ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-200'}`
      }
    >
      {children}
    </NavLink>
  );
}

export default function App() {
  return (
    <div className="min-h-screen">
      <header className="bg-white border-b">
        <nav className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-2">
          <span className="font-bold mr-4">Repo Dashboard</span>
          <NavItem to="/">Search</NavItem>
          <NavItem to="/saved">Saved</NavItem>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Search />} />
          <Route path="/repo/:owner/:name" element={<RepoDetails />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="*" element={<p>Page not found.</p>} />
        </Routes>
      </main>
    </div>
  );
}
