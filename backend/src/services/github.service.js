const axios = require('axios');

const fetchUserRepositories = async (username) => {
  try {
    const repoResponse = await axios.get(`https://api.github.com/users/${username}/repos`, {
      params: { sort: 'updated', per_page: 5 }
    });
    
    const baseRepos = repoResponse.data.map(repo => ({
      name: repo.name,
      description: repo.description || 'No description provided',
      primaryLanguage: repo.language,
      url: repo.html_url
    }));

    const reposWithContext = await Promise.all(baseRepos.map(async (repo) => {
      let meaningfulCommits = [];
      let readmeContent = 'No README available.';

      // FETCH COMMITS
      try {
        const commitResponse = await axios.get(`https://api.github.com/repos/${username}/${repo.name}/commits`, {
          params: { per_page: 30 } 
        });
        
        meaningfulCommits = commitResponse.data
          .map(c => c.commit.message)
          .filter(msg => {
            const lower = msg.toLowerCase();
            return lower.length > 15 
                && !lower.includes('merge pull request') 
                && !lower.includes('update readme')
                && !lower.includes('wip');
          })
          .slice(0, 10);
      } catch (error) {
      }

      // FETCH README
      try {
        const readmeResponse = await axios.get(`https://api.github.com/repos/${username}/${repo.name}/readme`, {
          headers: { Accept: 'application/vnd.github.v3.raw' } 
        });
        
        readmeContent = readmeResponse.data.substring(0, 1500); 
      } catch (error) {
      }

      return { 
        ...repo, 
        recentCommits: meaningfulCommits,
        readme: readmeContent
      };
    }));

    return reposWithContext;

  } catch (error) {
    console.error('Error fetching GitHub data:', error.response?.data || error.message);
    throw new Error('Failed to fetch repositories and context');
  }
};

module.exports = {
  fetchUserRepositories
};