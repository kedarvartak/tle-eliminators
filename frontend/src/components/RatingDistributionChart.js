import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const RatingDistributionChart = ({ submissions }) => {
    if (!submissions || submissions.length === 0) {
        return null; // Don't render if no data
    }

    const solvedSubmissions = submissions.filter(s => s.verdict === 'OK' && s.problem.rating);
    const uniqueSolvedProblems = [...new Map(solvedSubmissions.map(s => [s.problem.name, s])).values()];

    const ratingBuckets = uniqueSolvedProblems.reduce((acc, { problem }) => {
        const bucket = Math.floor(problem.rating / 100) * 100;
        acc[bucket] = (acc[bucket] || 0) + 1;
        return acc;
    }, {});

    const chartData = Object.keys(ratingBuckets)
        .map(bucket => ({
            rating: parseInt(bucket, 10),
            count: ratingBuckets[bucket]
        }))
        .sort((a, b) => a.rating - b.rating);

    return (
        <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4 text-center">Problem Rating Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="rating" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                        cursor={{ fill: 'rgba(71, 85, 105, 0.5)' }}
                        contentStyle={{ 
                            backgroundColor: '#1e293b', 
                            border: '1px solid #334155',
                            borderRadius: '0.5rem'
                        }}
                    />
                    <Legend />
                    <Bar dataKey="count" name="Problems Solved" fill="#38bdf8" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RatingDistributionChart; 