import { useState, useEffect } from "react";
import "../App.css";
import { Plus, Download, Eye, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from "react-router-dom";
import cronstrue from 'cronstrue';

const safeCronToString = (schedule, options = {}) => {
  try {
    return cronstrue.toString(schedule, options);
  } catch (e) {
    return "Enter a valid cron pattern.";
  }
};

function StudentDashboard() {
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
  const [schedules, setSchedules] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  
  const API_URL = "http://127.0.0.1:5001/api";

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
    
    fetch(`${API_URL}/cron/schedules`)
      .then(res => res.json())
      .then(data => setSchedules(data))
      .catch(err => console.error("Failed to fetch schedules:", err));
  }, []);

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
    const { name, value, type, checked } = e.target;
    setStudentToEdit(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
     if (formErrors[name]) {
      setFormErrors(prevErrors => ({ ...prevErrors, [name]: null }));
    }
  };

  const handleUpdateStudent = (e) => {
    e.preventDefault();
    if (!studentToEdit) return;

    if (!studentToEdit.name || !studentToEdit.email || !studentToEdit.codeforces_handle) {
      setFormErrors({ submit: "All fields except phone number are required." });
      return;
    }
    setFormErrors({});

    const updatePayload = {
      name: studentToEdit.name,
      email: studentToEdit.email,
      phone_number: studentToEdit.phone_number,
      codeforces_handle: studentToEdit.codeforces_handle,
      disable_email_reminders: studentToEdit.disable_email_reminders,
    };

    fetch(`${API_URL}/students/${studentToEdit._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload)
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(err => { throw new Error(err.error || 'Update failed') });
      }
      return res.json();
    })
    .then(updatedStudent => {
      setStudents(students.map(s => s._id === updatedStudent._id ? updatedStudent : s));
      setStudentToEdit(null); 
      toast.success('Student updated successfully!');
    })
    .catch(err => {
      console.error("Failed to update student:", err);
      toast.error(err.message || 'Update failed');
    });
  };

  const handleSync = (studentId) => {
    toast.loading('Syncing with Codeforces...', { id: 'sync-toast' });

    fetch(`${API_URL}/students/${studentId}/sync`, {
      method: 'POST',
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(err => { throw new Error(err.error || 'Sync failed') });
      }
      return res.json();
    })
    .then(updatedStudent => {
      setStudents(students.map(s => s._id === updatedStudent._id ? updatedStudent : s));
      toast.success('Sync successful!', { id: 'sync-toast' });
    })
    .catch(err => {
      console.error("Failed to sync student:", err);
      toast.error(err.message || 'Sync failed.', { id: 'sync-toast' });
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

  const handleSaveSchedule = (scheduleData) => {
    const isNew = !scheduleData._id;
    const url = isNew ? `${API_URL}/cron/schedules` : `${API_URL}/cron/schedules/${scheduleData._id}`;
    const method = isNew ? 'POST' : 'PUT';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scheduleData)
    })
    .then(res => res.json())
    .then(savedSchedule => {
      if (isNew) {
        setSchedules([...schedules, savedSchedule]);
        toast.success('Schedule added successfully!');
      } else {
        setSchedules(schedules.map(s => s._id === savedSchedule._id ? savedSchedule : s));
        toast.success('Schedule updated successfully!');
      }
      setShowScheduleModal(false);
    })
    .catch(err => toast.error('Failed to save schedule.'));
  };

  const handleDeleteSchedule = (scheduleId) => {
    fetch(`${API_URL}/cron/schedules/${scheduleId}`, { method: 'DELETE' })
      .then(() => {
        setSchedules(schedules.filter(s => s._id !== scheduleId));
        toast.success('Schedule deleted successfully!');
      })
      .catch(err => toast.error('Failed to delete schedule.'));
  };

  return (
    <>
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

        <ScheduleManager 
          schedules={schedules}
          onSave={handleSaveSchedule}
          onDelete={handleDeleteSchedule}
          showModal={showScheduleModal}
          setShowModal={setShowScheduleModal}
        />

        <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr>
                <th scope="col" className="py-3.5 px-6 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Name</th>
                <th scope="col" className="hidden px-6 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200 sm:table-cell">Email</th>
                <th scope="col" className="hidden px-6 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200 lg:table-cell">Phone</th>
                <th scope="col" className="px-6 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">CF Handle</th>
                <th scope="col" className="px-6 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-200">Rating</th>
                <th scope="col" className="hidden px-6 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-200 md:table-cell">Max Rating</th>
                <th scope="col" className="hidden px-6 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-200 md:table-cell">Last Updated</th>
                <th scope="col" className="px-6 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-200">Reminders</th>
                <th scope="col" className="px-6 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {loading ? (
                <tr>
                  <td colSpan="8" className="whitespace-nowrap p-12 text-center text-sm text-gray-500 dark:text-gray-400">Loading students...</td>
                </tr>
              ) : students.length > 0 ? (
                students.map(student => (
                  <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                    <td className="whitespace-nowrap py-4 px-6 text-sm font-medium text-gray-900 dark:text-gray-100">{student.name}</td>
                    <td className="hidden whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400 sm:table-cell">{student.email}</td>
                    <td className="hidden whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400 lg:table-cell">{student.phone_number}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{student.codeforces_handle}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800 dark:text-gray-300 text-center">{student.current_rating}</td>
                    <td className="hidden whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400 text-center md:table-cell">{student.max_rating}</td>
                    <td className="hidden whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400 text-center md:table-cell">{student.last_updated ? new Date(student.last_updated).toLocaleString() : 'N/A'}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">{student.reminder_sent_count || 0}</td>
                    <td className="whitespace-nowrap py-4 px-6 text-center text-sm">
                      <div className="flex items-center justify-center gap-4">
                        <button 
                          onClick={() => handleSync(student._id)}
                          className="text-gray-500 hover:text-green-600 dark:hover:text-green-500 transition-colors"
                          title="Sync Codeforces Data"
                        >
                          <RefreshCw className="h-5 w-5" />
                        </button>
                         <Link to={`/students/${student._id}`} className="text-gray-500 hover:text-brand-blue dark:hover:text-brand-accent transition-colors">
                          <Eye className="h-5 w-5" />
                        </Link>
                        <button 
                          onClick={() => openEditModal(student)}
                          className="text-gray-500 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg>
                        </button>
                        <button 
                          onClick={() => handleDelete(student)}
                          className="text-gray-500 hover:text-red-600 dark:hover:text-red-500 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                 <tr>
                  <td colSpan="8" className="whitespace-nowrap p-12 text-center text-sm text-gray-500 dark:text-gray-400">No students found. Add one to get started!</td>
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
              <div className="mb-6">
                <label htmlFor="disable_email_reminders" className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Disable Inactivity Reminders</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="disable_email_reminders"
                      name="disable_email_reminders"
                      className="sr-only peer"
                      checked={studentToEdit.disable_email_reminders || false}
                      onChange={handleEditInputChange}
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                  </div>
                </label>
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
    </>
  );
}

const ScheduleManager = ({ schedules, onSave, onDelete }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);

  const openEditModal = (schedule = null) => {
    setEditingSchedule(schedule ? { ...schedule } : { name: '', schedule: '0 2 * * *', timezone: 'Asia/Kolkata', isEnabled: true });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingSchedule(null);
  };

  const handleSave = () => {
    if (!editingSchedule.name || !editingSchedule.schedule) {
      toast.error('Schedule name and pattern are required.');
      return;
    }
  
    if (editingSchedule.schedule.split(' ').length !== 5) {
      toast.error('Invalid cron pattern. It must have 5 parts.');
      return;
    }
    onSave(editingSchedule);
    closeEditModal();
  };

  const handleDeleteClick = (schedule) => {
    setScheduleToDelete(schedule);
  };

  const confirmDelete = () => {
    if (scheduleToDelete) {
      onDelete(scheduleToDelete._id);
      setScheduleToDelete(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingSchedule(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  return (
    <div className="mb-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <div>
            <h2 className="text-3xl font-bold">Sync Schedules</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage when and how often student data is synced.</p>
        </div>
        <button 
          onClick={() => openEditModal()} 
          className="flex items-center gap-2 bg-purple-600 text-white font-normal py-2 px-4 rounded-lg transition-all duration-300 font-outfit border-b-2 border-purple-800 hover:border-purple-700 hover:bg-purple-500 active:border-b-0 mt-4 sm:mt-0"
        >
          <Plus size={18} /> Add Schedule
        </button>
      </header>
      
      <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <thead className="bg-gray-50 dark:bg-slate-800">
            <tr>
              <th scope="col" className="py-3.5 px-6 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Name</th>
              <th scope="col" className="px-6 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Frequency</th>
              <th scope="col" className="hidden px-6 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200 md:table-cell">Schedule</th>
              <th scope="col" className="px-6 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-200">Status</th>
              <th scope="col" className="px-6 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
            {schedules.map(schedule => (
              <tr key={schedule._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                <td className="whitespace-nowrap py-4 px-6 text-sm font-medium text-gray-900 dark:text-gray-100">{schedule.name}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {safeCronToString(schedule.schedule, { use24HourTimeFormat: true })}
                </td>
                <td className="hidden whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400 md:table-cell font-mono">{schedule.schedule}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-center">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${schedule.isEnabled ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                    {schedule.isEnabled ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="whitespace-nowrap py-4 px-6 text-center text-sm">
                  <div className="flex items-center justify-center gap-4">
                    <button onClick={() => openEditModal(schedule)} className="text-gray-500 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors" title="Edit Schedule">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg>
                    </button>
                    <button onClick={() => handleDeleteClick(schedule)} className="text-gray-500 hover:text-red-600 dark:hover:text-red-500 transition-colors" title="Delete Schedule">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
             {schedules.length === 0 && (
                <tr>
                  <td colSpan="5" className="whitespace-nowrap p-12 text-center text-sm text-gray-500 dark:text-gray-400">
                    No schedules found. Add one to get started!
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-brand-dark dark:text-white">{editingSchedule?._id ? 'Edit' : 'Add New'} Schedule</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} noValidate>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Schedule Name</label>
                <input type="text" name="name" id="name" value={editingSchedule.name} onChange={handleInputChange} className="shadow-sm appearance-none border dark:border-slate-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-brand-blue" required />
              </div>

              <div className="mb-4">
                <label htmlFor="schedule" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Cron Pattern</label>
                <input type="text" name="schedule" id="schedule" value={editingSchedule.schedule} onChange={handleInputChange} className="font-mono shadow-sm appearance-none border dark:border-slate-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-brand-blue" required />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {safeCronToString(editingSchedule.schedule, { use24HourTimeFormat: true, verbose: true })}
                </p>
              </div>
              
              <div className="mb-6">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Schedule Enabled</span>
                  <div className="relative">
                    <input type="checkbox" name="isEnabled" id="isEnabled" className="sr-only peer" checked={editingSchedule.isEnabled} onChange={handleInputChange} />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-4">
                <button type="button" onClick={closeEditModal} className="font-outfit bg-gray-500 hover:bg-gray-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white font-normal py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all border-b-2 border-gray-700 hover:border-gray-600 active:border-b-0">
                  Cancel
                </button>
                <button type="submit" className="font-outfit bg-brand-blue hover:bg-blue-700 text-white font-normal py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all border-b-2 border-indigo-900 hover:border-blue-700 active:border-b-0">
                  {editingSchedule?._id ? 'Save Changes' : 'Add Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {scheduleToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-brand-dark dark:text-white">Confirm Deletion</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">Are you sure you want to delete the schedule <span className="font-semibold">{scheduleToDelete.name}</span>? This action cannot be undone.</p>
            <div className="flex items-center justify-end gap-4">
              <button onClick={() => setScheduleToDelete(null)} className="font-outfit bg-gray-500 hover:bg-gray-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white font-normal py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all border-b-2 border-gray-700 hover:border-gray-600 active:border-b-0">
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
};

export default StudentDashboard; 