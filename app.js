require("dotenv").config();
const https = require("https");
const TOKEN = process.env.LINE_ACCESS_TOKEN;

function handleWebhook(req, res) {
  if (req.method === "GET" && req.url === "/") {
    return res.status(200).send("OK");
  }

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  // 加入錯誤處理
  try {
    // 檢查請求體
    if (!req.body || !req.body.events || req.body.events.length === 0) {
      console.log("Empty events array");
      return res.status(200).send("No events to process");
    }

    // LINE Webhook 驗證請求
    if (req.body.events[0].replyToken === "00000000000000000000000000000000") {
      console.log("Verification request");
      return res.status(200).send("OK");
    }

    if (req.body.events[0].type === "message") {
      const dataString = JSON.stringify({
        replyToken: req.body.events[0].replyToken,
        messages: [
          {
            type: "text",
            text: "Hello, user",
          },
          {
            type: "text",
            text: "May I help you?",
          },
        ],
      });

      const headers = {
        "Content-Type": "application/json",
        Authorization: "Bearer " + TOKEN,
      };

      const webhookOptions = {
        hostname: "api.line.me",
        path: "/v2/bot/message/reply",
        method: "POST",
        headers: headers,
        body: dataString,
      };

      const request = https.request(webhookOptions, (apiRes) => {
        apiRes.on("data", (d) => {
          process.stdout.write(d);
        });
      });

      request.on("error", (err) => {
        console.error(err);
        res.status(500).send("Error");
      });

      request.write(dataString);
      request.end();

      res.send("HTTP POST request sent to the webhook URL!");
    } else {
      res.sendStatus(200);
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(200).send("OK"); // 即使錯誤也回傳 200 給 LINE
  }
}

module.exports = handleWebhook;