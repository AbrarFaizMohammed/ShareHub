require("dotenv").config();
const express = require("express");
const bodyparse = require("body-parser");
const path = require("path");
const { default: mongoose } = require("mongoose");
const routes = require("./routes/auth-routes");
const { faL } = require("@fortawesome/free-solid-svg-icons");
const { REFUSED } = require("dns");
const cookieParser = require("cookie-parser");
const https = require("https");
const _ = require('lodash');
const multer  = require('multer');
const { cookieJwtAuth } = require("./middleware/cookieJwtAuth.js");
const { categoryImages, getCategoriesImages, categoryImagesUpload} = require("./middleware/checkCategorys.js");
const { productImages, getproductsInformation, addproduct, ProductImageUpload} = require("./middleware/checkProducts.js");
const categorySchema = require(path.join(__dirname, './models/Category-model.js'));
const productSchema = require(path.join(__dirname, './models/Products-model.js'))
const userSchema = require(path.join(__dirname, './models/user-model.js'));
const sendEmail = require(path.join(__dirname, './JavaScriptServer/sendEmail.js'));
const {updatePasswordInformation} = require("./controllers/updatepassword.js")
const app = express();
const portnum = process.env.portNum || 3000;

mongoose.connect(process.env.MONGODB_CONNECTION);


app.use(bodyparse.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")))
app.use(routes);



app.get("/", (req, res) => {
   res.render("login", { loginDetailsInvalidMessage: "" });
})

app.get("/home", cookieJwtAuth, getCategoriesImages, getproductsInformation, (req, res) => {

   res.render("home", { name: req.user.username, categorySelectionImages: req.catImages, productInformation: req.productinformation });
})

app.post("/home", cookieJwtAuth, getCategoriesImages,getproductsInformation, async (req, res) => {
   const catName = _.startCase(req.body.name);
   var locationName = _.lowerCase(req.body.city);
   if(req.body.city == undefined || req.body.city=="")
   {
      locationName = "clemson"
   }
   
   const catDetails = await categorySchema.find({ categoryName: catName });  
   if(catDetails.length !=0){
      const productInfoByCategory = await productSchema.find({ category:catDetails[0]._id, location:locationName});     
      res.render("home", { name: req.user.username, categorySelectionImages: req.catImages, productInformation: productInfoByCategory });
      
   }
   else{
      const productInfoByCategory = await productSchema.find({location:locationName});
      res.render("home", { name: req.user.username, categorySelectionImages: req.catImages, productInformation: productInfoByCategory });
   }
   
})



app.get("/products/:productDetail",cookieJwtAuth, async (req, res) => {
   const productId = req.params.productDetail;
   const productInformation = await productSchema.findOne({ _id: productId });
   const userInformation = await userSchema.findOne({ _id: productInformation.user });
   let cityLatitude = 0.0;
   let cityLongitude = 0.0;
   //get location coordinates from tomtom api

   const cityCoordinatesUrl = `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(productInformation.location)}.json?key=${process.env.TOMTOM_APIKEY}`;
   https.get(cityCoordinatesUrl, (response) => {
      response.on("data", (data) => {
         const cityData = JSON.parse(data);
         cityLatitude = cityData.results[0].position.lat;
         cityLongitude = cityData.results[0].position.lon;
      
         res.render("productView", { Image: productInformation.imageData, Description: productInformation.Name, latitude: cityLatitude, longitude: cityLongitude, API_KEY: process.env.TOMTOM_APIKEY, productLocation: productInformation.location, productOwnerName: _.startCase(userInformation.name), ProductInformation: productInformation._id, loginUserinformation:req.user.id, productOwnerinformation: userInformation._id});

      })
   })

})

app.post("/products/:productDetail", async(req,res)=>{
   try{
      const message = req.body.userMessage;
      const product = await productSchema.findOne({_id:req.body.productInformation});
      const loginUser = await userSchema.findOne({_id:req.body.loginUserinformation});
      const productOwner = await userSchema.findOne({_id:req.body.productOwnerinformation});  

      sendEmail(message,product,loginUser,productOwner);

      res.redirect(`/products/${req.params.productDetail}`);
   }catch(err){
      console.log(err);
   }
})


app.get("/addproduct",(req,res)=>{
   res.render("addProduct");
})




const storage = multer.diskStorage({
   destination:(req,file,cb)=>{
       cb(null,'ImageUpload');
   },
   filename:(req,file,cb)=>{  
      req.UploadedImageName = file.originalname;  
      cb(null,file.originalname);
   },
})

const upload = multer({storage:storage})

app.post("/addproduct",cookieJwtAuth,upload.single("productPhotos"),addproduct)


app.get("/security",(req, res)=>{
   res.render('updatepassword',{message:""})
})

app.post("/security",cookieJwtAuth, updatePasswordInformation);



app.get("/deleteproduct",cookieJwtAuth, async(req,res)=>{
   const userSpecificProduct = await productSchema.find({user:req.user.id});
   res.render("deleteProduct",{userSpecificProduct:userSpecificProduct})
})

app.post("/deleteproduct",async(req,res)=>{
   const productValue = req.body.productId;
   await productSchema.deleteOne({_id:productValue})
   res.redirect("/deleteproduct");
})



const server = app.listen(portnum, () => {
   console.log(`succefully connected to server and listening through port ${portnum} :)`);
})

