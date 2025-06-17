import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-4 bg-slate-800 text-white rounded-lg border border-slate-700 shadow-lg">
        <p className="font-bold text-lg">{data.contestName}</p>
        <p className="text-sm">{`Date: ${format(new Date(data.ratingUpdateTimeSeconds * 1000), 'MMM d, yyyy')}`}</p>
        <p className="text-sm text-green-400">{`New Rating: ${data.newRating}`}</p>
        <p className="text-sm text-gray-400">{`Previous Rating: ${data.oldRating}`}</p>
        <p className="text-sm text-sky-400">{`Rank: ${data.rank}`}</p>
      </div>
    );
  }
  return null;
};

const RatingChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-800/50 rounded-lg">
        <p className="text-gray-400">No contest data available for this user.</p>
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
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="date" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" domain={['dataMin - 100', 'dataMax + 100']} />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeWidth: 1 }} />
        <Legend />
        <Line type="monotone" dataKey="newRating" name="Rating" stroke="#38bdf8" strokeWidth={2} activeDot={{ r: 8 }} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RatingChart; 