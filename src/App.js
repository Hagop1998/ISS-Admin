import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ConfigProvider, App as AntdApp } from 'antd';
import Layout from './components/Layout/Layout';
import AccessControlList from './pages/AccessControlList';
import UsersFaceList from './pages/UsersFaceList';
import AddressesList from './pages/AddressesList';
import CommunityOverview from './pages/CommunityOverview';
import Login from './pages/Login';
import DevicesList from './pages/DevicesList';
import DeviceConfig from './pages/DeviceConfig';
import CardSettings from './pages/CardSettings';
import PersonalData from './pages/PersonalData';
import ChangePassword from './pages/ChangePassword';
import Home from './pages/Home';
import './App.css';

const ProtectedLayout = () => {
  const token = useSelector((state) => state.auth.token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

const PublicRoute = ({ children }) => {
  const token = useSelector((state) => state.auth.token);

  if (token) {
    return <Navigate to="/access-control/list" replace />;
  }

  return children;
};

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#3C0056',
          borderRadius: 6,
        },
      }}
    >
      <Router>
        <AntdApp>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route element={<ProtectedLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/access-control/list" element={<AccessControlList />} />
              <Route path="/access-control/users-face-list" element={<UsersFaceList />} />
              <Route path="/community/overview" element={<CommunityOverview />} />
              <Route path="/addresses" element={<AddressesList />} />
              <Route path="/device-manager/devices" element={<DevicesList />} />
              <Route path="/device-manager/card-settings" element={<CardSettings />} />
              <Route path="/device-manager/device-config" element={<DeviceConfig />} />
              <Route path="/user-settings/personal-data" element={<PersonalData />} />
              <Route path="/user-settings/change-password" element={<ChangePassword />} />
            </Route>
          </Routes>
        </AntdApp>
      </Router>
    </ConfigProvider>
  );
}

export default App;

