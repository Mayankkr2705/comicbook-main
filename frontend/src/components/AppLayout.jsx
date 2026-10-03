import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Menu, X, Home, Image, User, LogOut, Sparkles, BookOpen,
} from "lucide-react";

/**
 * AppLayout component — navigation and page wrapper
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} props.currentView
 * @param {Function} props.onNavigate
 * @param {Function} props.onShowAuth - opens auth modal with given tab
 */
export default function AppLayout({ children, currentView, onNavigate, onShowAuth }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "feed", label: "Feed", icon: Home },
    { id: "create", label: "Create Comic", icon: Sparkles },
    { id: "story-generator", label: "Generate Story", icon: BookOpen },
    { id: "profile", label: "Profile", icon: User, authRequired: true },
  ];

  const handleNavigate = (viewId) => {
    setMobileMenuOpen(false);
    if (onNavigate) onNavigate(viewId);
  };

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 via-sky-200 to-pink-100">
      {/* Navigation Bar */}
      <nav className="bg-white border-b-4 border-purple-400 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-300 rounded-2xl flex items-center justify-center shadow-lg border-4 border-purple-600 transform hover:rotate-12 transition-transform">
                <Image className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent hidden sm:block">
                Comic Verse!
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-3">
              {navItems.map((item) => {
                if (item.authRequired && !isAuthenticated) return null;
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-${item.id}`}
                    onClick={() => handleNavigate(item.id)}
                    className={`btn-fun flex items-center gap-2 px-5 py-3 transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                        : "bg-gradient-to-r from-yellow-300 to-orange-300 text-purple-900 hover:from-yellow-400 hover:to-orange-400"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-bold text-sm">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* User Menu / Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <span className="text-purple-700 font-bold text-sm">
                    👋 {user?.username}
                  </span>
                  <button
                    id="nav-logout"
                    onClick={handleLogout}
                    className="btn-fun flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-red-400 to-pink-400 text-white hover:from-red-500 hover:to-pink-500"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    id="nav-login"
                    onClick={() => onShowAuth?.('login')}
                    className="btn-fun px-5 py-3 bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-white font-bold"
                  >
                    Sign In
                  </button>
                  <button
                    id="nav-register"
                    onClick={() => onShowAuth?.('register')}
                    className="btn-fun px-5 py-3 bg-gradient-to-r from-yellow-300 to-orange-300 hover:from-yellow-400 hover:to-orange-400 text-purple-900 font-bold"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden bg-gradient-to-r from-purple-400 to-pink-400 p-2 rounded-xl border-3 border-purple-600 shadow-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t-4 border-purple-400 bg-gradient-to-b from-pink-100 to-purple-100">
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => {
                if (item.authRequired && !isAuthenticated) return null;
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-bold ${
                      isActive
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                        : "text-purple-700 hover:bg-gradient-to-r hover:from-yellow-300 hover:to-orange-300"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <div className="pt-4 border-t-4 border-purple-300">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-white rounded-xl shadow-md">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-3 border-purple-400">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-purple-900 font-bold text-sm">{user?.username}</p>
                        <p className="text-purple-600 text-xs">{user?.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="btn-fun w-full flex items-center gap-3 px-4 py-3 text-white bg-gradient-to-r from-red-400 to-pink-400 hover:from-red-500 hover:to-pink-500 rounded-xl font-bold"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => { setMobileMenuOpen(false); onShowAuth?.('login'); }}
                      className="btn-fun w-full px-4 py-3 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-xl font-bold"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => { setMobileMenuOpen(false); onShowAuth?.('register'); }}
                      className="btn-fun w-full px-4 py-3 bg-gradient-to-r from-yellow-300 to-orange-300 text-purple-900 rounded-xl font-bold"
                    >
                      Register
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-purple-400 mt-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-purple-900 text-lg font-bold">
            ✨ © 2025 Comic Story World! Create and share amazing stories! ✨
          </p>
        </div>
      </footer>
    </div>
  );
}
