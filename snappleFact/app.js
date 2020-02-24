// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
let response;
const fetch = require("node-fetch");

const SLACK_RESPONSE_URL_KEY = "response_url";
const FACT_API = {
  BASE_URL: "https://uselessfacts.jsph.pl",
  ENDPOINTS: {
    RANDOM: "random.json?language=en"
  }
};

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */

const getRandomFact = async () => {
  const factUrl = `${FACT_API.BASE_URL}/${FACT_API.ENDPOINTS.RANDOM}`;
    return await fetch(factUrl).then(apiResponse => {
      return apiResponse.json().then(json => {
        return json.text;
      });          
    });
};

const sendFactViaSlack = (fact, slack_url) => {
  fetch(
    slack_url,
    {
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify({
        response_type: "in_channel",
        text: fact
      })
    }
  );
};

exports.randomFact = async (event, context, callback) => {
    try {
      const urlParams = new URLSearchParams(event.body);

      if (!urlParams.has("response_url")) {
        throw new Error("No response_url")
      }

      const slackResponseUrl = urlParams.get(SLACK_RESPONSE_URL_KEY);
      
      //acknowledgeRequest(slackResponseUrl);

      let randomFact = await getRandomFact();
      sendFactViaSlack(randomFact, slackResponseUrl);

      response = {
        "statusCode": 200,
        "headers": null,
        "body": null,
        "isBase64Encoded": false
      }
    } catch (err) {
        console.log(err);
        response = {
          "statusCode": 500,
          "body": {
            "error": err
          }
        };
    }

    callback(null, response);
};
