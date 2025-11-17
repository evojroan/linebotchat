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

  try {
    if (!req.body || !req.body.events || req.body.events.length === 0) {
      console.log("Empty events array");
      return res.status(200).send("OK");
    }

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
        "Content-Length": Buffer.byteLength(dataString),
      };

      const webhookOptions = {
        hostname: "api.line.me",
        path: "/v2/bot/message/reply",
        method: "POST",
        headers: headers,
      };

      const request = https.request(webhookOptions, (apiRes) => {
        let data = "";
        apiRes.on("data", (chunk) => {
          data += chunk;
        });
        apiRes.on("end", () => {
          console.log("LINE API response:", data);
          // 在收到 LINE API 回應後才回傳
          if (!res.headersSent) {
            res.status(200).send("OK");
          }
        });
      });

      request.on("error", (err) => {
        console.error("Request error:", err);
        // 發生錯誤時才回傳
        if (!res.headersSent) {
          res.status(200).send("OK");
        }
      });

      request.write(dataString);
      request.end();

      // 不要在這裡回傳回應
    } else {
      res.status(200).send("OK");
    }
  } catch (error) {
    console.error("Error:", error);
    if (!res.headersSent) {
      return res.status(200).send("OK");
    }
  }
}

module.exports = handleWebhook;