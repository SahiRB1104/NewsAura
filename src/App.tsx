import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import SummaryPage from './pages/SummaryPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 pt-16">
        <Navbar />
        <main className="container mx-auto py-6">
          <Routes>
            <Route path="/" element={<Navigate to="/category/top" replace />} />
            <Route path="/category/:category" element={<HomePage />} />
            <Route path="/summary/:id" element={<SummaryPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;