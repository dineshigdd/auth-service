import jwt from 'jsonwebtoken';

export const verifyAccessToken = (req, res, next) => {
    const token = req.cookies?.token;//assume the token is stored in a cookie named 'token'
    
    if (!token) {
        return res.status(401).json({ error: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;
        // res.cookie('token', token, { httpOnly: true, secure: true }); // Set cookie with JWT
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Not authorized, token failed' });
    }
}