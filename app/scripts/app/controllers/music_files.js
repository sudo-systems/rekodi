rekodiApp.controller('rkMusicFilesCtrl', ['$scope', '$element', 'kodiApiService', 'rkTooltipsService', 'rkEnumsService', 'rkHelperService', 'rkRemoteControlService', '$timeout', 'rkFilesService',
  function($scope, $element, kodiApiService, rkTooltipsService, rkEnumsService, rkHelperService, rkRemoteControlService, $timeout, rkFilesService) {
    $scope.files = {};
    $scope.sources = [];
    $scope.filesKey = null;
    $scope.currentLevel = null;
    $scope.scrollItems = [];
    $scope.displayLimit = 15;
    var kodiApi = null;
    $scope.filter = {value: ''};
    
    function getItems() {
      if($scope.currentLevel === 'sources') {
        return $scope.sources;
      }
      else if($scope.currentLevel === 'files') {
        return ($scope.files[$scope.filesKey])? $scope.files[$scope.filesKey] : [];
      }
      
      return [];
    }

    $scope.showItems = function(reset) {
      if(reset || !$scope.scrollItems[$scope.currentLevel]) {
        $scope.scrollItems[$scope.currentLevel] = [];
      }

      var scrollItemsCount = $scope.scrollItems[$scope.currentLevel].length;
      var items = getItems();
      
      if(!items[scrollItemsCount]) {
        return;
      }

      for(var x = 0; x < $scope.displayLimit; x++) {
        var nextIndex = ((scrollItemsCount)+x);

        if(items[nextIndex]) {
          $scope.scrollItems[$scope.currentLevel].push(items[nextIndex]);
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
        $scope.sources = rkFilesService.getSourcesFromCache();
      }
      
      $scope.showItems(true);
      
      rkFilesService.getSources(function(sources) {
        if(sources && !angular.equals(sources, $scope.sources)) {
          $scope.sources = sources;
          $scope.showItems(true);
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
        $scope.files[$scope.filesKey] = rkFilesService.getDirectoryFromCache(directory);
      }

      $scope.showItems(true);

      rkFilesService.getDirectory(directory, function(files) {
        if(files && !angular.equals(files, $scope.files[$scope.filesKey])) {
          $scope.files[$scope.filesKey] = files;
          $scope.showItems(true);
        }
      });
    };
    
    $scope.directoryUp = function() {
      var data = rkFilesService.getDirectoryUpData();
      
      if(!data || data.type === 'sources') {
        $scope.getSources();
      }
      else if(data.type === 'directory') {
        $scope.getDirectory(data.directory);
      }
    };

    $scope.play = function(entry) {
      if(kodiApi) {
        var options = {item: {}};
        options.item[entry.filetype] = entry.file;
        
        rkRemoteControlService.play(options);
      }
    };
    
    $scope.addToPlaylist = function(entry) {
      if(kodiApi) {
        var playlistId = ($scope.type === 'music')? rkEnumsService.PlaylistId.AUDIO : rkEnumsService.PlaylistId.VIDEO;

        kodiApi.Playlist.GetItems({
          playlistid: playlistId
        }).then(function(data) {
          var options = {
            playlistid: playlistId,
            position: (data.items)? data.items.length : 0,
            item: {}
          };

          options.item[entry.filetype] = entry.file;
          
          kodiApi.Playlist.Insert(options).then(function(data) {
            if(data === 'OK') {
              
            }
          }, function(error) {
            rkHelperService.handleError(error);
          });
        }, function(error) {
          rkHelperService.handleError(error);
        });
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
        $scope.showItems(true);
      }
    }

    var init = function() {
      rkFilesService.setType('music');
      rkFilesService.setIdentifier('musicFiles');
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