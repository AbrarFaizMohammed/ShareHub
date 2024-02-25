require("dotenv").config();
const jwt = require("jsonwebtoken");

exports.cookieJwtAuth = (req,res,next)=>{
   const token = req.cookies.token;
   try{
        const user = jwt.verify(token,process.env.Jwt_Secret);
        req.user = user;
        next();
   }catch(err){
        res.clearCookie("token");
        return res.redirect("/login");
   }
}