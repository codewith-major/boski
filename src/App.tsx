import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { PublicAuthRoute } from './components/layout/PublicAuthRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { OrderProvider } from './contexts/OrderContext';
import { TrustProvider } from './contexts/TrustContext';
import { ResourceProvider } from './contexts/ResourceContext';
import { MessageProvider } from './contexts/MessageContext';
import { ActivityProvider } from './contexts/ActivityContext';
import { ModerationProvider } from './contexts/ModerationContext';

// Pages
import Auth from './pages/Auth';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Post from './pages/Post';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Profile from './pages/Profile';
import ResourceDetail from './pages/ResourceDetail';
import RequestFlow from './pages/RequestFlow';
import Activity from './pages/Activity';

// Admin Pages
import AdminOverview from './pages/admin/AdminOverview';
import AdminStudents from './pages/admin/AdminStudents';
import AdminStudentDetail from './pages/admin/AdminStudentDetail';
import AdminListings from './pages/admin/AdminListings';
import AdminOrders from './pages/admin/AdminOrders';
import AdminReports from './pages/admin/AdminReports';
import AdminReportDetail from './pages/admin/AdminReportDetail';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminShell from './components/admin/AdminShell';

function RootRedirect() {
  const { profile, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F3EC]">
        <Loader2 className="h-8 w-8 animate-spin text-[#171719]" />
      </div>
    );
  }
  return <Navigate to={profile ? "/home" : "/signin"} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <ResourceProvider>
        <ModerationProvider>
          <OrderProvider>
            <TrustProvider>
              <MessageProvider>
                <ActivityProvider>
                  <BrowserRouter>
                    <Routes>
                      {/* Public Auth Routes */}
                      <Route path="/" element={<RootRedirect />} />
                      <Route
                        path="/signin"
                        element={
                          <PublicAuthRoute>
                            <Auth initialMode="login" />
                          </PublicAuthRoute>
                        }
                      />
                      <Route
                        path="/signup"
                        element={
                          <PublicAuthRoute>
                            <Auth initialMode="signup" />
                          </PublicAuthRoute>
                        }
                      />
                      <Route
                        path="/auth"
                        element={
                          <PublicAuthRoute>
                            <Auth />
                          </PublicAuthRoute>
                        }
                      />

                      {/* Admin Routes */}
                      <Route path="/admin" element={<ProtectedRoute><AdminShell /></ProtectedRoute>}>
                        <Route index element={<Navigate to="/admin/overview" replace />} />
                        <Route path="analytics" element={<AdminAnalytics />} />
                        <Route path="overview" element={<AdminOverview />} />
                        <Route path="students" element={<AdminStudents />} />
                        <Route path="students/:id" element={<AdminStudentDetail />} />
                        <Route path="listings" element={<AdminListings />} />
                        <Route path="orders" element={<AdminOrders />} />
                        <Route path="reports" element={<AdminReports />} />
                        <Route path="reports/:id" element={<AdminReportDetail />} />
                      </Route>

                      {/* Student Routes */}
                      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
                        <Route path="/home" element={<Home />} />
                        <Route path="/explore" element={<Explore />} />
                        <Route path="/post" element={<Post />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/orders/:id" element={<OrderDetail />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/resource/:id" element={<ResourceDetail />} />
                        <Route path="/resource/:id/request" element={<RequestFlow />} />
                        <Route path="/activity" element={<Activity />} />
                        <Route path="*" element={<Navigate to="/home" replace />} />
                      </Route>
                    </Routes>
                  </BrowserRouter>
                </ActivityProvider>
              </MessageProvider>
            </TrustProvider>
          </OrderProvider>
        </ModerationProvider>
      </ResourceProvider>
    </AuthProvider>
  );
}
