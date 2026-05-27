const { streamResumeCritique } = require('../services/ai.service');

const generateResume = async (req, res) => {
  try {
    const { jobDescription } = req.body;
    const user = req.user; 

    if (!jobDescription) {
      return res.status(400).json({ error: 'Job description is required' });
    }

    if (!user.githubData || !user.githubData.repositories || user.githubData.repositories.length === 0) {
      return res.status(400).json({ error: 'You must sync your GitHub repositories first.' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    res.flushHeaders(); 

    await streamResumeCritique(user.githubData, jobDescription, res);

  } catch (error) {
    console.error('Generation Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to initialize AI stream' });
    } else {
      res.write(`data: ${JSON.stringify({ error: 'Stream crashed mid-generation' })}\n\n`);
      res.end();
    }
  }
};

module.exports = {
  generateResume
};