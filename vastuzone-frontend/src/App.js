import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/homepage";
import Login from "./pages/Login";
import Signup from "./pages/signup";
import Dashboard from "./pages/Dashboard";
import AddProperty from "./pages/Addproperty";
import ViewReports from "./pages/ViewReports";
import ProtectedRoute from "./ProtectedRoute";
import ExpertDashboard from "./pages/ExpertDashboard";
import ExpertConsult from "./pages/ExpertConsult";
import ExpertChat from "./pages/ExpertChat";
import Consult from "./pages/Consult";
import BookAppointment from "./pages/BookAppointment";
import MyAppointments from "./pages/MyAppointments";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-property"
          element={
            <ProtectedRoute>
              <AddProperty />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <ViewReports />
            </ProtectedRoute>
          }
        />
        <Route path="/chat" element={<Consult />} />

        <Route path="/expert/dashboard" element={<ExpertDashboard />} />

        <Route
          path="/expert/consult/:propertyId"
          element={
            <ProtectedRoute>
              <ExpertConsult />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-appointments"
          element={
            <ProtectedRoute>
              <MyAppointments />
            </ProtectedRoute>
          }
        />


        <Route
          path="/expert/chat/:userId"
          element={<ExpertChat />}
        />

        <Route
          path="/book-appointment"
          element={
            <ProtectedRoute>
              <BookAppointment />
            </ProtectedRoute>
          }
        />


      </Routes>
    </BrowserRouter>
  );

}

export default App;
