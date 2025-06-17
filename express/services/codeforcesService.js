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
 * Fetches user information from the Codeforces API.
 * @param {string} handle - The Codeforces handle of the user.
 * @returns {Promise<Object>} A promise that resolves to the user's data.
 */
const getUserInfo = async (handle) => {
  const methodName = 'user.info';
  const params = {
    handles: handle,
    apiKey: API_KEY,
    time: Math.floor(Date.now() / 1000),
  };

  const apiSig = generateApiSignature(methodName, params);
  params.apiSig = apiSig;

  try {
    const response = await axios.get(`${API_BASE_URL}${methodName}`, { params });
    if (response.data.status === 'OK') {
      return response.data.result[0];
    } else {
      throw new Error(response.data.comment || 'Failed to fetch user info from Codeforces.');
    }
  } catch (error) {
    console.error('Codeforces API Error:', error.message);
    throw error;
  }
};

/**
 * Fetches contest history for a user from the Codeforces API.
 * @param {string} handle - The Codeforces handle of the user.
 * @returns {Promise<Array>} A promise that resolves to the user's contest history.
 */
const getContestHistory = async (handle) => {
  const methodName = 'user.rating';
  try {
    const response = await axios.get(`${API_BASE_URL}${methodName}`, { params: { handle } });
    if (response.data.status === 'OK') {
      // The result is an array of contest objects
      return response.data.result;
    } else {
      throw new Error(response.data.comment || 'Failed to fetch contest history from Codeforces.');
    }
  } catch (error) {
    console.error('Codeforces API Error (user.rating):', error.message);
    // Rethrow to be handled by the sync route
    throw error;
  }
};

/**
 * Fetches submission history for a user from the Codeforces API.
 * @param {string} handle - The Codeforces handle of the user.
 * @returns {Promise<Array>} A promise that resolves to the user's submission history.
 */
const getSubmissionHistory = async (handle) => {
  const methodName = 'user.status';
  try {
    const response = await axios.get(`${API_BASE_URL}${methodName}`, { params: { handle } });
    if (response.data.status === 'OK') {
      return response.data.result;
    } else {
      throw new Error(response.data.comment || 'Failed to fetch submission history from Codeforces.');
    }
  } catch (error) {
    console.error('Codeforces API Error (user.status):', error.message);
    throw error;
  }
};

module.exports = {
  getUserInfo,
  getContestHistory,
  getSubmissionHistory,
}; 