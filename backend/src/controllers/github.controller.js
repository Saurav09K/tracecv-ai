const { fetchUserRepositories } = require('../services/github.service');

const syncRepositories = async (req, res) => {
  try {
    const user = req.user; 

    const repos = await fetchUserRepositories(user.username);

    user.githubData.repositories = repos;
    user.githubData.lastSyncedAt = Date.now();
    await user.save();

    res.status(200).json({ 
      message: 'Repositories synced successfully',
      repositories: repos 
    });

  } catch (error) {
    console.error('Sync Error:', error.message);
    res.status(500).json({ error: 'Failed to sync repositories from GitHub' });
  }
};

module.exports = {
  syncRepositories
};