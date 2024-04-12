const { SESClient, ListIdentitiesCommand } = require('@aws-sdk/client-ses');

async function listEmailIdentities() {
  try {
    const client = new SESClient({
      region: process.env.REGION,
      credentials: {
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
      },
    });

    const listIdentitiesCommand = new ListIdentitiesCommand({
      IdentityType: 'EmailAddress',
    });

    const data = await client.send(listIdentitiesCommand);
    return data.Identities;
  } catch (err) {
    console.error('Error listing email identities:', err);
    throw err; // Re-throw the error for handling in the calling code
  }
}

module.exports = listEmailIdentities;
