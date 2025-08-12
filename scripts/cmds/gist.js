const fsp = require('fs').promises;
const axios = require('axios');

const ArYAN = "https://nix-gist.vercel.app";

module.exports.config = {
  name: "gist",
  version: "0.0.1",
  role: 2,
  author: "ArYAN",
  usePrefix: true,
  description: "Upload code to GitHub Gist",
  category: "convert",
  guide: { en: "[fileName] OR [reply with file name]" },
  countDown: 1
};

module.exports.onStart = async function ({ api, event, args }) {
  const ownerIDs = ["61568791604271"];  // send your admin UID
  if (!ownerIDs.includes(event.senderID)) {
    return api.sendMessage("❌ | Only bot's admin can use the command", event.threadID, event.messageID);
  }

  const fileName = args[0];
  if (!fileName) {
    return api.sendMessage("[⚜️]➜ | Missing file name.", event.threadID, event.messageID);
  }

  let codeContent = '';
  try {
    if (event.type === "message_reply" && event.messageReply?.body) {
      codeContent = event.messageReply.body;
    } else {
      const filePath = `scripts/cmds/${fileName}.js`;
      console.log("Looking for file at:", filePath);
      codeContent = await fsp.readFile(filePath, 'utf8');
    }
  } catch (err) {
    console.error("Read file error:", err);
    return api.sendMessage("[⚜️]➜ | File not found or cannot be read.", event.threadID, event.messageID);
  }

  try {
    const payload = {
      code: encodeURIComponent(codeContent),
      nam: `${fileName}.js`
    };
    const { data } = await axios.post(`${ArYAN}/gist`, payload);
    api.sendMessage(data.data || "[⚜️]➜ API error.", event.threadID, event.messageID);
  } catch (err) {
    console.error("Gist API error:", err);
    api.sendMessage("[⚜️]➜ | Failed to upload to gist.", event.threadID, event.messageID);
  }
};
