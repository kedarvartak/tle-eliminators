const axios = require('axios');
const crypto = require('crypto');

const API_KEY = process.env.CODEFORCES_API_KEY;
const API_SECRET = process.env.CODEFORCES_API_SECRET;
const API_BASE_URL = 'https://codeforces.com/api/';

/**
 * Generates the API signature required for authenticated Codeforces API calls.
 * @param {string} methodName - The API method name (e.g., 'user.info').
 * @param {Object} params - The parameters for the API call.
 * @returns {string} The generated API signature hash.
 */
const generateApiSignature = (methodName, params) => {
  const paramString = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');

  const rand = Math.floor(100000 + Math.random() * 900000);
  const sigString = `${rand}/${methodName}?${paramString}#${API_SECRET}`;

  const hash = crypto.createHash('sha512').update(sigString).digest('hex');
  return `${rand}${hash}`;
};

/**
 * Fetches and combines user info, contest history, and submission history from the Codeforces API.
 * Uses authenticated call for user.info if API keys are provided.
 * @param {string} handle - The Codeforces handle of the user.
 * @returns {Promise<object>} An object containing the processed data.
 * @throws {Error} Throws an error if the handle is not found or the API fails.
 */
const fetchCodeforcesData = async (handle) => {
    
    const userInfoParams = { handles: handle };
    if (API_KEY && API_SECRET) {
        userInfoParams.apiKey = API_KEY;
        userInfoParams.time = Math.floor(Date.now() / 1000);
        userInfoParams.apiSig = generateApiSignature('user.info', userInfoParams);
    }

    try {
        const [userInfoRes, contestHistoryRes, submissionHistoryRes] = await axios.all([
            axios.get(`${API_BASE_URL}user.info`, { params: userInfoParams }),
            axios.get(`${API_BASE_URL}user.rating`, { params: { handle } }),
            axios.get(`${API_BASE_URL}user.status`, { params: { handle, from: 1, count: 2000 } })
        ]);

        const user = userInfoRes.data.result[0];

        return {
            current_rating: user.rating || 0,
            max_rating: user.maxRating || 0,
            contest_history: contestHistoryRes.data.result,
            submission_history: submissionHistoryRes.data.result,
            last_updated: new Date()
        };

    } catch (error) {
        if (error.response && error.response.status === 400) {
            const comment = error.response.data.comment;
            if (comment && comment.includes('not found')) {
                throw new Error(`Codeforces handle "${handle}" not found.`);
            }
        }
        
    }
};

module.exports = {
  fetchCodeforcesData,
}; 