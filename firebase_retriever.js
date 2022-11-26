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
const fs = require('fs');
const admin = require('firebase-admin');
const dataPath = "./data/";

const serviceAccount = require("./configs/fb_service_account.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

const firebaseRetriever = function() {
  var self = {};

  self.retrieveData = async function() {
      return await getTemplate();
  };

  self.retrieveDataByVersion = async function(version) {
    return await getTemplateByVersion(version);
  };

  function getTemplate() {
    const config = admin.remoteConfig();
    return new Promise((resolve, reject) => {
        config.getTemplate()
        .then(template => {
          console.log('ETag from server: ' + template.etag);
          const templateStr = JSON.stringify(template);
          fs.writeFileSync(dataPath + template.version.versionNumber + '_config.json', templateStr);
          resolve(template);
        })
        .catch(err => {
          console.error('Unable to get template');
          console.error(err);
          reject(err);
        });
    });
  }

  function getTemplateByVersion(version) {
    const config = admin.remoteConfig();
    return new Promise((resolve, reject) => {
        config.getTemplateAtVersion(version)
        .then(template => {
          console.log('ETag from server: ' + template.etag);
          const templateStr = JSON.stringify(template);
          fs.writeFileSync(dataPath + template.version.versionNumber + '_config.json', templateStr);
          resolve(template);
        })
        .catch(err => {
          console.error('Unable to get template');
          console.error(err);
          reject(err);
        });
    });
  }

  return self;
}();

module.exports = firebaseRetriever;
