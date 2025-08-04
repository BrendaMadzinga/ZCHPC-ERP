import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import Dashboard from "./pages/Dashboard";
import SalesPage from "./pages/SalesPage";
import AccountingPage from "./pages/AccountingPage";
import ProcurementPage from "./pages/ProcurementPage";
import HRPage from "./pages/HRPage"; // Assuming HRPage exists and might handle tabs or other HR-specific content
import InventoryPage from "./pages/InventoryPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/MainLayout";
import PayrollPage from "./pages/PayrollPage";

const queryClient = new QueryClient();

// JobPostingForm Component
const JobPostingForm = () => {
  // State to hold form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    salaryRange: '',
    department: '',
    applicationDeadline: '',
  });

  // State for loading and error messages
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      // Simulate API call to your backend
      // Replace '/api/jobs' with your actual backend endpoint for creating jobs
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add any authentication headers if required, e.g., 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to post job');
      }

      const result = await response.json();
      setMessage('Job posted successfully!');
      setIsError(false);
      // Optionally clear the form after successful submission
      setFormData({
        title: '',
        description: '',
        requirements: '',
        location: '',
        salaryRange: '',
        department: '',
        applicationDeadline: '',
      });
      console.log('Job posted:', result);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setIsError(true);
      console.error('Error posting job:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Post a New Job Vacancy</h2>
      {message && (
        <div
          className={`p-4 mb-4 rounded-lg ${
            isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          } font-medium`}
        >
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Job Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Job Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g., Software Engineer, Marketing Manager"
          />
        </div>

        {/* Job Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Job Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={5}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Provide a detailed description of the job responsibilities."
          ></textarea>
        </div>

        {/* Requirements */}
        <div>
          <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-1">
            Requirements
          </label>
          <textarea
            id="requirements"
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            required
            rows={3}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="List required skills, qualifications, and experience."
          ></textarea>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g., Remote, New York, NY, Harare, Zimbabwe"
          />
        </div>

        {/* Salary Range */}
        <div>
          <label htmlFor="salaryRange" className="block text-sm font-medium text-gray-700 mb-1">
            Salary Range (Optional)
          </label>
          <input
            type="text"
            id="salaryRange"
            name="salaryRange"
            value={formData.salaryRange}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g., $60,000 - $80,000 per year"
          />
        </div>

        {/* Department */}
        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
            Department
          </label>
          <input
            type="text"
            id="department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g., Engineering, Human Resources, Sales"
          />
        </div>

        {/* Application Deadline */}
        <div>
          <label htmlFor="applicationDeadline" className="block text-sm font-medium text-gray-700 mb-1">
            Application Deadline
          </label>
          <input
            type="date"
            id="applicationDeadline"
            name="applicationDeadline"
            value={formData.applicationDeadline}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Posting Job...' : 'Post Job'}
        </button>
      </form>
    </div>
  );
};

// PublicVacancies Component
const PublicVacancies = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // Simulate API call to your backend to fetch job listings
        // Replace '/api/jobs' with your actual backend endpoint
        const response = await fetch('/api/jobs');
        if (!response.ok) {
          throw new Error('Failed to fetch jobs');
        }
        const data = await response.json();
        setJobs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []); // Empty dependency array means this runs once on mount

  if (loading) {
    return (
      <div className="text-center p-8 bg-white rounded-xl shadow-lg">
        <p className="text-lg text-gray-600">Loading job vacancies...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-100 text-red-700 rounded-xl shadow-lg">
        <p className="text-lg font-medium">Error: {error}</p>
        <p className="text-sm">Please try refreshing the page.</p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">No Vacancies Available</h2>
        <p className="text-lg text-gray-600">Please check back later for new job postings.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Available Job Vacancies</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <div key={job.id} className="border border-gray-200 rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <h3 className="text-xl font-semibold text-blue-700 mb-2">{job.title}</h3>
            <p className="text-gray-600 text-sm mb-1">
              <span className="font-medium">Location:</span> {job.location}
            </p>
            <p className="text-gray-600 text-sm mb-1">
              <span className="font-medium">Department:</span> {job.department || 'N/A'}
            </p>
            {job.salaryRange && (
              <p className="text-gray-600 text-sm mb-3">
                <span className="font-medium">Salary:</span> {job.salaryRange}
              </p>
            )}
            <p className="text-gray-700 text-base mb-4 flex-grow">{job.description.substring(0, 150)}...</p>
            <div className="mt-auto flex justify-between items-center">
              <span className="text-xs text-gray-500">
                Deadline: {job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString() : 'N/A'}
              </span>
              <button
                onClick={() => alert(`Applying for: ${job.title}\n(This would navigate to an application form)`)}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 text-sm"
              >
                Apply Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ApplicantDashboard Component
const ApplicantDashboard = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null); // For modal/details view

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        // Simulate API call to your backend to fetch applicant data
        // Replace '/api/applicants' with your actual backend endpoint
        const response = await fetch('/api/applicants');
        if (!response.ok) {
          throw new Error('Failed to fetch applicants');
        }
        const data = await response.json();
        setApplicants(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, []);

  // Function to handle changing applicant status (e.g., Accepted, Rejected, Interview)
  const handleChangeStatus = async (applicantId, newStatus) => {
    // In a real application, you would send this update to your backend
    // Example:
    // try {
    //   const response = await fetch(`/api/applicants/${applicantId}/status`, {
    //     method: 'PUT',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ status: newStatus }),
    //   });
    //   if (!response.ok) throw new Error('Failed to update status');
    //   // Update local state if successful
    //   setApplicants(applicants.map(app =>
    //     app.id === applicantId ? { ...app, status: newStatus } : app
    //   ));
    //   alert(`Status for ${applicantId} updated to ${newStatus}`);
    // } catch (err) {
    //   alert(`Error updating status: ${err.message}`);
    // }

    // For demonstration, directly update state
    setApplicants(applicants.map(app =>
      app.id === applicantId ? { ...app, status: newStatus } : app
    ));
    alert(`Status for applicant ${applicantId} changed to: ${newStatus}`);
  };

  // Function to open applicant details modal
  const viewApplicantDetails = (applicant) => {
    setSelectedApplicant(applicant);
  };

  // Function to close applicant details modal
  const closeApplicantDetails = () => {
    setSelectedApplicant(null);
  };

  if (loading) {
    return (
      <div className="text-center p-8 bg-white rounded-xl shadow-lg">
        <p className="text-lg text-gray-600">Loading applicant data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-100 text-red-700 rounded-xl shadow-lg">
        <p className="text-lg font-medium">Error: {error}</p>
        <p className="text-sm">Please try refreshing the page.</p>
      </div>
    );
  }

  if (applicants.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">No Applicants Yet</h2>
        <p className="text-lg text-gray-600">There are no applications to display at the moment.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Applicant Management Dashboard</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Applicant Name
              </th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Applied For
              </th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {applicants.map((applicant) => (
              <tr key={applicant.id} className="hover:bg-gray-50">
                <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-gray-900">
                  {applicant.name}
                </td>
                <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">
                  {applicant.appliedJobTitle}
                </td>
                <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">
                  {applicant.email}
                </td>
                <td className="py-4 px-6 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    applicant.status === 'New' ? 'bg-blue-100 text-blue-800' :
                    applicant.status === 'Reviewed' ? 'bg-yellow-100 text-yellow-800' :
                    applicant.status === 'Interview' ? 'bg-purple-100 text-purple-800' :
                    applicant.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {applicant.status}
                  </span>
                </td>
                <td className="py-4 px-6 whitespace-nowrap text-sm font-medium">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => viewApplicantDetails(applicant)}
                      className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
                      title="View Details"
                    >
                      View
                    </button>
                    <select
                      value={applicant.status}
                      onChange={(e) => handleChangeStatus(applicant.id, e.target.value)}
                      className="block w-auto py-1 px-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      title="Change Status"
                    >
                      <option value="New">New</option>
                      <option value="Reviewed">Reviewed</option>
                      <option value="Interview">Interview</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Applicant Details Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full transform transition-all scale-100 opacity-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Applicant Details</h3>
            <div className="space-y-3 text-gray-700">
              <p><strong>Name:</strong> {selectedApplicant.name}</p>
              <p><strong>Email:</strong> {selectedApplicant.email}</p>
              <p><strong>Phone:</strong> {selectedApplicant.phone}</p>
              <p><strong>Applied For:</strong> {selectedApplicant.appliedJobTitle}</p>
              <p><strong>Status:</strong> <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    selectedApplicant.status === 'New' ? 'bg-blue-100 text-blue-800' :
                    selectedApplicant.status === 'Reviewed' ? 'bg-yellow-100 text-yellow-800' :
                    selectedApplicant.status === 'Interview' ? 'bg-purple-100 text-purple-800' :
                    selectedApplicant.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedApplicant.status}
                  </span>
              </p>
              <p><strong>Resume Link:</strong> <a href={selectedApplicant.resumeLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Resume</a></p>
              <p><strong>Cover Letter:</strong> {selectedApplicant.coverLetter || 'N/A'}</p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeApplicantDetails}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


const App = () => {
  const [openTab, setOpenTab] = useState("");

  // Set openTab based on the initial URL hash when the component mounts
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      setOpenTab(hash); // Set the initial hash
    }

    // Define the hashchange handler to update openTab whenever the hash changes
    const handleHashChange = () => {
      const newHash = window.location.hash;
      setOpenTab(newHash); // Update openTab whenever the hash changes
    };

    // Listen for changes in the hash
    window.addEventListener("hashchange", handleHashChange);

    // Cleanup the event listener on unmount
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []); // The empty dependency array ensures this effect runs once on mount

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public route - redirect to login */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />

              {/* Public route for displaying job vacancies */}
              <Route path="/vacancies" element={<PublicVacancies />} />

              {/* Protected routes inside MainLayout */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <MainLayout setOpenTab={setOpenTab}>
                      <Dashboard />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/sales"
                element={
                  <ProtectedRoute requiredPermission="sales">
                    <MainLayout setOpenTab={setOpenTab}>
                      <SalesPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/accounting"
                element={
                  <ProtectedRoute requiredPermission="accounting">
                    <MainLayout setOpenTab={setOpenTab}>
                      <AccountingPage openTab={openTab} />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payroll"
                element={
                  <ProtectedRoute requiredPermission="accounting">
                    <MainLayout setOpenTab={setOpenTab}>
                      <PayrollPage openTab={openTab} />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/procurement"
                element={
                  <ProtectedRoute requiredPermission="procurement">
                    <MainLayout setOpenTab={setOpenTab}>
                      <ProcurementPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              {/* HR Routes including Job Portal features */}
              <Route
                path="/hr"
                element={
                  <ProtectedRoute requiredPermission="hr">
                    <MainLayout setOpenTab={setOpenTab}>
                      <HRPage openTab={openTab} />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hr/post-job"
                element={
                  <ProtectedRoute requiredPermission="hr">
                    <MainLayout setOpenTab={setOpenTab}>
                      <JobPostingForm />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hr/applicants"
                element={
                  <ProtectedRoute requiredPermission="hr">
                    <MainLayout setOpenTab={setOpenTab}>
                      <ApplicantDashboard />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/inventory"
                element={
                  <ProtectedRoute requiredPermission="inventory">
                    <MainLayout setOpenTab={setOpenTab}>
                      <InventoryPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/settings"
                element={
                  <ProtectedRoute requiredPermission="admin">
                    <MainLayout setOpenTab={setOpenTab}>
                      <SettingsPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;

