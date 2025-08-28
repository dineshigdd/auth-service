import dotenv from "dotenv";

// Wipe out existing env first
for (const key of Object.keys(process.env)) {
  if (key !== "NODE_ENV") delete process.env[key];
}


// Now load only test env
dotenv.config({ path: ".env.test", override: true });
console.log("Jest setup loaded, ACCESS_TOKEN_SECRET =", process.env.ACCESS_TOKEN_SECRET);