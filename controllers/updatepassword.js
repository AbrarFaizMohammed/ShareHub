const bcrypt = require('bcrypt');
const { has } = require('lodash');
const path = require("path");
const userSchema = require(path.join(__dirname, '../models/user-model.js'));

const saltRounds = 10;

exports.updatePasswordInformation = async (req, res) => {
    const newpassword = req.body.newpassword;
    const confirmpassword = req.body.confirmpassword;

    if (confirmpassword != newpassword) {
        res.render("updatepassword", { message: "password not matching 😟" })
    }
    else {
        bcrypt.hash(confirmpassword, saltRounds, async function (err, hash) {
            if (err) {
                console.log(err);
            }
            else {
                try {
                    const userName = req.user;
                    //  await userSchema.findOneAndUpdate({id:userName.id,password:hash});
                    var user = await userSchema.findById(req.user.id)
                    user.password = hash;
                    await user.save();
                    res.cookie('token', " ", { maxAge: 1 });
                    res.redirect("/");

                } catch (err) {
                    console.log(err)
                }
            }
        });
    }
}

