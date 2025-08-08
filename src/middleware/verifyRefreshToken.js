import jwt from 'jsonwebtoken';

export const verifyRefreshToken = (req, res, next) => {
    const token = req.cookies?.refreshToken;//assume the token is stored in a cookie named 'refreshToken'

    if (!token) {
        return res.status(401).json({ error: 'Not authorized, no refresh token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        console.log("decoded", decoded);
        req.user = decoded;
        // res.cookie('token', token, { httpOnly: true, secure: true }); // Set cookie with JWT
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Not authorized, refresh token failed' });
    }
}