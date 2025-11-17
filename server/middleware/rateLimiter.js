import rateLimit from 'express-rate-limit';


export const uploadRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, //1 hour
    max: 60, //limit
    standardHeader: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many uploads, please try again later' },
    keyGenerator: (req) => {
        // prefer user id if aailabe (prtotect middleware sets req.userID)
        return req.userId || req.ip;
    }
});

export const createApiLimiter = ({ windowMs = 15 * 60 * 1000, max = 100 } = {}) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.userId || req.ip
  });
};