const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

  githubId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  avatarUrl: { type: String },

 
  githubData: {
    repositories: { type: Array, default: [] },
    topLanguages: { type: Object, default: {} }, 
    recentCommits: { type: Array, default: [] },
    lastSyncedAt: { type: Date }
  },

 
  generatedResumes: [{
    targetJobTitle: { type: String, required: true },
    targetJobDescription: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    
    resumeContent: {
      summary: { type: String },
      experience: [{
        role: { type: String },
        bulletPoints: [{ type: String }]
      }],
      technicalSkills: [{ type: String }]
    },

    
    explainableTrace: [{
      resumeSection: { type: String }, 
      referencedCommitSha: { type: String }, 
      referencedRepo: { type: String },
      aiReasoning: { type: String } 
    }]
  }]
}, { 
  timestamps: true 
});

module.exports = mongoose.model('User', userSchema);