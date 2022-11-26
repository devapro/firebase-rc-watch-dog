const fs = require('fs');

const lastVersionHolder = function() {
    var self = {};

    const path = './data/appDb.json'

    self.get = function() {
        if (fs.existsSync(path)) {
            const rawdata = fs.readFileSync(path);
            const dbJson = JSON.parse(rawdata);
            return dbJson.lastVersion;
        } else {
            self.save(0);
            return 0;
        }
    }
  
    self.save = function(version) {
      const dbStr = JSON.stringify({
        lastVersion: version
      });
      fs.writeFileSync(path, dbStr);
    }
  
    return self;
  }();
  
module.exports = lastVersionHolder;