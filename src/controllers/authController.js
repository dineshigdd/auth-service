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
        
        // Invalidate existing refresh tokens for the user (optional, depending on your token strategy)
        await db.refreshToken.updateMany({
        where: { userId: user.id },
        data: { revokedAt: new Date() }
        });

        const token = generateToken( user.id , user.role , process.env.ACCESS_TOKEN_SECRET, '15s' );
        // res.json({ token: generateToken( user.id , user.role )});

        res.cookie('token', token, { 
            httpOnly: true, 
            sameSite:'Lax', // Helps prevent CSRF attacks
            secure: false,// Set secure to true if using HTTPS,
            maxAge: 15 * 1000, // 15 seconds in milliseconds
            // maxAge: 60 * 60 * 1000 // 1 hour in milliseconds
        }); // Set cookie with JWT

        const refreshToken = generateToken( user.id , user.role , process.env.REFRESH_TOKEN_SECRET, '1m' ); // 1 minute expiration for testing purposes
        // Store the refresh token in the database (optional, for better security)  
        await db.refreshToken.create({
            data: {
                userId: user.id,
                token: refreshToken,
                expiresAt: new Date(Date.now() + 1 * 60 * 1000), // 1 minute from now for testing purposes
                revokedAt: null, // Not revoked
            }
        });

        // Set cookie with refresh token
        res.cookie('refreshToken', refreshToken, {
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
    const oldToken = req.refreshToken; // The refresh token from the request
    
   
    try {        
        
        const user = await db.user.findUnique({
            where: { id: id }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Look up token in DB
        const tokenRow = await db.refreshToken.findUnique({
            where: {
                token: oldToken,
            }
        });

        // Token not found => possible reuse attack or already revoked
        if (!tokenRow) {
            // Reuse detection: revoke all user's tokens if desired
            await db.refreshToken.updateMany({
                where: { userId: id },          
                data: { revokedAt:  new Date() } // Mark all tokens as revoked
        });

          return res.status(403).json({ error: "Refresh token reuse detected or invalid" });
        }
        
        // 3) Token found - check expiry / revoked
        // Potential attack or logout deny and force login
       if (tokenRow.revokedAt) { 
        return res.status(403).json({ error: "Refresh token revoked" });
        }
        if (tokenRow.expiresAt < new Date()) {
            await db.refreshToken.update({
                where: { token: oldToken },
                data: { revokedAt: new Date() }
            });
        return res.status(403).json({ error: "Refresh token expired" });
        }



        // Generate a new access token        
        const newAccessToken = generateToken(user.id, user.role , process.env.ACCESS_TOKEN_SECRET, '15s');        

        // You can also generate a new refresh token if needed
        const newRefreshToken = generateToken(user.id, user.role, process.env.REFRESH_TOKEN_SECRET , '1m'); // 7 days expiration
       
        

        //compute new expiresAt for the refresh token
        //production code would use a longer expiration time
        // const refreshExpSeconds = 7 * 24 * 60 * 60;
        // const newExpiresAt = new Date(Date.now() + refreshExpSeconds * 1000);


        const newExpiresAt = new Date(Date.now() + 1 * 60 * 1000); // 1 minute from now for refresh token test purposes

        await db.$transaction(async (tx) => {
        const newRow = await tx.refreshToken.create({
            data: {
            userId: user.id,
            token: newRefreshToken,
            expiresAt: newExpiresAt,
            revokedAt: null
            }
        });

        await tx.refreshToken.update({
            where: { token: oldToken },
            data: {
            revokedAt: new Date(),
            replacedById: newRow.id
            }
        });
        });

        /*await db.$transaction([
            db.refreshToken.update({
                where: { token: oldToken },
                data: { token: newRefreshToken, expiresAt: newExpiresAt }
            }),
            db.refreshToken.create({
                data: {
                    userId: user.id,
                    token: newRefreshToken,
                    expiresAt: newExpiresAt,
                    revokedAt: null // Not revoked
                }
            })  
        ]);*/

        // update replacedById: find the new token id and set replacedById on old row (two steps necessary)
        const newRow = await db.refreshToken.findUnique({ where: { token: newRefreshToken } });
         console.log("newRow", newRow);
        await db.refreshToken.update({
        where: { token: oldToken },
        data: { 
            revokedAt: new Date(),
            replacedById: newRow.id 
            },
        });


        //set cookies
        res.cookie('token', newAccessToken, { 
            httpOnly: true, 
            sameSite:'Lax', 
            secure: false,
            maxAge: 15 * 1000, // 15 seconds in milliseconds
            // maxAge: 60 * 60 * 1000 // 1 hour in milliseconds
        });


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

/*export const logout = async (req, res) => {
    try {
        // Clear the cookies
        res.clearCookie('token');
        res.clearCookie('refreshToken');
        
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}*/

export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (refreshToken) {
            // Find and revoke refresh token in DB
            await db.refreshToken.updateMany({
                where: { token: refreshToken },
                data: { revokedAt: new Date() }
            });
        }

        // Clear cookies
        res.clearCookie('token', { httpOnly: true, sameSite: 'Lax', secure: false });
        res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'Lax', secure: false });

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
