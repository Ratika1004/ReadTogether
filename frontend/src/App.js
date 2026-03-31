import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Navbar  from "./components/Navbar";
import Footer  from "./components/Footer";

import Login         from "./pages/Login";
import Signup        from "./pages/Signup";
import BookSearch    from "./pages/BookSearch";
import BookFeed      from "./pages/BookFeed";
import Profile       from "./pages/Profile";
import Feed          from "./pages/Feed";
import FriendFeed    from "./pages/FriendFeed";
import Notifications from "./pages/Notifications";
import UserSearch    from "./pages/UserSearch";

import "./styles/global.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <main className="app-main">
            <Routes>
              {/* Public */}
              <Route path="/login"  element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected */}
              <Route path="/feed"           element={<ProtectedRoute><Feed /></ProtectedRoute>} />
              <Route path="/friends"        element={<ProtectedRoute><FriendFeed /></ProtectedRoute>} />
              <Route path="/search"         element={<ProtectedRoute><BookSearch /></ProtectedRoute>} />
              <Route path="/people"         element={<ProtectedRoute><UserSearch /></ProtectedRoute>} />
              <Route path="/profile"        element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/profile/:id"    element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/books/:bookId"  element={<ProtectedRoute><BookFeed /></ProtectedRoute>} />
              <Route path="/notifications"  element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

              <Route path="/"  element={<Navigate to="/feed" replace />} />
              <Route path="*"  element={<Navigate to="/feed" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;