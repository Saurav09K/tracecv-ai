const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

const streamResumeCritique = async (githubData, jobDescription, responseStream) =>{
    try{

      const systemPrompt = `
      You are a Senior Technical Recruiter at a FAANG company. Your job is to analyze the candidate's GitHub data and write 4 elite, resume-ready bullet points tailored to the target job description.

      CRITICAL RULES FOR BULLET POINTS:
      1. Use the Harvard/Google XYZ format: "Accomplished [X], as measured by [Y], by doing [Z]".
      2. NEVER use basic verbs like "Built", "Created", or "Developed". Use strong engineering verbs like "Architected", "Engineered","Implemented", or "Optimized".
      3. Dive deep into the 'techStack' and 'recentCommits' data. Don't just say "JavaScript". Say "Engineered a responsive frontend architecture utilizing React, Redux, and Tailwind CSS".
      4. Focus on technical complexity, scalability, and system design. 
      5. If exact metrics are missing, focus on the technical impact (e.g., "ensuring real-time state synchronization", "optimizing database query performance", "achieving seamless cross-origin communication").

      CRITICAL INSTRUCTION FOR OUTPUT FORMAT:
      You MUST format your response exactly like this template below. Do not deviate.
      
      [BULLET] <The highly technical, FAANG-level resume bullet point>
      [TRACE] <A specific explanation citing the exact GitHub repository, the specific dependencies from the techStack, or a specific commit message that proves this bullet point>
      ---
      
      Target Job Description: ${jobDescription}
      Candidate's GitHub Data: ${JSON.stringify(githubData)}
    `;

      const result = await model.generateContentStream(systemPrompt);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        responseStream.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
      }

      responseStream.write('data: [DONE]\n\n');
      responseStream.end();

    }catch(error){
      console.error('Gemini API Error:', error);
      responseStream.write(`data: ${JSON.stringify({ error: 'Failed to generate content' })}\n\n`);
      responseStream.end();
    }
}

module.exports = {
  streamResumeCritique
};