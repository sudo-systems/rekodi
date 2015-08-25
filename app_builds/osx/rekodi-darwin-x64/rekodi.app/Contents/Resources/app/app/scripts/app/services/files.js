rekodiApp.factory('rkFilesService', ['$rootScope', 'rkCacheService', 'rkHelperService', 'kodiApiService',
  function($rootScope, rkCacheService, rkHelperService, kodiApiService) {
    var instance = function(type) {
      var _currentDirectory = null;
      var _sourcesPaths = [];
      var _kodiApi = null;
      var _cache = null;
      var _fields = {
        video: ['file', 'thumbnail', 'genre', 'plotoutline', 'rating', 'year'],
        audio: ['file']
      };

      this.getSourcesFromCache = function() {
        if(_sourcesPaths.length === 0) {
          _sourcesPaths = _cache.get({key: 'sourcesPaths'});
        }

        return _cache.get({key: 'sources'});
      };

      function updateSourcePaths(sources) {
        _sourcesPaths = [];

        for(var key in sources) {
          _sourcesPaths.push(sources[key].file);
        }

        _cache.update({data: _sourcesPaths, key: 'sourcesPaths'});
      }

      this.getSources = function(callback) {
        _currentDirectory = null;
 
        if(_kodiApi) {
          _kodiApi.Files.GetSources({
            media: type,
            sort: {
              order: 'ascending',
              method: 'label'
            }
          }).then(function(data) {
            data.sources = (!data.sources)? [] : data.sources;

            if(_cache.update({data: data.sources, key: 'sources'})) {
              callback(data.sources);
              updateSourcePaths(data.sources);
            }
            else {
              callback(null);
            }
          }, function(error) {
            callback([]);
            rkHelperService.handleError(error);
          });

          return;
        }

        callback([]);
      };

      this.getDirectoryFromCache = function(directory) {
        var indexKey = encodeURIComponent(directory);
        return _cache.get({key: 'files', index: indexKey});
      };

      this.getDirectory = function(directory, callback) {
        _currentDirectory = directory;
        var indexKey = encodeURIComponent(directory);

        if(_kodiApi) {
          _kodiApi.Files.GetDirectory({
            directory: directory,
            media: type,
            properties: _fields[type],
            sort: {
              order: 'ascending',
              method: 'label'
            }
          }).then(function(data) {
            data.files = (data.files === undefined)? [] : rkHelperService.addCustomFields(data.files);

            if(_cache.update({data: data.files, key: 'files', index: indexKey})) {
              callback(data.files);
            }
            else {
              callback(null);
            }
          }, function(error) {
            callback(null);
            rkHelperService.handleError(error);
          });

          return;
        }

        callback([]);
      };

      this.getDirectoryUpData = function() {
        if(_currentDirectory) {
          var directoryUp = _currentDirectory.split('/').slice(0, -2).join('/')+'/';

          for(var key in _sourcesPaths) {
            if(_sourcesPaths[key].indexOf(directoryUp) > -1 && directoryUp.length < _sourcesPaths[key].length) {
              return {type: 'sources'};
            }
          }

          return {type: 'directory', directory: directoryUp};
        }

        return null;
      };

      function init() {
        _cache = new rkCacheService.create(type+'Files');
        _kodiApi = kodiApiService.getConnection();
        
        $rootScope.$on('rkWsConnectionStatusChange', function (event, connection) {
          _kodiApi = connection;
        });
      };

      init();
    };

    return {
      instance: instance
    };
  }
]);