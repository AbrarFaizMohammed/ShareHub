require("dotenv").config();
const fs = require('fs');
const path = require('path');
const { default: mongoose } = require("mongoose");
const bcrypt = require('bcrypt');
const { Console } = require("console");
const categorySchema = require(path.join(__dirname, '../models/Category-model.js'));
const userSchema = require(path.join(__dirname, '../models/user-model.js'));
const categoryImagesFolder = path.join(__dirname, '../Images/Category');

mongoose.connect(process.env.MONGODB_CONNECTION);

const categoryImagesUpload = async () => {
  try {
    const imageFiles = fs.readdirSync(categoryImagesFolder);

    for (const img of imageFiles) {
      const imgName = img.substring(0, img.length - 4);
      const isImageExist = await categorySchema.findOne({ categoryName: imgName });
        if(isImageExist==null)
        {
            const accessImagePath = path.join(categoryImagesFolder,img);
            const imageBuffer = fs.readFileSync(accessImagePath);            
            const catageoryInfo = new categorySchema({
                categoryName:imgName,
                imageData:imageBuffer.toString('base64')
            });

            await catageoryInfo.save();
        }
    }
    Console.log("Category data imported successfully :)");

  } catch (err) {
    console.error(err);
  }
};


const confirmpassword = process.env.ADMIN_USERKEY;
const saltRounds =10;
const addAdminUser=async()=>{
bcrypt.hash(confirmpassword, saltRounds, async function (err, hash) {
    if (err) {
        console.log(err);
    }
    else {
        try {
          const user = await userSchema.findOne({name:'ShareHub'});
          if(!user)
          {
            
            const adminUser = new userSchema({
              name:'ShareHub',
              email:'sharehub0219@gmail.com',
              password:hash
          });

          await adminUser.save();
          }

        } catch (err) {
            console.log(err)
        }
    }
});
};
categoryImagesUpload(); addAdminUser();


exports.getCategoriesImages = async (req,res,next)=>{
    const categoriesImages = await categorySchema.find({});
         req.catImages = categoriesImages;
         next();
}

