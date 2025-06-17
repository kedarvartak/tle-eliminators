import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-slate-700 shadow-lg">
                <p className="font-bold">{`Rating: ${label}`}</p>
                <p className="text-sm text-sky-500 dark:text-sky-400">{`Problems Solved: ${payload[0].value}`}</p>
            </div>
        );
    }
    return null;
};

const RatingDistributionChart = ({ submissions }) => {
    if (!submissions || submissions.length === 0) {
        return null; 
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
            <h3 className="text-xl font-semibold mb-4 text-center text-gray-900 dark:text-white">Problem Rating Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.9}/>
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.7}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--heatmap-empty-color)" vertical={false} />
                    <XAxis 
                        dataKey="rating" 
                        stroke="var(--heatmap-month-label-color)"
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis 
                        stroke="var(--heatmap-month-label-color)"
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                        tickCount={6}
                    />
                    <Tooltip
                        cursor={{ fill: 'rgba(100, 116, 139, 0.2)' }}
                        content={<CustomTooltip />}
                    />
                    <Bar 
                        dataKey="count" 
                        name="Problems Solved" 
                        fill="url(#barGradient)"
                        radius={[4, 4, 0, 0]} 
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RatingDistributionChart; 