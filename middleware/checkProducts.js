require("dotenv").config();
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const { default: mongoose} = require("mongoose");
const categorySchema = require(path.join(__dirname, '../models/Category-model.js'));
const productSchema = require(path.join(__dirname,'../models/Products-model.js'))
const ProductsImagesFolder = path.join(__dirname, '../Images/Products');
const userSchema = require(path.join(__dirname, '../models/user-model.js'));
const imageUploadFolder = path.join(__dirname,'../ImageUpload');
const sharp = require('sharp');

    
mongoose.connect(process.env.MONGODB_CONNECTION);
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

const ProductImageUpload = async(categoryName)=>{


    const imageFolder = path.join(ProductsImagesFolder,`/${categoryName}`);
    const ImageFile = fs.readdirSync(imageFolder);

    for(const img of ImageFile)
    {
        const ImageName = img.substring(0,img.length-5);
        const isImageExist = await productSchema.findOne({Name:ImageName});

        if(isImageExist == null)
        {
            const accessImagePath = path.join(imageFolder,img);
            const imageBuffer = fs.readFileSync(accessImagePath);  
            const user = await userSchema.findOne({name:'ShareHub'});
            const catageoryInfo = categorySchema.findOne({categoryName:categoryName}).then((cat)=>{
                const productInfo = new productSchema({
                    Name:ImageName,
                    category:cat._id,
                    location:"clemson",
                    imageData:imageBuffer.toString("base64"),
                    user:user._id
                });

                return productInfo.save();
            })
            
        }
    }
}

 
exports.getproductsInformation = async(req,res,next)=>{

    const prodectDetails = await productSchema.find({});
    req.productinformation = prodectDetails;
    next();

}

exports.addproduct = async (req, res) => {
    const productName = req.body.productName;
    const category = req.body.category;
    const location = req.body.Location;
    const image = req.body.productPhotos;
    var catName = _.startCase(category);
    var locationName = _.toLower(location);
    var prodName = _.startCase(productName);
    const userDetails = await userSchema.findOne({ _id: req.user.id });
    const categoryDetails = await categorySchema.findOne({ categoryName: catName })

    const imageFolder = path.join(imageUploadFolder, req.UploadedImageName);

    try {
        const resizedImage = await resizeImage(imageFolder, 800, 600, 80);

        const productinfo = new productSchema({
            Name: prodName,
            category: categoryDetails._id,
            location: locationName,
            imageData: resizedImage.toString("base64"),
            user: userDetails._id
        });

        await productinfo.save();
        res.redirect("home");
    } catch (err) {
        console.error('Error processing image and adding product:', err);
        res.redirect("/addproduct");
    }
}

// Function to resize and compress image
async function resizeImage(inputPath, maxWidth, maxHeight, quality) {
    try {
        const resizedImageBuffer = await sharp(inputPath)
            .resize({
                width: maxWidth,
                height: maxHeight,
                fit: 'inside', 
                withoutEnlargement: true 
            })
            .jpeg({ quality: quality }) 
            .toBuffer();

        return resizedImageBuffer;
    } catch (err) {
        throw err;
    }
}



mongoose.connection.once('open', () => {   
    async function processCategories() {
        try {
            await ProductImageUpload("Clothing");
            await ProductImageUpload("Electronics");
            await ProductImageUpload("Furniture");
            await ProductImageUpload("Vehicles");
            Console.log("Product data imported successfully :)");
        } catch (error) {
            console.error("Error in script:", error);
        }
    }

    processCategories();
});
