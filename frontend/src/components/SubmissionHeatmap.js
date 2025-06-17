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

    if (!submissions || submissions.length === 0) {
        return (
             <div className="p-4">
                <div className="flex justify-between items-center mb-2 text-sm text-gray-400 px-1">
                    <p className="font-bold text-base text-white">0 submissions in the past year</p>
                    <div className="flex gap-4">
                        <span>Total active days: 0</span>
                        <span>Max streak: 0</span>
                    </div>
                </div>
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
                 <Tooltip id="heatmap-tooltip" />
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
        <div className="p-4">
             <div className="flex justify-between items-center mb-2 text-sm text-gray-400 px-1">
                <p className="font-bold text-base text-white">{totalSubmissionsLastYear} submissions in the past year</p>
                <div className="flex gap-4">
                    <span>Total active days: {totalActiveDays}</span>
                    <span>Max streak: {maxStreak}</span>
                </div>
            </div>
            <div className="mx-auto" style={{ maxWidth: '720px' }}>
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
            <Tooltip id="heatmap-tooltip" />
        </div>
    );
};

export default SubmissionHeatmap;
