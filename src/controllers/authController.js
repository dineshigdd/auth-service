import bcrypt from 'bcrypt';
import prisma from '@prisma/client';
import { generateToken } from '../utils/generateToken.js';

const db = new prisma.PrismaClient();



export const register = async( req , res ) => {
    const { username , email, password } = req.body;
   
    // if( !username || !email || !password ){
    //     return res.status( 400 ).json({ error: "All fields are required" });
    // }else{
    //     const existingUser = await db.user.findUnique({
    //         where: { email }
    //     });

    //     if( existingUser ){
    //         return res.status( 400 ).json({ error: "User already exists" });
    //     }
    // }

    try{
        const salt = await bcrypt.genSalt(10);
        const hashpassword = await bcrypt.hash( password,  salt );
        const user = await db.user.create({
            data: { username, email , password: hashpassword },
        });

        res.json({ token: generateToken( user.id , user.role , process.env.ACCESS_TOKEN_SECRET,  '1h' )});
    }catch( err ){
        res.status( 400 ).json({ error: err.message });
        }
};

export const login = async( req , res ) => {
    const { email, password } = req.body;   

    try{
        const user = await db.user.findUnique({
            where: { email }
        });

        if( !user ){
            return res.status( 400 ).json({ error: "User not found" });
        }

        const isMatch = await bcrypt.compare( password, user.password );
        if( !isMatch ){
            return res.status( 400 ).json({ error: "Invalid credentials" });
        }
        
        const token = generateToken( user.id , user.role , process.env.ACCESS_TOKEN_SECRET, '15s' );
        // res.json({ token: generateToken( user.id , user.role )});

        res.cookie('token', token, { 
            httpOnly: true, 
            sameSite:'Lax', // Helps prevent CSRF attacks
            secure: false,// Set secure to true if using HTTPS,
            maxAge: 15 * 1000, // 15 seconds in milliseconds
            // maxAge: 60 * 60 * 1000 // 1 hour in milliseconds
        }); // Set cookie with JWT


        // Set cookie with refresh token
        res.cookie('refreshToken', generateToken( user.id , user.role , process.env.REFRESH_TOKEN_SECRET, '1m'), {
            httpOnly: true,
            sameSite: 'Lax', // Helps prevent CSRF attacks
            secure: false, // Set secure to true if using HTTPS         
            maxAge:  1 * 60 * 1000 // 1 minutes in milliseconds
            // maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
        }); 
        
        // Optional: Send a success response (without token in body)
        res.status(200).json({ message: 'Login successful', token });
    }catch( err ){
        res.status( 400 ).json({ error: err.message });
    }
}

// This function retrieves the current user's details based on the token provided in the request headers.
export const getCurrentUser = async( req , res ) => {
    try{
        res.status( 200 ).json( req.user );
    }catch( err ){
        res.status( 400 ).json({ error: err.message });
    }
        
}

// export const getCurrentUser = async (req, res) => {
//     try {
//         const user = await db.user.findUnique({ where: { id: req.user.id } }); 
//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }
//         res.status(200).json(user);
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// }                                                        

export const refreshToken = async( req, res ) => {
   
    const { id } = req.user;
    
    
    try {        
        
        const user = await db.user.findUnique({
            where: { id: id }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate a new access token        
        const newAccessToken = generateToken(user.id, user.role , process.env.ACCESS_TOKEN_SECRET, '15s');
        res.cookie('token', newAccessToken, { 
            httpOnly: true, 
            sameSite:'Lax', 
            secure: false,
            maxAge: 15 * 1000, // 15 seconds in milliseconds
            // maxAge: 60 * 60 * 1000 // 1 hour in milliseconds
        });

        // You can also generate a new refresh token if needed
        const newRefreshToken = generateToken(user.id, user.role, process.env.REFRESH_TOKEN_SECRET , '1m'); // 7 days expiration
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            sameSite: 'Lax',                 
            secure: false,   
            maxAge:  1 * 60 * 1000 // 1 minutes in milliseconds
           // maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
        });
        
        res.status(200).json({ message: 'Token refreshed successfully', token: newAccessToken });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

export const logout = async (req, res) => {
    try {
        // Clear the cookies
        res.clearCookie('token');
        res.clearCookie('refreshToken');
        
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}