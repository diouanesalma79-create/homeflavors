import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './component/Header';
import Footer from './component/Footer';
import Accueil from './Page/Accueil';
import RecipeExploration from './component/RecipeExploration';
import RecipeDetail from './component/RecipeDetail';
import ChatboxA from './component/ChatboxA';
import Chefs from './component/Chefs';
import ChefRecipes from './component/ChefRecipes';
import BecomeAChef from './component/BecomeAChef';
import UserTypeSelection from './component/UserTypeSelection';
import VisitorLogin from './component/VisitorLogin';
// import ChefLogin from './component/ChefLogin';
import VisitorLoginForm from './component/VisitorLoginForm';
import ChefLoginForm from './component/ChefLoginForm';
import Dashboard from './component/Dashboard';
import AddRecipeForm from './component/AddRecipeForm';
import ProtectedRoute from './component/ProtectedRoute';
import ErrorPage from './component/ErrorPage';

import About from './component/About';
import AdminDashboard from './component/AdminDashboard';
import AdminLogin from './component/AdminLogin';
import ProfileSettings from './component/ProfileSettings';
import Messages from './component/Messages';
import ChefProfile from './component/ChefProfile';
import MyRecipes from './component/MyRecipes';
import ChefOrders from './component/ChefOrders';
import ChefSettings from './component/ChefSettings';
import './App.css';

function App() {
  return (
    <div className="App">
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/recipes" element={<RecipeExploration />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
          <Route path="/chefs" element={<Chefs />} />
          <Route path="/about" element={<About />} />
          <Route path="/chef/:chefId" element={<ChefRecipes />} />
          <Route path="/become-chef" element={<BecomeAChef />} />
          <Route path="/login" element={<UserTypeSelection />} />
          <Route path="/login/visitor_Form" element={<VisitorLoginForm />} />
          <Route path="/login/visitor" element={<VisitorLogin />} />
          <Route path="/login/chef" element={<ChefLoginForm />} />
          <Route path="/chatbox" element={<ChatboxA />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Dashboard Routes */}
          <Route 
            path="/dashboard/:userType" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Add Recipe Route */}
          <Route 
            path="/dashboard/chef/recettes/nouvelle" 
            element={
              <ProtectedRoute allowedRoles={['chef', 'cook']}>
                <AddRecipeForm />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Dashboard Route */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Profile Settings Route */}
          <Route 
            path="/profile-settings" 
            element={
              <ProtectedRoute>
                <ProfileSettings />
              </ProtectedRoute>
            } 
          />
          
          {/* Messages Route */}
          <Route 
            path="/messages" 
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            } 
          />
          
          {/* Visitor Messages Route */}
          <Route 
            path="/dashboard/visitor/messages" 
            element={
              <ProtectedRoute allowedRoles={['visitor']}>
                <Messages />
              </ProtectedRoute>
            } 
          />
          
          {/* Chef Profile Route */}
          <Route 
            path="/chef/profile" 
            element={
              <ProtectedRoute allowedRoles={['chef', 'cook']}>
                <ChefProfile />
              </ProtectedRoute>
            } 
          />
          
          {/* Chef Recipes Route */}
          <Route 
            path="/chef/recipes" 
            element={
              <ProtectedRoute allowedRoles={['chef', 'cook']}>
                <MyRecipes />
              </ProtectedRoute>
            } 
          />
          
          {/* Chef Orders Route */}
          <Route 
            path="/chef/orders" 
            element={
              <ProtectedRoute allowedRoles={['chef', 'cook']}>
                <ChefOrders />
              </ProtectedRoute>
            } 
          />
          
          {/* Chef Messages Route */}
          <Route 
            path="/chef/messages" 
            element={
              <ProtectedRoute allowedRoles={['chef', 'cook']}>
                <Messages />
              </ProtectedRoute>
            } 
          />
          
          {/* Chef Settings Route */}
          <Route 
            path="/chef/settings" 
            element={
              <ProtectedRoute allowedRoles={['chef', 'cook']}>
                <ChefSettings />
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<ErrorPage />} />
        </Routes>

        <Footer />
      </Router>
    </div>
  );
}

export default App;