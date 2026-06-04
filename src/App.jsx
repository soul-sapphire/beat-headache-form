import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SiteLayout from "./components/SiteLayout";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ServicesPage from "./pages/ServicesPage";
import ResourcesPage from "./pages/ResourcesPage";
import FAQPage from "./pages/FAQPage";
import ContactPage from "./pages/ContactPage";
import FeedbackPage from "./pages/FeedbackPage";
import NewPatientPublicPage from "./pages/NewPatientPublicPage";
import NotFoundPage from "./pages/NotFoundPage";

// Auth & Protected Routes
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DoctorRegisterPrivatePage from "./pages/DoctorRegisterPrivatePage";
import DoctorLoginPrivatePage from "./pages/DoctorLoginPrivatePage";
import DoctorDashboardPage from "./pages/DoctorDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminResearchExportPage from "./pages/AdminResearchExportPage";
import AdminContactMessagesPage from "./pages/AdminContactMessagesPage";
import AdminFeedbackPage from "./pages/AdminFeedbackPage";
import DoctorNewPatientPage from "./pages/DoctorNewPatientPage";
import DoctorEncounterFormPage from "./pages/DoctorEncounterFormPage";
import DoctorPatientsPage from "./pages/DoctorPatientsPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <SiteLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/new-patient" element={<NewPatientPublicPage />} />
            
            {/* Hidden Auth Routes */}
            <Route path="/doctor-register-private" element={<DoctorRegisterPrivatePage />} />
            <Route path="/doctor-login-private" element={<DoctorLoginPrivatePage />} />

            {/* Protected Routes */}
            <Route 
              path="/doctor/dashboard" 
              element={
                <ProtectedRoute allowedRoles={["doctor", "admin"]}>
                  <DoctorDashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/admin/research-export"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminResearchExportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/contact-messages"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminContactMessagesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/feedback"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminFeedbackPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/doctor/new-patient"
              element={
                <ProtectedRoute allowedRoles={["doctor", "admin"]}>
                  <DoctorNewPatientPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/encounter/new/:patientCode"
              element={
                <ProtectedRoute allowedRoles={["doctor", "admin"]}>
                  <DoctorEncounterFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/patients"
              element={
                <ProtectedRoute allowedRoles={["doctor", "admin"]}>
                  <DoctorPatientsPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </SiteLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;