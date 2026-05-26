const axios = require('axios');

const fetchUserRepositories = async (username) => {
  try {
    const response = await axios.get(`https://api.github.com/users/${username}/repos`, {
      params: {
        sort: 'updated',
        per_page: 10
      }
    });
    
    const cleanedRepos = response.data.map(repo => ({
      name: repo.name,
      description: repo.description || 'No description provided',
      primaryLanguage: repo.language,
      stars: repo.stargazers_count,
      url: repo.html_url
    }));

    return cleanedRepos;

  } catch (error) {
    console.error('Error fetching GitHub repos:', error.response?.data || error.message);
    throw new Error('Failed to fetch repositories');
  }
};

module.exports = {
  fetchUserRepositories
};