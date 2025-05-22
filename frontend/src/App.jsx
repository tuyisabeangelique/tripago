import { Routes, Route, HashRouter } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import "./App.css";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import PasswordReset from "./pages/PasswordReset.jsx";
import NewPassword from "./pages/NewPassword.jsx";
import StyleGuide from "./pages/StyleGuide.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Settings from "./pages/settings/Settings.jsx";
import SettingsProfileDetails from "./pages/settings/SettingsProfileDetails.jsx";
import SettingsAccessibility from "./pages/settings/SettingsAccessibility.jsx";
import SettingsLanguageAndRegion from "./pages/settings/SettingsLanguageAndRegion.jsx";
import SettingsManagePassword from "./pages/settings/SettingsManagePassword.jsx";
import SettingsRecentActivity from "./pages/settings/SettingsRecentActivity.jsx";
import SettingsMyData from "./pages/settings/SettingsMyData.jsx";
import DeleteAccount from './pages/settings/SettingsDeleteAccount.jsx';
import SettingsTermsOfService from "./pages/settings/SettingsTermsOfService.jsx";
import SettingsPrivacyPolicy from "./pages/settings/SettingsPrivacyPolicy.jsx";
import Profile from "./pages/profile/Profile.jsx";
import Recommended from "./pages/Recommended.jsx";
import Favorites from "./pages/Favorites.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Hotels from "./pages/hotels/Hotels.jsx";
import LoadingScreen from "./pages/LoadingScreen.jsx";
import UserProfile from "./pages/user/UserProfile.jsx";
import NewDestination from "./pages/profile/NewDestination.jsx";
import AcceptRejectDest from "./pages/profile/AcceptRejectDest.jsx";
import AllTrips from "./pages/alltrips/AllTrips.jsx";
import { UserProvider } from "./context/UserContext.jsx";
import Community from "./pages/community/Community.jsx";
import TravelerProfile from "./pages/community/TravelerProfile.jsx";
import DirectMessages from "./pages/dm/DirectMessages.jsx";
import MessageThread from "./pages/dm/MessageThread.jsx";

const App = () => {
  return (
    <UserProvider>
      <HashRouter>
        <div className="app-container">
          <Navbar />

          <main className="content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<PasswordReset />} />
              <Route path="/new-password" element={<NewPassword />} />
              <Route path="/new-password/:key" element={<NewPassword />} />
              <Route path="/style-guide" element={<StyleGuide />} />
              <Route path="/loading-screen" element={<LoadingScreen />} />
              <Route
                path="/profile/accept-reject"
                element={<AcceptRejectDest />}
              />

              {/* Protected Routes: Only logged in users can access these pages */}
              <Route
                path="/all-trips"
                element={
                  <ProtectedRoute>
                    <AllTrips />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/favorites"
                element={
                  <ProtectedRoute>
                    <Favorites />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/traveler-profile/:email"
                element={
                  <ProtectedRoute>
                    <TravelerProfile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile/new-destination"
                element={
                  //<ProtectedRoute>
                  <NewDestination />
                  //</ProtectedRoute>
                }
              />
              <Route
                path="/user-profile"
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/browse-hotels"
                element={
                  <ProtectedRoute>
                    <Hotels />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/recommended"
                element={
                  <ProtectedRoute>
                    <Recommended />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <DirectMessages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages/:name"
                element={
                  <ProtectedRoute>
                    <MessageThread />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/profile-details"
                element={
                  <ProtectedRoute>
                    <SettingsProfileDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/accessibility"
                element={
                  <ProtectedRoute>
                    <SettingsAccessibility />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/language-and-region"
                element={
                  <ProtectedRoute>
                    <SettingsLanguageAndRegion />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/manage-password"
                element={
                  <ProtectedRoute>
                    <SettingsManagePassword />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/recent-activity"
                element={
                  <ProtectedRoute>
                    <SettingsRecentActivity />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/my-data"
                element={
                  <ProtectedRoute>
                    <SettingsMyData />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/delete-account"
                element={
                  <ProtectedRoute>
                    <DeleteAccount />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/terms-of-service"
                element={
                  <ProtectedRoute>
                    <SettingsTermsOfService />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/privacy-policy"
                element={
                  <ProtectedRoute>
                    <SettingsPrivacyPolicy />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/community"
                element={
                  <ProtectedRoute>
                    <Community />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>

          <Footer />
        </div>
      </HashRouter>
    </UserProvider>
  );
};

export default App;
