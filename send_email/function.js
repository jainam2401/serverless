const functions = require("@google-cloud/functions-framework");
const { v4: uuidv4 } = require("uuid");
const mailgun = require("mailgun-js");

const { testAndSync } = require("./db");
const Email = require("./Email.model");

(async () => {
  try {
    await testAndSync();
  } catch (error) {
    console.log(`Error: ${error}`);
  }
})();

const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});

// const mg = mailgun({
//   apiKey: "4ee0de3a0524cfd26f0f118b5db16972-309b0ef4-fcf017fe",
//   domain: "jainammehta.website",
// });

const sendEmail = async (firstName, lastName, email, uuid) => {
  const text = `
    Hey ${firstName} ${lastName},
    This is your verification link https://jainammehta.website/v1/users/verification?token=${uuid}
  `;

  const data = {
    from: "Jainam Mehta <no-reply@jainammehta.website>",
    to: email,
    subject: `Verification needed for ${firstName} ${lastName}`,
    text: text,
  };

  try {
    const body = await mg.messages().send(data);
    console.log("Email sent:", body);
  } catch (error) {
    throw new Error(error);
  }
};

functions.cloudEvent(process.env.PUB_SUB_NAME, async (cloudEvent) => {
  try {
    const message = cloudEvent.data.message.data;
    const decodedJsonString = Buffer.from(message, "base64").toString("utf8");
    const { firstName, lastName, email } = JSON.parse(decodedJsonString);
    const myUUID = uuidv4();
    await sendEmail(firstName, lastName, email, myUUID);
    const now = new Date();
    const expiryTime = new Date(now.getTime() + 2 * 60000);
    await Email.create({
      token: myUUID,
      expiry: expiryTime,
      email: email,
    });
    console.log("Valued Entered Successfully");
  } catch (error) {
    console.log("Error ", error);
  }
});
