// const nodemailer = require("nodemailer")

// const sendEmail = async (option) => {
//   console.log("optionss===========================", option)
  
//   // transporter
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASSWORD
//     }
//   })

//   const emailOptions = {
//     from: 'Blogger Support<support@blogger.com>',
//     to: option.email,
//     subject: option.subject,
//     text: option.message,
//   }
//  await transporter.sendMail(emailOptions)
// }



// module.exports = sendEmail;
const nodemailer = require("nodemailer")
const sendEmail = async (option) => {
  
  // transporter
 
  const transporter = nodemailer.createTransport({
  //    host: "smtp.forwardemail.net",
  //   port: 465,
  //  secure: true,
  // auth: {
  //   user: "d6b9c4da47650b",
  //   pass: "f5ae58713320ed"
  // } 
       host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "d6b9c4da47650b",
    pass: "f5ae58713320ed"
  }
    // host: process.env.EMAIL_HOST,
    // port: process.env.EMAIL_PORT,
    // secure: true,
    // auth: {
    //   user: process.env.EMAIL_USER,
    //   pass: process.env.EMAIL_PASSWORD
    // }
  })

  const emailOptions = {
    from: 'Blogger Support<support@blogger.com>',
    to: option.email,
    subject: option.subject,
    text: option.message,
  }
 await transporter.sendMail(emailOptions)
}



module.exports = sendEmail;