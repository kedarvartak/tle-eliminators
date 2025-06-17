import React from 'react';


const Footer = () => {
  const linkClasses = "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-200";
  const headingClasses = "text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase";

  return (
    <footer className="bg-gray-50 dark:bg-[#0A192F]">
      <div className="container mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          
          <div>
            <h3 className={headingClasses}>Courses</h3>
            <ul className="mt-4 space-y-4">
              <li><a href="#" className={linkClasses}>Level 1</a></li>
              <li><a href="#" className={linkClasses}>Level 2</a></li>
              <li><a href="#" className={linkClasses}>Level 3</a></li>
              <li><a href="#" className={linkClasses}>Level 4</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className={headingClasses}>Information</h3>
            <ul className="mt-4 space-y-4">
              <li><a href="#" className={linkClasses}>FAQ</a></li>
              <li><a href="#" className={linkClasses}>Terms & Conditions</a></li>
              <li><a href="#" className={linkClasses}>Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <h3 className={headingClasses}>Company</h3>
            <ul className="mt-4 space-y-4">
              <li><a href="#" className={linkClasses}>Our Mentors</a></li>
              <li><a href="#" className={linkClasses}>Contact Us</a></li>
              <li><a href="#" className={linkClasses}>Report Bug</a></li>
            </ul>
          </div>

          <div>
            <h3 className={headingClasses}>Socials</h3>
            <ul className="mt-4 space-y-4">
              <li><a href="#" className={linkClasses}>Discord</a></li>
              <li><a href="#" className={linkClasses}>LinkedIn</a></li>
              <li><a href="#" className={linkClasses}>Instagram</a></li>
              <li><a href="#" className={linkClasses}>Twitter</a></li>
              <li><a href="#" className={linkClasses}>Youtube</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 dark:border-slate-800 pt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center">
                <img src="/logo.png" alt="TLE Eliminators Logo" className="h-5 w-5 mr-2" />
                <span>TLE Eliminators | &copy; {new Date().getFullYear()} All rights reserved.</span>
            </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 