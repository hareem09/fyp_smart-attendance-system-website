const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

 const generateAuthToken = (user) => {
    const payload = {
    id: user.id,
    email: user.email
    }
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    return accessToken;

}
const generateRefreshToken=(user)=>{
    const payload={
        id:user.id,
        email:user.email
    }
    const refreshToken=jwt.sign(payload,process.env.REFRESH_TOKEN_SECRET,{expiresIn:'7d'})
    return refreshToken
} 

module.exports = {
    generateAuthToken,
    generateRefreshToken
}