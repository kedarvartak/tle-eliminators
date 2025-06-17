import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-4 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-slate-700 shadow-lg">
        <p className="font-bold text-lg">{data.contestName}</p>
        <p className="text-sm text-gray-600 dark:text-gray-300">{`Date: ${format(new Date(data.ratingUpdateTimeSeconds * 1000), 'MMM d, yyyy')}`}</p>
        <p className="text-sm text-green-500 dark:text-green-400">{`New Rating: ${data.newRating}`}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{`Previous Rating: ${data.oldRating}`}</p>
        <p className="text-sm text-sky-500 dark:text-sky-400">{`Rank: ${data.rank}`}</p>
      </div>
    );
  }
  return null;
};

const RatingChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-slate-800/50 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">No contest data available for this user.</p>
      </div>
    );
  }

  const formattedData = data.map(contest => ({
    ...contest,
    date: format(new Date(contest.ratingUpdateTimeSeconds * 1000), 'MMM yy'),
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--heatmap-empty-color)" />
        <XAxis dataKey="date" stroke="var(--heatmap-month-label-color)" />
        <YAxis stroke="var(--heatmap-month-label-color)" domain={['dataMin - 100', 'dataMax + 100']} />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--heatmap-month-label-color)', strokeWidth: 1 }} />
        <Legend wrapperStyle={{ color: 'var(--heatmap-month-label-color)' }}/>
        <Line type="monotone" dataKey="newRating" name="Rating" stroke="#0ea5e9" strokeWidth={2} activeDot={{ r: 8 }} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RatingChart; 