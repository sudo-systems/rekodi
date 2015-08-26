rekodiApp.factory('rkCacheService', ['rkConfigService',
  function(rkConfigService) {
    var create = function(identifier) {
      var fs = require('fs');
      var config = rkConfigService.get();
      var cacheFile = config.directories.cache+identifier+'.json';
      var cacheData = {};

      function writeData(data) {
        var fileStream = fs.createWriteStream(cacheFile, {flags: 'w'});
        fileStream.write(JSON.stringify(data));
      }

      function formatKey(properties) {
        return (properties.index === undefined)? properties.key : properties.key+'_'+properties.index;
      }

      this.set = function(properties) {
        /*
         * properties = {
         *  data: Object/Array, (required)
         *  key: String/Int, (required)
         *  index: String/Int (optional)
         * };
         */

        var key = formatKey(properties);
        cacheData[key] = properties.data;
        writeData(cacheData);
      };

      this.get = function(properties) {
        /*
         * properties = {
         *  key: String/Int, (required)
         *  index: String/Int (optional)
         * };
         */

        var key = formatKey(properties);
        return (cacheData[key])? cacheData[key] : [];
      };

      this.update = function(properties) {
        /*
         * properties = {
         *  data: Object/Array, (required)
         *  key: String/Int, (required)
         *  index: String/Int (optional)
         * };
         */

        var key = formatKey(properties);

        if(!cacheData[key] || !angular.equals(cacheData[key], properties.data)) {
          this.set(properties);
          return true;
        }

        return false;
      };
    };
    

    return {
      create: create
    };
  }
]);