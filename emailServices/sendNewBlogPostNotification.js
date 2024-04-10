const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const emailTemplate = require('./emailTemp')

async function sendNewBlogPostNotification(blogTitle,blogId, followerEmails,coverImg,userPic,userName) {
  const emailContent = emailTemplate({ coverImg, blogTitle, userPic, userName,blogId });

    const sesClient = new SESClient({
      region: process.env.REGION, // Replace with your desired region
      credentials: {
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_ACCESS_KEY
      }
    });
  
    const sendEmailParams = {
      Destination: {
        ToAddresses: followerEmails // Use the array of follower emails
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: emailContent
          }
        },
        Subject: {
          Charset: "UTF-8",
          Data: `New blog post: ${blogTitle}`
        }
      },
      Source: process.env.SENDER_EMAIL // Replace with your verified sender email
    };
  
    try {
      await sesClient.send(new SendEmailCommand(sendEmailParams));
      console.log(`Email notification sent to all followers.`);
    } catch (emailError) {
      console.error("Error sending email notification:", emailError);
      // Handle email sending error (optional)
    }
  }

  module.exports = sendNewBlogPostNotification