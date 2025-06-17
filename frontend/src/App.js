import { useState, useEffect } from "react";
import "./App.css";
import { Sun, Moon, Plus, Download } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    phone_number: "",
    codeforces_handle: ""
  });
  const [formErrors, setFormErrors] = useState({});
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [studentToEdit, setStudentToEdit] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  const API_URL = "http://127.0.0.1:5001/api" || "http://localhost:5001/api";

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark';
    root.classList.toggle('dark', isDark);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    // Initial theme setup based on localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (prefersDark) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/students`)
      .then(res => res.json())
      .then(data => {
        setStudents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch students:", err);
        setLoading(false);
      });
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStudent(prevState => ({ ...prevState, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prevErrors => ({ ...prevErrors, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!newStudent.name) errors.name = "Name is required.";
    if (!newStudent.email) {
      errors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(newStudent.email)) {
      errors.email = "Email address is invalid.";
    }
    if (newStudent.phone_number && !/^\d{10}$/.test(newStudent.phone_number)) {
      errors.phone_number = "Phone number must be 10 digits.";
    }
    if (!newStudent.codeforces_handle) errors.codeforces_handle = "Codeforces handle is required.";
    return errors;
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    fetch(`${API_URL}/students`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newStudent),
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(errData => {
          throw new Error(errData.error || 'Something went wrong');
        });
      }
      return res.json();
    })
    .then(data => {
      setStudents(prevState => [...prevState, data]);
      setShowAddModal(false);
      setNewStudent({ name: "", email: "", phone_number: "", codeforces_handle: "" }); 
      toast.success('Student added successfully!');
    })
    .catch(err => {
      console.error("Failed to add student:", err);
      toast.error(err.message || "Failed to add student.");
    });
  };

  const handleDelete = (student) => {
    setStudentToDelete(student);
  };

  const confirmDelete = () => {
    if (!studentToDelete) return;

    fetch(`${API_URL}/students/${studentToDelete._id}`, {
      method: "DELETE",
    })
    .then(res => {
      if (!res.ok) {
        throw new Error('Failed to delete student');
      }
      setStudents(students.filter(s => s._id !== studentToDelete._id));
      setStudentToDelete(null); 
      toast.success('Student deleted successfully!');
    })
    .catch(err => {
      console.error(err);
      toast.error(err.message || "Failed to delete student.");
      setStudentToDelete(null); 
    });
  };

  const openAddModal = () => {
    setFormErrors({});
    setShowAddModal(true);
  }

  const openEditModal = (student) => {
    setStudentToEdit({ ...student });
    setFormErrors({});
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setStudentToEdit(prevState => ({ ...prevState, [name]: value }));
     if (formErrors[name]) {
      setFormErrors(prevErrors => ({ ...prevErrors, [name]: null }));
    }
  };

  const handleUpdateStudent = (e) => {
    e.preventDefault();
    if (!studentToEdit) return;

    // Frontend validation (can be more sophisticated)
    if (!studentToEdit.name || !studentToEdit.email || !studentToEdit.codeforces_handle) {
      setFormErrors({ submit: "All fields except phone number are required." });
      return;
    }
    setFormErrors({});


    fetch(`${API_URL}/students/${studentToEdit._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentToEdit)
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(err => { throw new Error(err.error || 'Update failed') });
      }
      return res.json();
    })
    .then(updatedStudent => {
      setStudents(students.map(s => s._id === updatedStudent._id ? updatedStudent : s));
      setStudentToEdit(null); // Close modal
      toast.success('Student updated successfully!');
    })
    .catch(err => {
      console.error("Failed to update student:", err);
      toast.error(err.message || 'Update failed');
    });
  };

  const downloadCSV = () => {
    if (students.length === 0) {
      toast.error("No student data to download.");
      return;
    }

    const headers = [
      "ID", "Name", "Email", "Phone Number", "Codeforces Handle", 
      "Current Rating", "Max Rating", "Last Updated"
    ];
    
    const csvContent = [
      headers.join(","),
      ...students.map(s => [
        s._id,
        `"${s.name}"`,
        `"${s.email}"`,
        `"${s.phone_number || ''}"`,
        `"${s.codeforces_handle}"`,
        s.current_rating,
        s.max_rating,
        `"${s.last_updated ? new Date(s.last_updated).toLocaleString() : 'N/A'}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "students_progress.csv");
    document.body.appendChild(link);
    
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white dark:bg-brand-dark text-gray-800 dark:text-gray-100 min-h-screen transition-colors duration-300 font-sans">
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
      
      {/* New Navigation Header */}
      <nav className="bg-white dark:bg-brand-dark font-outfit">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <img src="/logo.png" alt="TLE Eliminators Logo" className="h-6 w-6" />
              <span className="ml-2 text-2xl font-regular">
                <span className="text-brand-dark dark:text-white">TLE Eliminators</span>
              </span>
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

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Student Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage student progress and Codeforces data.</p>
          </div>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <button 
              onClick={openAddModal}
              className="flex items-center gap-2 bg-brand-blue text-white font-normal py-2 px-4 rounded-lg transition-all duration-300 font-outfit border-b-2 border-indigo-900 hover:border-blue-700 hover:bg-blue-600 active:border-b-0"
            >
              <Plus size={18} /> Add Student
            </button>
            <button 
              onClick={downloadCSV}
              className="flex items-center gap-2 bg-green-600 text-white font-normal py-2 px-4 rounded-lg transition-all duration-300 font-outfit border-b-2 border-green-800 hover:border-green-700 hover:bg-green-500 active:border-b-0">
              <Download size={18} /> Download CSV
            </button>
          </div>
        </header>

        <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 uppercase text-sm leading-normal">
              <tr>
                <th className="py-3 px-6 text-left">Name</th>
                <th className="py-3 px-6 text-left hidden sm:table-cell">Email</th>
                <th className="py-3 px-6 text-left hidden lg:table-cell">Phone</th>
                <th className="py-3 px-6 text-left">CF Handle</th>
                <th className="py-3 px-6 text-center">Rating</th>
                <th className="py-3 px-6 text-center hidden md:table-cell">Max Rating</th>
                <th className="py-3 px-6 text-center hidden md:table-cell">Last Updated</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 dark:text-gray-200 text-sm font-light">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">Loading students...</td>
                </tr>
              ) : students.length > 0 ? (
                students.map(student => (
                  <tr key={student._id} className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600">
                    <td className="py-3 px-6 text-left whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="font-medium">{student.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-6 text-left hidden sm:table-cell">{student.email}</td>
                    <td className="py-3 px-6 text-left hidden lg:table-cell">{student.phone_number}</td>
                    <td className="py-3 px-6 text-left">{student.codeforces_handle}</td>
                    <td className="py-3 px-6 text-center font-semibold">{student.current_rating}</td>
                    <td className="py-3 px-6 text-center hidden md:table-cell">{student.max_rating}</td>
                    <td className="py-3 px-6 text-center hidden md:table-cell text-xs">{student.last_updated ? new Date(student.last_updated).toLocaleString() : 'N/A'}</td>
                    <td className="py-3 px-6 text-center">
                      <div className="flex item-center justify-center gap-2">
                         <button className="text-brand-blue hover:text-blue-700 dark:text-brand-accent dark:hover:text-sky-400 font-normal py-1 px-3 rounded text-xs font-outfit">
                          View Details
                        </button>
                        <button 
                          onClick={() => openEditModal(student)}
                          className="w-5 h-5 text-gray-500 hover:text-yellow-600 dark:text-gray-400 dark:hover:text-yellow-400 font-outfit">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDelete(student)}
                          className="w-5 h-5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 font-outfit">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                 <tr>
                  <td colSpan="8" className="text-center py-4">No students found. Add one to get started!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-brand-dark dark:text-white">Add New Student</h2>
            <form onSubmit={handleAddStudent} noValidate>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Name</label>
                <input type="text" name="name" id="name" value={newStudent.name} onChange={handleInputChange} className={`shadow-sm appearance-none border dark:border-slate-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-brand-blue ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`} required />
                {formErrors.name && <p className="text-red-500 text-xs italic mt-1">{formErrors.name}</p>}
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Email</label>
                <input type="email" name="email" id="email" value={newStudent.email} onChange={handleInputChange} className={`shadow-sm appearance-none border dark:border-slate-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-brand-blue ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`} required />
                {formErrors.email && <p className="text-red-500 text-xs italic mt-1">{formErrors.email}</p>}
              </div>
              <div className="mb-4">
                <label htmlFor="phone_number" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Phone Number <span className="text-gray-500 font-normal">(Optional)</span></label>
                <input type="tel" name="phone_number" id="phone_number" value={newStudent.phone_number} onChange={handleInputChange} className={`shadow-sm appearance-none border dark:border-slate-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-brand-blue ${formErrors.phone_number ? 'border-red-500' : 'border-gray-300'}`} />
                {formErrors.phone_number && <p className="text-red-500 text-xs italic mt-1">{formErrors.phone_number}</p>}
              </div>
              <div className="mb-6">
                <label htmlFor="codeforces_handle" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Codeforces Handle</label>
                <input type="text" name="codeforces_handle" id="codeforces_handle" value={newStudent.codeforces_handle} onChange={handleInputChange} className={`shadow-sm appearance-none border dark:border-slate-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-brand-blue ${formErrors.codeforces_handle ? 'border-red-500' : 'border-gray-300'}`} required />
                {formErrors.codeforces_handle && <p className="text-red-500 text-xs italic mt-1">{formErrors.codeforces_handle}</p>}
              </div>
              <div className="flex items-center justify-end gap-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="font-outfit bg-gray-500 hover:bg-gray-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white font-normal py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all border-b-2 border-gray-700 hover:border-gray-600 active:border-b-0">
                  Cancel
                </button>
                <button type="submit" className="font-outfit bg-brand-blue hover:bg-blue-700 text-white font-normal py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all border-b-2 border-indigo-900 hover:border-blue-700 active:border-b-0">
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {studentToEdit && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-brand-dark dark:text-white">Edit Student</h2>
            <form onSubmit={handleUpdateStudent} noValidate>
               <div className="mb-4">
                <label htmlFor="edit-name" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Name</label>
                <input type="text" name="name" id="edit-name" value={studentToEdit.name} onChange={handleEditInputChange} className="shadow-sm appearance-none border dark:border-slate-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-brand-blue" required />
              </div>
              <div className="mb-4">
                <label htmlFor="edit-email" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Email</label>
                <input type="email" name="email" id="edit-email" value={studentToEdit.email} onChange={handleEditInputChange} className="shadow-sm appearance-none border dark:border-slate-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-brand-blue" required />
              </div>
              <div className="mb-4">
                <label htmlFor="edit-phone_number" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Phone Number</label>
                <input type="tel" name="phone_number" id="edit-phone_number" value={studentToEdit.phone_number || ''} onChange={handleEditInputChange} className="shadow-sm appearance-none border dark:border-slate-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-brand-blue" />
              </div>
              <div className="mb-6">
                <label htmlFor="edit-codeforces_handle" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Codeforces Handle</label>
                <input type="text" name="codeforces_handle" id="edit-codeforces_handle" value={studentToEdit.codeforces_handle} onChange={handleEditInputChange} className="shadow-sm appearance-none border dark:border-slate-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-brand-blue" required />
              </div>
              <div className="flex items-center justify-end gap-4">
                 <button type="button" onClick={() => setStudentToEdit(null)} className="font-outfit bg-gray-500 hover:bg-gray-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white font-normal py-2 px-4 rounded-lg transition-all border-b-2 border-gray-700 hover:border-gray-600 active:border-b-0">
                  Cancel
                </button>
                <button type="submit" className="font-outfit bg-brand-blue hover:bg-blue-700 text-white font-normal py-2 px-4 rounded-lg transition-all border-b-2 border-indigo-800 hover:border-blue-700 active:border-b-0">
                  Update Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {studentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-brand-dark dark:text-white">Confirm Deletion</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">Are you sure you want to delete the student <span className="font-semibold">{studentToDelete.name}</span>? This action cannot be undone.</p>
            <div className="flex items-center justify-end gap-4">
              <button onClick={() => setStudentToDelete(null)} className="font-outfit bg-gray-500 hover:bg-gray-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white font-normal py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all border-b-2 border-gray-700 hover:border-gray-600 active:border-b-0">
                  Cancel
              </button>
              <button onClick={confirmDelete} className="font-outfit bg-red-600 hover:bg-red-700 text-white font-normal py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all border-b-2 border-red-800 hover:border-red-700 active:border-b-0">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
