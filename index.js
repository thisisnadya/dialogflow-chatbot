const express = require("express");
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const textGeneration = async (prompt) => {
  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `Human: ${prompt}\nAI: `,
      temperature: 0.9,
      max_tokens: 500,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0.6,
      stop: ["Human:", "AI:"],
    });
    return {
      status: 1,
      response: `${response.data.choices[0].text}`,
    };
  } catch (error) {
    return {
      status: 0,
      response: "",
    };
  }
};

// const projectId = "firestore-386309";

// const { TranslationServiceClient } = require("@google-cloud/translate");

// const { GoogleAuth } = require("google-auth-library");

// const translationClient = new TranslationServiceClient();

// async function translateText(queryText) {
//   try {
//     // Construct request
//     const request = {
//       parent: `projects/${projectId}`,
//       contents: [queryText],
//       mimeType: "text/plain", // mime types: text/plain, text/html
//       sourceLanguageCode: "en",
//       targetLanguageCode: "sr-Latn",
//     };

//     // Authenticate using the service account key
//     const auth = new GoogleAuth({
//       keyFile: "./key.json",
//       scopes: ["https://www.googleapis.com/auth/cloud-platform"],
//     });
//     const authClient = await auth.getClient();
//     const headers = await authClient.getRequestHeaders();
//     const accessToken = headers.Authorization.split(" ")[1];

//     // Set the access token in the request headers
//     request.options = {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//       },
//     };

//     // Run request
//     const [response] = await translationClient.translateText(request);

//     for (const translation of response.translations) {
//       console.log(`Translation: ${translation.translatedText}`);
//     }
//     return {
//       status: 1,
//       response: response,
//     };
//   } catch (error) {
//     console.error("Translation error:", error);
//     return {
//       status: 0,
//       response: "",
//     };
//   }
// }

const webApp = express();

const PORT = process.env.PORT;

webApp.use(express.urlencoded({ extended: true }));
webApp.use(express.json());
webApp.use((req, res, next) => {
  console.log(`Path ${req.path} with Method ${req.method}`);
  next();
});

webApp.get("/", (req, res) => {
  res.sendStatus(200);
});

webApp.post("/dialogflow", async (req, res) => {
  let action = req.body.queryResult.action;
  let queryText = req.body.queryResult.queryText;

  if (action === "input.unknown") {
    // console.log(req.body);
    let result = await textGeneration(queryText);
    // console.log(result);
    if (result.status == 1) {
      res.send({
        fulfillmentText: result.response,
      });
    } else {
      res.send({
        fulfillmentText: `Sorry, I'm not able to help with that.`,
      });
    }
  } else {
    res.send({
      fulfillmentText: `No handler for the action ${action}.`,
    });
  }
});

webApp.listen(PORT, () => {
  console.log(`Server is up and running at ${PORT}`);
});
