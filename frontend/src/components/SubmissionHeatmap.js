import React from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import { subYears, formatISO, differenceInDays, isAfter } from 'date-fns';
import { Tooltip } from 'react-tooltip';

import './SubmissionHeatmap.css';

const calculateStreak = (dates) => {
    if (dates.length === 0) return 0;
    const sortedDates = dates.map(d => new Date(d)).sort((a, b) => a - b);
    let maxStreak = 1;
    let currentStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
        const diff = differenceInDays(sortedDates[i], sortedDates[i-1]);
        if (diff === 1) {
            currentStreak++;
        } else if (diff > 1) {
            currentStreak = 1;
        }
        if (currentStreak > maxStreak) {
            maxStreak = currentStreak;
        }
    }
    return maxStreak;
};


const SubmissionHeatmap = ({ submissions }) => {
    const today = new Date();
    const oneYearAgo = subYears(today, 1);
    
    const HeatmapStat = ({ value, label }) => (
      <div className="text-center">
        <span className="text-xl lg:text-2xl font-bold text-gray-800 dark:text-white">{value}</span>
        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">{label}</span>
      </div>
    );

    if (!submissions || submissions.length === 0) {
        return (
             <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50">
                <div className="mx-auto" style={{ maxWidth: '720px' }}>
                     <CalendarHeatmap
                        startDate={oneYearAgo}
                        endDate={today}
                        values={[]}
                        classForValue={() => 'color-empty'}
                        showMonthLabels={true}
                        gutterSize={1}
                    />
                </div>
                 <div className="flex justify-between items-center mt-4 text-xs text-gray-500 dark:text-gray-400">
                    <p>Less</p>
                    <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-slate-700"></div>
                        <div className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-slate-700"></div>
                        <div className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-slate-700"></div>
                        <div className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-slate-700"></div>
                    </div>
                    <p>More</p>
                </div>
            </div>
        );
    }
  
    const submissionCounts = submissions.reduce((acc, submission) => {
        const date = formatISO(new Date(submission.creationTimeSeconds * 1000), { representation: 'date' });
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});

    const heatmapValues = Object.keys(submissionCounts)
        .filter(date => isAfter(new Date(date), oneYearAgo))
        .map(date => ({
            date: date,
            count: submissionCounts[date],
        }));
    
    const totalSubmissionsLastYear = heatmapValues.reduce((sum, val) => sum + val.count, 0);
    const totalActiveDays = heatmapValues.length;
    const maxStreak = calculateStreak(heatmapValues.map(v => v.date));

    return (
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50">
            <div className="flex justify-around items-center mb-4 text-sm text-gray-600 dark:text-gray-400 px-1">
                <HeatmapStat value={totalSubmissionsLastYear} label="Submissions this year" />
                <HeatmapStat value={totalActiveDays} label="Active days" />
                <HeatmapStat value={maxStreak} label="Longest streak" />
            </div>
            <div className="mx-auto heatmap-container" style={{ maxWidth: '720px' }}>
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
                    tooltipDataAttrs={value => ({
                        'data-tooltip-id': 'heatmap-tooltip',
                        'data-tooltip-content': value.date ? `${value.count} submissions on ${value.date}` : 'No submissions'
                    })}
                    showMonthLabels={true}
                    gutterSize={1}
                />
            </div>
            <div className="flex justify-between items-center mt-4 text-xs text-gray-500 dark:text-gray-400 px-2">
                <p>Less</p>
                <div className="flex items-center gap-1">
                    <span className="sr-only">Color scale for submissions per day</span>
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--heatmap-scale-0, #ebedf0)'}}></div>
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--heatmap-scale-1)'}}></div>
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--heatmap-scale-2)'}}></div>
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--heatmap-scale-3)'}}></div>
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--heatmap-scale-4)'}}></div>
                </div>
                <p>More</p>
            </div>
            <Tooltip id="heatmap-tooltip" />
        </div>
    );
};

export default SubmissionHeatmap;
