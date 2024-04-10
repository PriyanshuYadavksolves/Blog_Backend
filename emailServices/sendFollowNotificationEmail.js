const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

async function sendFollowNotificationEmail(recipientEmail, followerName, followingName) {
  const sesClient = new SESClient({
    region: process.env.REGION, // Replace with your desired region
    credentials: {
      accessKeyId: process.env.ACCESS_KEY,
      secretAccessKey: process.env.SECRET_ACCESS_KEY
    }
  });

  const sendEmailParams = {
    Destination: {
      ToAddresses: [recipientEmail]
    },
    Message: {
      Body: {
        Text: {
          Charset: "UTF-8",
          Data: `Hello ${followingName},

A new user, ${followerName}, has started following you!

Thanks,
The Team`
        }
      },
      Subject: {
        Charset: "UTF-8",
        Data: "You have a new follower!"
      }
    },
    Source: process.env.SENDER_EMAIL // Replace with your verified sender email
  };

  try {
    await sesClient.send(new SendEmailCommand(sendEmailParams));
    console.log("Email notification sent successfully.");
  } catch (emailError) {
    console.error("Email notification failed:", emailError);
    throw new Error("Failed to send email notification"); // Re-throw for caller handling
  }
}

module.exports = sendFollowNotificationEmail;
