import React from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import { subYears, formatISO } from 'date-fns';
import { Tooltip } from 'react-tooltip';

import './SubmissionHeatmap.css';

const SubmissionHeatmap = ({ submissions }) => {
  if (!submissions || submissions.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-slate-800/50 rounded-lg">
        <p className="text-gray-400">No submission data available for this user.</p>
      </div>
    );
  }
  
  const today = new Date();
  const oneYearAgo = subYears(today, 1);

  const submissionCounts = submissions.reduce((acc, submission) => {
    const date = formatISO(new Date(submission.creationTimeSeconds * 1000), { representation: 'date' });
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const heatmapValues = Object.keys(submissionCounts).map(date => ({
    date: date,
    count: submissionCounts[date],
  }));

  return (
    <div className="p-4">
      <CalendarHeatmap
        startDate={oneYearAgo}
        endDate={today}
        values={heatmapValues}
        classForValue={(value) => {
          if (!value) {
            return 'color-empty';
          }
          return `color-scale-${Math.min(value.count, 4)}`;
        }}
        tooltipDataAttrs={value => {
            return {
              'data-tooltip-id': 'heatmap-tooltip',
              'data-tooltip-content': value.date ? `${value.count} submissions on ${value.date}` : 'No submissions'
            };
        }}
        showWeekdayLabels={true}
      />
      <Tooltip id="heatmap-tooltip" />
    </div>
  );
};

export default SubmissionHeatmap; 