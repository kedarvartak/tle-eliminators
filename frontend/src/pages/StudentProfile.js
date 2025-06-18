import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import RatingChart from '../components/RatingChart';
import ContestList from '../components/ContestList';
import SubmissionHeatmap from '../components/SubmissionHeatmap';
import ProblemStats from '../components/ProblemStats';
import RatingDistributionChart from '../components/RatingDistributionChart';
import { subDays, isAfter } from 'date-fns';

function StudentProfile() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all'); 
  const { id } = useParams();

  const API_URL = "http://127.0.0.1:5001/api";

  useEffect(() => {
    if (!id) return;

    fetch(`${API_URL}/students/${id}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch student data');
        }
        return res.json();
      })
      .then(data => {
        setStudent(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id, API_URL]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading student profile...</div>;
  }

  if (!student) {
    return <div className="p-8 text-center text-red-500">Student not found.</div>;
  }

  const filteredContests = student.contest_history.filter(contest => {
    if (timeFilter === 'all') {
      return true;
    }
    const days = parseInt(timeFilter, 10);
    const filterDate = subDays(new Date(), days);
    const contestDate = new Date(contest.ratingUpdateTimeSeconds * 1000);
    return isAfter(contestDate, filterDate);
  });

  const FilterButton = ({ period, label }) => (
    <button
        onClick={() => setTimeFilter(period)}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            timeFilter === period 
            ? 'bg-sky-600 text-white' 
            : 'bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600'
        }`}
    >
        {label}
    </button>
  );

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8 text-gray-900 dark:text-gray-100">
        <header className="mb-8">
            <Link to="/" className="text-sky-600 dark:text-brand-accent hover:underline mb-4 inline-block">&larr; Back to Dashboard</Link>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{student.name}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Codeforces Handle: <a href={`https://codeforces.com/profile/${student.codeforces_handle}`} target="_blank" rel="noopener noreferrer" className="text-sky-600 dark:text-brand-accent hover:underline">{student.codeforces_handle}</a></p>
             <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Last Synced: {student.last_updated ? new Date(student.last_updated).toLocaleString() : 'Never'}</p>
        </header>

        <div className="space-y-8">
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Contest History</h2>
                    <div className="flex items-center gap-2">
                        <FilterButton period="30" label="Last 30 Days" />
                        <FilterButton period="90" label="Last 90 Days" />
                        <FilterButton period="365" label="Last 365 Days" />
                        <FilterButton period="all" label="All Time" />
                    </div>
                </div>
                <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900">
                   <RatingChart data={filteredContests} />
                   <ContestList data={filteredContests} />
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-4 border-b pb-2 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white">Problem Solving Data</h2>
                <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900">
                    <h3 className="text-xl font-semibold mb-4 text-center text-gray-900 dark:text-white">Submission Heatmap (Last Year)</h3>
                    <SubmissionHeatmap submissions={student.submission_history} />
                    <ProblemStats submissions={student.submission_history} />
                    <RatingDistributionChart submissions={student.submission_history} />
                </div>
            </section>
        </div>
    </main>
  );
}

export default StudentProfile; 