import React from 'react';
import { formatDistance, differenceInDays } from 'date-fns';

const StatCard = ({ label, value, subtext }) => (
    <div className="bg-slate-800/50 p-4 rounded-lg text-center">
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
        {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
    </div>
);

const ProblemStats = ({ submissions }) => {
    if (!submissions || submissions.length === 0) {
        return null; // Don't render anything if there are no submissions
    }

    const solvedSubmissions = submissions.filter(s => s.verdict === 'OK');
    const uniqueSolvedProblems = [...new Map(solvedSubmissions.map(s => [s.problem.name, s])).values()];

    const mostDifficultProblem = uniqueSolvedProblems.reduce((max, p) => 
        (p.problem.rating > (max?.problem.rating || 0)) ? p : max, 
    null);

    const firstSubmissionDate = new Date(Math.min(...solvedSubmissions.map(s => s.creationTimeSeconds)) * 1000);
    const daysSinceFirstSolve = differenceInDays(new Date(), firstSubmissionDate) + 1;
    const avgProblemsPerDay = (uniqueSolvedProblems.length / daysSinceFirstSolve).toFixed(2);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
            <StatCard 
                label="Most Difficult Problem"
                value={mostDifficultProblem ? mostDifficultProblem.problem.rating : 'N/A'}
                subtext={mostDifficultProblem ? `${mostDifficultProblem.problem.name}` : ''}
            />
            <StatCard 
                label="Total Problems Solved"
                value={uniqueSolvedProblems.length}
            />
            <StatCard 
                label="Average Problems / Day"
                value={avgProblemsPerDay}
                subtext={`Since ${formatDistance(firstSubmissionDate, new Date(), { addSuffix: true })}`}
            />
        </div>
    );
};

export default ProblemStats; 