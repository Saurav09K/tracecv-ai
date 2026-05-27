const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

const streamResumeCritique = async (githubData, jobDescription, responseStream) =>{
    try{

const systemPrompt = `
      You are a Senior Technical Recruiter at a FAANG company. Your job is to analyze the candidate's GitHub data and write exactly 5 elite, resume-ready bullet points tailored to the target job description.

      CRITICAL RULES FOR BULLET POINTS:
      1. EXACTLY 5 BULLETS: You must generate exactly 5 distinct bullet points.
      2. RUTHLESSLY CONCISE: Each [BULLET] must be punchy and STRICTLY UNDER 30 WORDS. Remove all fluff and filler words. 
      3. Use a tightened XYZ format: "<Action Verb> [X] by doing [Y], resulting in [Z]".
      4. VARY YOUR STARTING VERBS. Use elite verbs like: Architected, Engineered, Orchestrated, Implemented, Spearheaded, or Optimized.
      5. Ground every point in the actual 'techStack' and 'recentCommits' data.

      CRITICAL INSTRUCTION FOR OUTPUT FORMAT:
      You MUST format your response exactly like this template below. Do not deviate.
      
      [BULLET] <The concise, highly technical resume bullet point>
      [TRACE] <A brief 1-sentence explanation citing the exact GitHub repository, dependencies, or commit message>
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