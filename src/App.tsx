import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { MobileTabBar } from './components/MobileTabBar';
import { DashboardPage } from './pages/DashboardPage';
import { CalendarPage } from './pages/CalendarPage';
import { PartnerPage } from './pages/PartnerPage';
import { GuestRadarPage } from './pages/GuestRadarPage';
import { SocialShareModal } from './components/SocialShareModal';
import { PwaInstallModal } from './components/PwaInstallModal';
import { OnboardingWizard } from './components/OnboardingWizard';
import { AuthModal } from './components/AuthModal';

const MainLayout: React.FC = () => {
  const { isOnboarded } = useAuth();
  const location = useLocation();
  const isGuestRadar = location.pathname.startsWith('/radar');

  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(!isOnboarded && !isGuestRadar);

  if (isGuestRadar) {
    return (
      <Routes>
        <Route path="/radar/:token" element={<GuestRadarPage />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] flex flex-col text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      
      {/* Desktop & Tablet Top Navbar */}
      <Navbar 
        onOpenShare={() => setShowShareModal(true)} 
        onOpenInstall={() => setShowInstallModal(true)}
        onOpenAuth={() => setShowAuthModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">
        <Routes>
          <Route 
            path="/" 
            element={
              <DashboardPage 
                onOpenShare={() => setShowShareModal(true)} 
                onOpenOnboarding={() => setShowOnboarding(true)} 
              />
            } 
          />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/partner" element={<PartnerPage />} />
        </Routes>
      </main>

      {/* Mobile iOS Bottom Tab Bar */}
      <MobileTabBar />

      {/* Global Modals */}
      <SocialShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />

      <PwaInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />

      <OnboardingWizard
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <MainLayout />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
