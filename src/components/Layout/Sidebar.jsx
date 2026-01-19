import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserOutlined } from '@ant-design/icons';
import { toggleMenu } from '../../store/slices/navigationSlice';
import { logout } from '../../store/slices/authSlice';

const Sidebar = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const expandedMenus = useSelector((state) => state.navigation.expandedMenus);

  const isExpanded = (menuId) => expandedMenus.includes(menuId);
  const isActive = (path) => location.pathname === path;

  const handleMenuClick = (menuId) => {
    dispatch(toggleMenu(menuId));
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    if (onClose) onClose();
  };

  return (
    <div
      className={`
        w-64 h-screen text-white border-r border-primary-700/40 bg-gradient-to-b from-[#1b1426] via-[#1f1530] to-[#120a1f]
        fixed inset-y-0 left-0 z-40
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      <div className="h-full overflow-y-auto p-4">
        <h2 className="text-xl font-semibold mb-6 text-primary-200 drop-shadow-sm">User Centre</h2>
        
        <nav className="space-y-1">
          {/* Home */}
          <button
            className={`w-full flex items-center space-x-2 px-3 py-2 rounded border transition ${
              isActive('/')
                ? 'bg-primary-500/25 border-primary-300/40 text-primary-100'
                : 'border-white/10 bg-white/5 text-gray-100 hover:bg-primary-500/20 hover:border-primary-400/40'
            }`}
            onClick={() => handleNavigation('/')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Home</span>
          </button>

          {/* Community Mgt */}
          <div>
            <button
              className={`w-full flex items-center justify-between px-3 py-2 rounded border transition ${
                isExpanded('community') || isActive('/addresses') || isActive('/community/overview')
                  ? 'bg-primary-500/25 border-primary-300/40 text-primary-100'
                  : 'border-white/10 bg-white/5 text-gray-100 hover:bg-primary-500/20 hover:border-primary-400/40'
              }`}
              onClick={() => handleMenuClick('community')}
            >
              <span>Community Mgt</span>
              <svg
                className={`w-4 h-4 transition-transform ${isExpanded('community') ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            {isExpanded('community') && (
              <div className="ml-4 mt-1 space-y-1">
                <button
                  className={`w-full flex items-center justify-between px-3 py-2 rounded text-sm border transition ${
                    isActive('/community/overview')
                      ? 'bg-primary-500/25 border-primary-300/40 text-primary-100'
                      : 'border-white/10 bg-white/5 text-gray-100 hover:bg-primary-500/20 hover:border-primary-400/40'
                  }`}
                  onClick={() => handleNavigation('/community/overview')}
                >
                  <span>Overview</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  className={`w-full flex items-center justify-between px-3 py-2 rounded text-sm border transition ${
                    isActive('/addresses')
                      ? 'bg-primary-500/25 border-primary-300/40 text-primary-100'
                      : 'border-white/10 bg-white/5 text-gray-100 hover:bg-primary-500/20 hover:border-primary-400/40'
                  }`}
                  onClick={() => handleNavigation('/addresses')}
                >
                  <span>Addresses</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Access Control Mgt */}
          <div>
            <button
              className={`w-full flex items-center justify-between px-3 py-2 rounded border transition ${
                isActive('/access-control/list') || isActive('/device-manager/device-config') || isActive('/access-control/custom-settings')
                  ? 'bg-primary-500/25 border-primary-300/40 text-primary-100'
                  : 'border-white/10 bg-white/5 text-gray-100 hover:bg-primary-500/20 hover:border-primary-400/40'
              }`}
              onClick={() => handleMenuClick('access-control')}
            >
              <span>Device Control</span>
              <svg
                className={`w-4 h-4 transition-transform ${isExpanded('access-control') ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            {isExpanded('access-control') && (
              <div className="ml-4 mt-1 space-y-1">
                <button
                  className={`w-full flex items-center justify-between px-3 py-2 rounded text-sm border transition ${
                    isActive('/access-control/list')
                      ? 'bg-primary-500/25 border-primary-300/40 text-primary-100'
                      : 'border-white/10 bg-white/5 text-gray-100 hover:bg-primary-500/20 hover:border-primary-400/40'
                  }`}
                  onClick={() => handleNavigation('/access-control/list')}
                >
                  <span>Devices List</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  className={`w-full flex items-center justify-between px-3 py-2 rounded text-sm border transition ${
                    isActive('/access-control/custom-settings')
                      ? 'bg-primary-500/25 border-primary-300/40 text-primary-100'
                      : 'border-white/10 bg-white/5 text-gray-100 hover:bg-primary-500/20 hover:border-primary-400/40'
                  }`}
                  onClick={() => handleNavigation('/access-control/custom-settings')}
                >
                  <span>Device Settings</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  className={`w-full flex items-center justify-between px-3 py-2 rounded text-sm border transition ${
                    isActive('/device-manager/device-config')
                      ? 'bg-primary-500/25 border-primary-300/40 text-primary-100'
                      : 'border-white/10 bg-white/5 text-gray-100 hover:bg-primary-500/20 hover:border-primary-400/40'
                  }`}
                  onClick={() => handleNavigation('/device-manager/device-config')}
                >
                  <span>Device Config</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Records & Reports */}
          <div>
            <button
              className={`w-full flex items-center justify-between px-3 py-2 rounded border transition ${
                isActive('/access-control/door-opening-record') || isActive('/access-control/users-face-list')
                  ? 'bg-primary-500/25 border-primary-300/40 text-primary-100'
                  : 'border-white/10 bg-white/5 text-gray-100 hover:bg-primary-500/20 hover:border-primary-400/40'
              }`}
              onClick={() => handleMenuClick('records-reports')}
            >
              <span>Records & Reports</span>
              <svg
                className={`w-4 h-4 transition-transform ${isExpanded('records-reports') ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            {isExpanded('records-reports') && (
              <div className="ml-4 mt-1 space-y-1">
                <button
                  className={`w-full flex items-center justify-between px-3 py-2 rounded text-sm border transition ${
                    isActive('/access-control/door-opening-record')
                      ? 'bg-primary-500/25 border-primary-300/40 text-primary-100'
                      : 'border-white/10 bg-white/5 text-gray-100 hover:bg-primary-500/20 hover:border-primary-400/40'
                  }`}
                  onClick={() => handleNavigation('/access-control/door-opening-record')}
                >
                  <span>Door opening record</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  className={`w-full flex items-center justify-between px-3 py-2 rounded text-sm border transition ${
                    isActive('/access-control/users-face-list')
                      ? 'bg-primary-500/25 border-primary-300/40 text-primary-100'
                      : 'border-white/10 bg-white/5 text-gray-100 hover:bg-primary-500/20 hover:border-primary-400/40'
                  }`}
                  onClick={() => handleNavigation('/access-control/users-face-list')}
                >
                  <span>Users Face List</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Card Settings */}
          <div className="mt-4">
            <button
              className={`w-full flex items-center justify-between px-3 py-2 rounded border transition ${
                isActive('/device-manager/card-settings')
                  ? 'bg-primary-500/25 border-primary-300/40 text-primary-100'
                  : 'border-white/10 bg-white/5 text-gray-100 hover:bg-primary-500/20 hover:border-primary-400/40'
              }`}
              onClick={() => handleNavigation('/device-manager/card-settings')}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span>Card Settings</span>
              </div>
            </button>
          </div>

          <div className="mt-4">
            <button
              className={`w-full flex items-center justify-between px-3 py-2 rounded border transition ${
                isExpanded('userSettings') || isActive('/user-settings/personal-data') || isActive('/user-settings/change-password')
                  ? 'bg-primary-500/25 border-primary-300/40 text-primary-100'
                  : 'border-white/10 bg-white/5 text-gray-100 hover:bg-primary-500/20 hover:border-primary-400/40'
              }`}
              onClick={() => handleMenuClick('userSettings')}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Profile Settings</span>
              </div>
              <svg
                className={`w-4 h-4 transition-transform ${isExpanded('userSettings') ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            {isExpanded('userSettings') && (
              <div className="ml-4 mt-1 space-y-1">
                <button
                  className={`w-full flex items-center justify-between px-3 py-2 rounded text-sm border transition ${
                    isActive('/user-settings/personal-data')
                      ? 'bg-primary-500/25 border-primary-300/40 text-primary-100'
                      : 'border-white/10 bg-white/5 text-gray-100 hover:bg-primary-500/20 hover:border-primary-400/40'
                  }`}
                  onClick={() => handleNavigation('/user-settings/personal-data')}
                >
                  <span>Personal Data</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  className={`w-full flex items-center justify-between px-3 py-2 rounded text-sm border transition ${
                    isActive('/user-settings/change-password')
                      ? 'bg-primary-500/25 border-primary-300/40 text-primary-100'
                      : 'border-white/10 bg-white/5 text-gray-100 hover:bg-primary-500/20 hover:border-primary-400/40'
                  }`}
                  onClick={() => handleNavigation('/user-settings/change-password')}
                >
                  <span>Change Password</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Log Out */}
          <button
            className="w-full flex items-center space-x-2 px-3 py-2 rounded border border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:border-red-400/60 transition"
            onClick={handleLogout}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Log Out</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;

