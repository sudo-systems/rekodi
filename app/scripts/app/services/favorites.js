rekodiApp.factory('rkFavoritesService', ['rkConfigService', 'rkLogService',
  function(rkConfigService, rkLogService) {
    var fs = require('fs');
    var favoritesFile = rkConfigService.get('files', 'favorites');
    var favorites = {
      files: {
        audio: [],
        video: [],
        pictures: []
      },
      music: {
        artists: [],
        albums: [],
        songs: []
      },
      movies: [],
      tvShows: {
        shows: [],
        episodes: []
      }
    };
    
    var get = function(mainCategory, subCategory) {
      if(subCategory) {
        return (favorites[mainCategory][subCategory])? favorites[mainCategory][subCategory] : null;
      }
      
      return favorites[mainCategory];
    };

    var save = function(options) {
      if(options.subCategory === null || options.subCategory === undefined || !favorites[options.mainCategory][options.subCategory]) {
        favorites[options.mainCategory].push({
          name: options.name,
          items: []
        });
        
        options.subCategory = (favorites[options.mainCategory].length -1);
      }

      angular.forEach(options.items, function(value, key) {
        favorites[options.mainCategory][options.subCategory].items.push(value.file);
      });
      
      store(favorites);   
      
      return {
        subCategory: options.subCategory,
        name: options.name
      };
    };
    
    var remove = function(mainCategory, subCategory) {
      if(favorites[mainCategory][subCategory]) {
        favorites[mainCategory].splice(subCategory, 1);
        return favorites[mainCategory];
      }
      
      return null;
    };

    var exists = function(mainCategory, name) {
      angular.forEach(favorites[mainCategory], function(value, key) {
        if($.trim(name) === $.trim(value.name)) {
          return key;
        }
      });
      
      return null;
    };

    function store(data) {
      fs.writeFile(favoritesFile, JSON.stringify(data), function(error) {
        if(error) {
          rkLogService.error(error);
        }
      }); 
    }

    function init() {
      if(!fs.existsSync(favoritesFile)) {
        store(favorites);
        return;
      }
      
      favorites = require(favoritesFile);
    }
    
    init();
    
    return {
      get: get,
      save: save,
      remove: remove,
      exists: exists
    };
  }
]);