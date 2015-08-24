rekodiApp.controller('rkPicturesCtrl', ['$scope', '$element', 'kodiApiService', 'rkTooltipsService', 'rkEnumsService', 'rkHelperService', 'rkRemoteControlService', '$timeout', 'rkFilesService',
  function($scope, $element, kodiApiService, rkTooltipsService, rkEnumsService, rkHelperService, rkRemoteControlService, $timeout, rkFilesService) {
    var displayLimit = 15;
    var kodiApi = null;
    var filesService = null;
    $scope.files = {};
    $scope.sources = [];
    $scope.filesKey = null;
    $scope.currentLevel = null;
    $scope.scrollItems = [];
    $scope.isFiltering = false;
    $scope.filteredItems = [];
    $scope.filter = {value: ''};
    
    $scope.showItems = function(options) {
      var _scrollItemsCount = 0;
      var _options = angular.extend({}, {
        key: null, //optional
        reset: false, //optional
        data: null //required
      }, options);

      if($scope.isFiltering && !_options.reset) {
        _options.data = $scope.filteredItems;
      }

      if(_options.key !== null) {
        if(!$scope.scrollItems[_options.key] || _options.reset) {
          $scope.scrollItems[_options.key] = [];
        }
        
        _scrollItemsCount = $scope.scrollItems[_options.key].length;
      }
      else {
        if(_options.reset) {
          $scope.scrollItems = [];
        }
        
        _scrollItemsCount = $scope.scrollItems.length;
      }

      if(!_options.data || !_options.data[_scrollItemsCount]) {
        return;
      }
      
      for(var x = 0; x < displayLimit; x++) {
        var nextIndex = ((_scrollItemsCount)+x);

        if(_options.data[nextIndex]) {
          if(_options.key) {
            $scope.scrollItems[_options.key].push(_options.data[nextIndex]);
          }
          else {
            $scope.scrollItems.push(_options.data[nextIndex]);
          }
        }
      }

      if(!$scope.$$phase){
        $scope.$apply();
      }
    };

    $scope.getSources = function() {
      $scope.currentLevel = 'sources';
      $scope.clearFilter();
      
      if($scope.sources.length === 0) {
        $scope.sources = filesService.getSourcesFromCache();
      }
      
      $scope.showItems({
        key: $scope.currentLevel,
        reset: true,
        data: $scope.sources
      });
      
      filesService.getSources(function(sources) {
        if(sources && !angular.equals(sources, $scope.sources)) {
          $scope.sources = sources;
          
          $scope.showItems({
            key: $scope.currentLevel,
            reset: true,
            data: $scope.sources
          });
        }
      });
    };
    
    $scope.getDirectory = function(directory) {
      $scope.currentLevel = 'files';
      $scope.filesKey = encodeURIComponent(directory);
      $scope.clearFilter();
      
      if(!$scope.files[$scope.filesKey]) {
        $scope.files[$scope.filesKey] = [];
      }

      if($scope.files[$scope.filesKey].length === 0) {
        $scope.files[$scope.filesKey] = filesService.getDirectoryFromCache(directory);
      }

      $scope.showItems({
        key: $scope.currentLevel,
        reset: true,
        data: $scope.files[$scope.filesKey]
      });

      filesService.getDirectory(directory, function(files) {
        if(files && !angular.equals(files, $scope.files[$scope.filesKey])) {
          $scope.files[$scope.filesKey] = files;
          
          $scope.showItems({
            key: $scope.currentLevel,
            reset: true,
            data: $scope.files[$scope.filesKey]
          });
        }
      });
    };
    
    $scope.directoryUp = function() {
      var data = filesService.getDirectoryUpData();
      
      if(!data || data.type === 'sources') {
        $scope.getSources();
      }
      else if(data.type === 'directory') {
        $scope.getDirectory(data.directory);
      }
    };

    $scope.show = function(entry) {
      if(kodiApi) {
        var options = {item: {}};
        options.item[entry.filetype] = entry.file;
        
        rkRemoteControlService.play(options);
      }
    };

    $scope.filterList = function(entry) {
      return (entry.label.toLowerCase().indexOf($scope.filter.value.toLowerCase()) > -1 || entry.label === '..');
    };
    
    $scope.clearFilter = function() {
      $scope.filter.value = '';
    };
    
    function initConnectionChange() {
      kodiApi = kodiApiService.getConnection();
      
      if(kodiApi) {
        $scope.getSources();
      }
      else {
        $scope.sources = [];
        $scope.files = {};
        $scope.filesKey = null;
        
        $scope.showItems({
          key: $scope.currentLevel,
          reset: true,
          data: []
        });
      }
    }

    var init = function() {
      filesService = new rkFilesService.instance('pictures');
      initConnectionChange();
      
      $scope.$root.$on('rkWsConnectionStatusChange', function (event, connection) {
        initConnectionChange();
      });
    };
    
    $timeout(function() {
      init();
    });
  }
]);