import { useState, useEffect } from "react";
import { Routes, Route, Link } from 'react-router-dom';
import "./App.css";
import { Sun, Moon } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

import StudentDashboard from "./pages/StudentDashboard";
import StudentProfile from "./pages/StudentProfile";
import Footer from "./components/Footer";

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    const isDark = theme === 'dark';
    root.classList.toggle('dark', isDark);
    body.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-brand-dark text-gray-800 dark:text-gray-100 transition-colors duration-300 font-sans">
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'font-sans',
          style: {
            border: '1px solid #2563eb',
            padding: '16px',
            color: '#0f172a',
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            }
          }
        }}
      />
      
      <nav className="bg-white dark:bg-brand-dark font-outfit">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <img src="/logo.png" alt="TLE Eliminators Logo" className="h-6 w-6" />
                <span className="ml-2 text-2xl font-regular">
                  <span className="text-brand-dark dark:text-white">TLE Eliminators</span>
                </span>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-14">
              <a href="#" className="text-black dark:text-gray-300 hover:text-brand-blue dark:hover:text-brand-accent">Home</a>
              <a href="#" className="text-black dark:text-gray-300 hover:text-brand-blue dark:hover:text-brand-accent">Courses</a>
              <a href="#" className="text-black dark:text-gray-300 hover:text-brand-blue dark:hover:text-brand-accent">CP-31 Sheet</a>
              <a href="#" className="text-black dark:text-gray-300 hover:text-brand-blue dark:hover:text-brand-accent">FAQs</a>
              <a href="#" className="text-black dark:text-gray-300 hover:text-brand-blue dark:hover:text-brand-accent">Our Mentors</a>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={toggleTheme} className="p-2 rounded-full text-indigo-800 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 focus:outline-none font-outfit">
                {theme === 'light' ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
              </button>
              <button className="bg-brand-blue text-white font-normal py-2 px-4 rounded-lg font-outfit transition-all duration-200 border-b-2 border-indigo-900 hover:border-blue-700 hover:bg-blue-600 active:border-b-0">
                Login / Register
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<StudentDashboard />} />
          <Route path="/students/:id" element={<StudentProfile />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;