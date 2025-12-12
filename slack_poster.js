/*
 * Copyright 2018 eBay Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */
const configReader = require("./slack_config_reader.js")
const yellow = "#DDA511";
const red = "#DD2222";
const green = "#22DD22";

const slackPoster = function() {
  var self = {};

  self.postDiffs = function(version, user, diffs) {
    const config = configReader.readConfig();
    const attachments = diffs.map((diff) => { return createSlackAttachment(diff, version, user) });
    const userName = user.name ? user.name : user.email;
    const postPayload = {
      text: `*<${config.siteDisplayName}>* updated by ${userName}, has ${diffs.length} changes` + (diffs.length > 1 ? "s" : ""),
      attachments: attachments
    };

    sendToSlack(config, postPayload)
  }

  async function sendToSlack(config, payload) {
    // console.log(payload)
    // return;
    try {
      const formData = new URLSearchParams();
      formData.append('payload', JSON.stringify(payload));

      const response = await fetch(config.slackWebHookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
      });

      if (!response.ok) {
        console.log("Error posting to slack, response code " + response.status);
      }
    } catch (error) {
      console.log("Error posting to slack: " + error);
    }
  }

  function createSlackAttachment(diff, version, user) {
    var name;
    var payload;
    if (diff.payload instanceof Array && diff.payload.length > 1) {
      name = diff.payload[0].name;
      diff.payload.forEach(x => delete x["name"])
      payload = "*from*\n" + JSON.stringify(diff.payload[0], null, "\t") + "\n*to*\n" +JSON.stringify(diff.payload[1], null, "\t")
    } else {
      name = diff.payload.name;
      delete diff.payload["name"];
      payload = JSON.stringify(diff.payload, null, "\t")
    }
    var color = yellow;
    if (diff.type.indexOf("Deleted") >= 0) {
      color = red;
    } else if (diff.type.indexOf("Added") >= 0) {
      color = green;
    }
    var attachment = {
      fallback: diff.type,
      color: color,
      pretext: "*" + diff.type + ": " + name + "*",
      footer: `version ${version}`,
      fields: [
        {
          "value": payload
        }
      ]
    };

    if (user) {
      if (user.name) {
        attachment.author_name = user.name;
      } else if (user.email) {
        attachment.author_name = user.email;
      }
      if (user.email) {
        attachment.author_link = `mailto:${user.email}`;
      }
      if (user.imageUrl) {
        attachment.author_icon = user.imageUrl;
      }
    } else {
      attachment.author_name = 'unknown';
    }

    return attachment;
  }

  return self;
}();

module.exports = slackPoster;
