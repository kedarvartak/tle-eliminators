import React from 'react';
import { formatDistance, differenceInDays } from 'date-fns';

const StatCard = ({ label, value, subtext }) => (
    <div className="bg-gray-100 dark:bg-slate-800/50 p-4 rounded-lg text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        {subtext && <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subtext}</p>}
    </div>
);

const ProblemStats = ({ submissions }) => {
    if (!submissions || submissions.length === 0) {
        return null; // don't render anything if there are no submissions
    }

    const solvedSubmissions = submissions.filter(s => s.verdict === 'OK');
    const uniqueSolvedProblems = [...new Map(solvedSubmissions.map(s => [s.problem.name, s])).values()];
    
    const ratedProblems = uniqueSolvedProblems.filter(p => p.problem.rating);
    const averageRating = ratedProblems.length > 0
        ? Math.round(ratedProblems.reduce((sum, p) => sum + p.problem.rating, 0) / ratedProblems.length)
        : 'N/A';

    const mostDifficultProblem = ratedProblems.reduce((max, p) => 
        (p.problem.rating > (max?.problem.rating || 0)) ? p : max, 
    null);

    const firstSubmissionDate = new Date(Math.min(...solvedSubmissions.map(s => s.creationTimeSeconds)) * 1000);
    const daysSinceFirstSolve = differenceInDays(new Date(), firstSubmissionDate) + 1;
    const avgProblemsPerDay = (uniqueSolvedProblems.length / daysSinceFirstSolve).toFixed(2);

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
            <StatCard 
                label="Total Problems Solved"
                value={uniqueSolvedProblems.length}
            />
            <StatCard 
                label="Avg Problems / Day"
                value={avgProblemsPerDay}
                subtext={`Since first solve`}
            />
            <StatCard 
                label="Highest Rated Solve"
                value={mostDifficultProblem ? mostDifficultProblem.problem.rating : 'N/A'}
                subtext={mostDifficultProblem ? `${mostDifficultProblem.problem.name}` : ''}
            />
            <StatCard 
                label="Average Problem Rating"
                value={averageRating}
            />
        </div>
    );
};

export default ProblemStats; 