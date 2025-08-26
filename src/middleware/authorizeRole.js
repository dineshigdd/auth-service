export const authorizeRole = ( role ) => {
    return (req, res, next) => {
        const user = req.user;
        
        if (!user || !role.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
        }
        next();
    };
}

