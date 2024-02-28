const nodemailer = require("nodemailer");

const sendEmail = (message, product, loginUser, productOwner) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'sharehub0219@gmail.com',
            pass: 'fajx ozjt lfcs jeab'
        }
    });

    const mailOptions = {
        from: "sharehub0219@gmail.com",
        to: productOwner.email,
        subject: `ShareHub: Someone is intreasted in your product.`,
        Text: 'Hello Abrar!! I hope you are doing well. Happy learning MERN stack.',
        html: `<p>Hello ${productOwner.name}. ${loginUser.name} is intreasted in your product.</p><br/><p>${loginUser.name}'s Message:${message}<br/>contact Details:${loginUser.email}</p>`
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Email sent:', info.response);
    })
}

module.exports = sendEmail;
