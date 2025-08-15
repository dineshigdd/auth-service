import jwt from 'jsonwebtoken';


export const verifyRefreshToken = async (req, res, next) => {
    const token = req.cookies?.refreshToken;//assume the token is stored in a cookie named 'refreshToken'

    if (token) req.refreshToken = token;

    if (!token) {
        return res.status(401).json({ error: 'Not authorized, no refresh token' });
    }

    try {
        // Verify signature first (will throw if invalid)
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        console.log("decoded", decoded);
        req.user = decoded;        

        next();
    } catch (err) {
        return res.status(401).json({ error: 'Not authorized, refresh token failed' });
    }
}