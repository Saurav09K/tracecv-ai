const redisClient = require('../config/redis');

const aiRateLimiter = async (req, res, next) => {

    const ip = req.ip;

    const key = `rate_limit:${ip}`;

    try {

        const requests = await redisClient.get(key);

        if (requests === null) {

            await redisClient.set(
                key,
                1,
                {
                    EX: 24 * 60 * 60
                }
            );

            return next();
        }

        if (parseInt(requests) >= 5) {

            return res.status(429).json({ 
            error: 'Rate limit exceeded.', 
            message: 'You have reached your limit of 5 AI generations for today. Please try again tomorrow.' 
            });
        }

        await redisClient.incr(key);

        next();

    } catch (error) {

        res.status(500).json({
            message: 'Rate limiter error'
        });
    }
};

module.exports = aiRateLimiter;