import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ChatbotWidget } from './components/chat/ChatbotWidget';

import { HomePage } from './pages/HomePage';
import { PackagesPage } from './pages/PackagesPage';
import { PackageDetailsPage } from './pages/PackageDetailsPage';
import { DestinationsPage } from './pages/DestinationsPage';
import { DealsPage } from './pages/DealsPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { WishlistPage } from './pages/WishlistPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { NotFoundPage } from './pages/NotFoundPage';

const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, search]);

  return null;
};

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <WishlistProvider>
          <div className="flex min-h-screen flex-col bg-cream-100 text-ink antialiased">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/packages" element={<PackagesPage />} />
                <Route path="/packages/:id" element={<PackageDetailsPage />} />
                <Route path="/destinations" element={<DestinationsPage />} />
                <Route path="/deals" element={<DealsPage />} />
                <Route path="/reviews" element={<ReviewsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
            <ChatbotWidget />
          </div>
        </WishlistProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
