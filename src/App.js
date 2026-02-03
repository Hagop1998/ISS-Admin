import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { ConfigProvider, App as AntdApp } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import Layout from './components/Layout/Layout';
import AccessControlList from './pages/AccessControlList';
import UsersFaceList from './pages/UsersFaceList';
import UsersList from './pages/UsersList';
import UserDetail from './pages/UserDetail';
import UserManagement from './pages/UserManagement';
import AddressesList from './pages/AddressesList';
import CommunityOverview from './pages/CommunityOverview';
import Login from './pages/Login';
import DeviceConfig from './pages/DeviceConfig';
import CardSettings from './pages/CardSettings';
import PersonalData from './pages/PersonalData';
import ChangePassword from './pages/ChangePassword';
import Home from './pages/Home';
import DoorOpeningRecord from './pages/DoorOpeningRecord';
import DoorConfiguration from './pages/DoorConfiguration';
import CustomSettings from './pages/CustomSettings';
import CreateSubscription from './pages/CreateSubscription';
import CreateSubscriptionPlan from './pages/CreateSubscriptionPlan';
import SubscriptionPlansList from './pages/SubscriptionPlansList';
import VideoUpload from './pages/VideoUpload';
import VideosList from './pages/VideosList';
import AnnouncementsList from './pages/AnnouncementsList';
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
  const { i18n } = useTranslation();
  const antdLocale = i18n.language?.startsWith('ru') ? ruRU : undefined;

  return (
    <ConfigProvider
      locale={antdLocale}
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
              <Route path="/access-control/configure/:deviceId" element={<DoorConfiguration />} />
              <Route path="/access-control/custom-settings" element={<CustomSettings />} />
              <Route path="/access-control/custom-settings/:deviceId" element={<CustomSettings />} />
              <Route path="/access-control/door-opening-record" element={<DoorOpeningRecord />} />
              <Route path="/access-control/users-face-list" element={<UsersFaceList />} />
              <Route path="/community/overview" element={<CommunityOverview />} />
              <Route path="/addresses" element={<AddressesList />} />
              <Route path="/device-manager/card-settings" element={<CardSettings />} />
              <Route path="/device-manager/device-config" element={<DeviceConfig />} />
              <Route path="/user-management" element={<UserManagement />} />
              <Route path="/users" element={<UsersList />} />
              <Route path="/users/:id" element={<UserDetail />} />
              <Route path="/user-settings/personal-data" element={<PersonalData />} />
              <Route path="/user-settings/change-password" element={<ChangePassword />} />
              <Route path="/subscriptions/create" element={<CreateSubscription />} />
              <Route path="/subscriptions/create-plan" element={<CreateSubscriptionPlan />} />
              <Route path="/subscriptions/list" element={<SubscriptionPlansList />} />
              <Route path="/media/upload-video" element={<VideoUpload />} />
              <Route path="/media/videos" element={<VideosList />} />
              <Route path="/announcements" element={<AnnouncementsList />} />
            </Route>
          </Routes>
        </AntdApp>
      </Router>
    </ConfigProvider>
  );
}

export default App;

