import React, { useState } from 'react';
import { format } from 'date-fns';

const ContestList = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!data || data.length === 0) {
    return (
      <div className="mt-4 text-center text-gray-500 dark:text-gray-400 py-8">
        No contests found for the selected period.
      </div>
    );
  }

  // api returns oldest data first, so we have to reverse the data to display latest first
  const contests = [...data].reverse();
  const contestsToShow = isExpanded ? contests : contests.slice(0, 10);

  return (
    <>
      <div className="mt-6 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300 dark:divide-slate-700">
              <thead>
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-300 sm:pl-0">Contest Name</th>
                  <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-300">Date</th>
                  <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-300">Rank</th>
                  <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-300">Rating Change</th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0 text-center text-sm font-semibold text-gray-900 dark:text-gray-300">New Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                {contestsToShow.map((contest) => {
                  const ratingChange = contest.newRating - contest.oldRating;
                  const ratingChangeClass = ratingChange >= 0 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400';
                  const ratingChangeSign = ratingChange >= 0 ? '+' : '';

                  return (
                    <tr key={contest.contestId}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-0">{contest.contestName}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">{format(new Date(contest.ratingUpdateTimeSeconds * 1000), 'MMM d, yyyy')}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">{contest.rank}</td>
                      <td className={`whitespace-nowrap px-3 py-4 text-sm font-medium text-center ${ratingChangeClass}`}>
                        {`${ratingChangeSign}${ratingChange}`}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm font-bold text-sky-500 dark:text-sky-400 text-center">{contest.newRating}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {contests.length > 10 && (
        <div className="mt-4 text-center">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm font-semibold text-sky-600 dark:text-brand-accent hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
          >
            {isExpanded ? 'View Less' : 'View More'}
          </button>
        </div>
      )}
    </>
  );
};

export default ContestList; 