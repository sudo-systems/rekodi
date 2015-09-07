rekodiApp.factory('rkFilesService', ['$rootScope', 'rkCacheService', 'rkHelperService', 'kodiApiService', 'rkLogService', 'rkConfigService',
  function($rootScope, rkCacheService, rkHelperService, kodiApiService, rkLogService, rkConfigService) {
    var instance = function(type) {
      var currentDirectory = null;
      var sourcesPaths = [];
      var kodiApi = null;
      var cache = null;
      var requestProperties = rkConfigService.get('apiRequestProperties', 'files');

      this.getSourcesFromCache = function() {
        if(sourcesPaths.length === 0) {
          sourcesPaths = cache.get({key: 'sourcesPaths'});
        }

        return cache.get({key: 'sources'});
      };

      function updateSourcePaths(sources) {
        sourcesPaths = [];

        for(var key in sources) {
          sourcesPaths.push(sources[key].file);
        }

        cache.update({data: sourcesPaths, key: 'sourcesPaths'});
      }

      this.getSources = function(callback) {
        currentDirectory = null;
 
        if(kodiApi) {
          kodiApi.Files.GetSources({
            media: type,
            sort: {
              order: 'ascending',
              method: 'label'
            }
          }).then(function(data) {
            data.sources = (!data.sources)? [] : data.sources;

            if(cache.update({data: data.sources, key: 'sources'})) {
              callback(data.sources);
              updateSourcePaths(data.sources);
            }
            else {
              callback(null);
            }
          }, function(error) {
            callback([]);
            rkLogService.error(error);
          });

          return;
        }

        callback([]);
      };

      this.getDirectoryFromCache = function(directory) {
        var indexKey = encodeURIComponent(directory);
        return cache.get({key: 'files', index: indexKey});
      };

      this.getDirectory = function(directory, callback) {
        currentDirectory = directory;
        var indexKey = encodeURIComponent(directory);

        if(kodiApi) {
          kodiApi.Files.GetDirectory({
            directory: directory,
            media: type,
            properties: requestProperties[type],
            sort: {
              order: 'ascending',
              method: 'label'
            }
          }).then(function(data) {
            data.files = (data.files === undefined)? [] : rkHelperService.addCustomFields(data.files);

            if(cache.update({data: data.files, key: 'files', index: indexKey})) {
              callback(data.files);
            }
            else {
              callback(null);
            }
          }, function(error) {
            callback(null);
            rkLogService.error(error);
          });

          return;
        }

        callback([]);
      };

      this.getDirectoryUpData = function() {
        if(currentDirectory) {
          var directoryUp = currentDirectory.split('/').slice(0, -2).join('/')+'/';

          for(var key in sourcesPaths) {
            if(sourcesPaths[key].indexOf(directoryUp) > -1 && directoryUp.length < sourcesPaths[key].length) {
              return {type: 'sources'};
            }
          }

          return {type: 'directory', directory: directoryUp};
        }

        return null;
      };

      function init() {
        cache = new rkCacheService.create(type+'Files');

        $rootScope.$on('rkWsConnectionStatusChange', function (event, connection) {
          kodiApi = connection;
        });
      };

      init();
    };

    return {
      instance: instance
    };
  }
]);