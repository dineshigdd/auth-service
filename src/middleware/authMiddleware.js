import jwt from 'jsonwebtoken';


export  const protect = (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    console.log( "token....")
    console.log( token);
    if (!token) {
        return res.status(401).json({ error: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: error.message || 'Not authorized, token failed' });
    }
}