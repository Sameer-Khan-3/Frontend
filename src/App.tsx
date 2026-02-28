import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<Navigate to="/signup" />} />

        {/* Signup page */}
        <Route path="/signup" element={<Signup />} />

        {/* Signin page */}
        <Route path="/signin" element={<Signin />} />

        {/* Fallback for unmatched routes */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;