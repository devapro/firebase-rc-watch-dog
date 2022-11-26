const fs = require('fs');
const CronJob = require('cron').CronJob;

const firebaseRetriever = require('./firebase_retriever.js');
const slackPoster = require('./slack_poster.js');
const firebaseDiff = require('./rc_config_diff.js');
const lastVersionHolder = require('./last_version_saver.js');


async function runInternal() {
    try {
        const newConfig = await firebaseRetriever.retrieveData();
        const newVersion = newConfig.version.versionNumber;
        let preVersion = lastVersionHolder.get();
        if(preVersion == 0) {
            preVersion = newVersion - 1;
        }
        if(preVersion < newVersion) {
            lastVersionHolder.save(newVersion);
            const path = "./data/" + preVersion + "_config.json";
            if (!fs.existsSync(path)) {
                console.log("Load previous config\n");
                await firebaseRetriever.retrieveDataByVersion(preVersion)
            }
            if (fs.existsSync(path)) {
                const rawdata = fs.readFileSync(path);
                const oldConfig = JSON.parse(rawdata);
                const diffResults = firebaseDiff.findDifferences(oldConfig, newConfig);
                slackPoster.postDiffs(newConfig.version.versionNumber, newConfig.version.updateUser, diffResults);
            } else {
                console.log("Error previous config not found\n");
            }
        } else {
            console.log("No changes found\n");
        }
  } catch (e) {
      console.log("error encountered:\n" + e);
  }
}

/**
  * * * * * * 
  | | | | | |
  | | | | | day of week
  | | | | month
  | | | day of month
  | | hour
  | minute
  second ( optional )
 */

const job = new CronJob(
	'0 * * * * *',
	function() {
		runInternal();
	},
	null,
	false,
	'America/Los_Angeles'
);

job.start();