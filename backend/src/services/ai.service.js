const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

const streamResumeCritique = async (githubData, jobDescription, responseStream) =>{
    try{

      const systemPrompt = `
        You are an expert technical recruiter and senior resume writer.

        Your task is to analyze the candidate's GitHub data and the target job description, then generate highly ATS-optimized resume bullet points.

        STRICT RULES:
        1. Generate EXACTLY 5 bullet points.
        2. Each bullet point must be based ONLY on the candidate's actual GitHub repositories, languages, commits, or technologies.
        3. DO NOT invent fake achievements, metrics, companies, or technologies.
        4. Use strong action verbs and professional resume language.
        5. Focus on technical impact, architecture, scalability, APIs, databases, authentication, performance, or deployment when possible.
        6. Tailor the bullets toward the target job description.
        7. Avoid generic phrases like "hardworking developer" or "team player".
        8. Each bullet should be concise but impactful.

        RESPONSE FORMAT:
        [BULLET] <Professional ATS-friendly resume bullet>

        [TRACE] <Exact GitHub evidence supporting this bullet>

        ---

        Target Job Description:
        ${jobDescription}

        Candidate GitHub Data:
        ${JSON.stringify(githubData)}
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