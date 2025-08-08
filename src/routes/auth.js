import express from 'express';
import { register, login , logout , refreshToken , getCurrentUser  } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { verifyAccessToken } from '../middleware/verifyAccessToken.js';
import { verifyRefreshToken } from '../middleware/verifyRefreshToken.js';

const router = express.Router();
router.post('/register', register );
router.post('/login', login ); 
router.post('/refresh', verifyRefreshToken, refreshToken ); // Route to refresh the access token, protected by the verifyRefreshToken middleware}); 
router.get('/me', verifyAccessToken, getCurrentUser); // Route to get the current user's details, protected by the auth middleware

router.get('/logout', logout);

router.get('/test', protect, (req, res) => { //a test route to check if the auth route is working
    res.json({ message: 'Auth route is working' });
});

export default router;