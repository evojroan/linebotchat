require("dotenv").config();
const https = require("https");
const TOKEN = process.env.LINE_ACCESS_TOKEN;

module.exports = async (req, res) => {
  // 處理 GET 請求（用於驗證）
  if (req.method === "GET") {
    return res.status(200).send("OK");
  }

  if (req.method !== "POST") {
    return res.status(200).send("OK");
  }

  try {
    console.log("收到請求，body:", JSON.stringify(req.body));

    // 檢查請求體
    if (!req.body || !req.body.events || req.body.events.length === 0) {
      console.log("空的 events 陣列");
      return res.status(200).send("OK");
    }

    const event = req.body.events[0];

    // LINE Webhook 驗證請求
    if (event.replyToken === "00000000000000000000000000000000") {
      console.log("驗證請求");
      return res.status(200).send("OK");
    }

    if (event.type === "message") {
      const dataString = JSON.stringify({
        replyToken: event.replyToken,
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
      };

      await new Promise((resolve, reject) => {
        const request = https.request(webhookOptions, (apiRes) => {
          let data = "";
          apiRes.on("data", (chunk) => {
            data += chunk;
          });
          apiRes.on("end", () => {
            console.log("LINE API 回應:", data);
            resolve();
          });
        });

        request.on("error", (err) => {
          console.error("請求錯誤:", err);
          reject(err);
        });

        request.write(dataString);
        request.end();
      });
    }

    return res.status(200).send("OK");
  } catch (error) {
    console.error("錯誤:", error);
    return res.status(200).send("OK");
  }
};
