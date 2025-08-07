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

        res.json({ token: generateToken( user.id , user.role )})
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

        const token = generateToken( user.id , user.role );
        // res.json({ token: generateToken( user.id , user.role )});

        res.cookie('token', token, { 
            httpOnly: true, 
            sameSite:'Lax', // Helps prevent CSRF attacks
            secure: false,// Set secure to true if using HTTPS
            maxAge: 60 * 60 * 1000 // 1 hour in milliseconds
        }); // Set cookie with JWT

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