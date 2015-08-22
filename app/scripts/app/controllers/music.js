rekodiApp.controller('rkMusicCtrl', ['$scope', '$element', 'kodiApiService', 'rkTooltipsService', '$attrs', 'rkCacheService', 'rkHelperService', '$timeout',
  function($scope, $element, kodiApiService, rkTooltipsService, $attrs, rkCacheService, rkHelperService, $timeout) {
    $scope.identifier = $attrs.id;
    $scope.selectedIndex = null;
    $scope.currentLevel = null;
    $scope.currentArtistId = null;
    $scope.currentAlbumId = null;
    $scope.artists = [];
    $scope.artistsCategorised = {};
    $scope.artistsIndex = [];
    $scope.scrollItems = [];
    $scope.displayLimit = 15;
    $scope.isFiltering = false;
    var _cache = null;
    $scope.albums = {};
    $scope.songs = {};
    var kodiApi = null;
    $scope.filter = {
      value: ''
    };
    
    $scope.showItems = function(selectedIndex, reset) {
      if(selectedIndex) {
        $scope.selectedIndex = selectedIndex;
      }
      
      if(reset || !$scope.scrollItems[$scope.currentLevel]) {
        $scope.scrollItems[$scope.currentLevel] = [];
      }

      var items = [];
      
      if($scope.currentLevel === 'artists') {
        items = $scope.artistsCategorised[$scope.selectedIndex];
      }
      else if($scope.currentLevel === 'albums') {
        items = $scope.albums[$scope.currentArtistId];
      }
      else if($scope.currentLevel === 'songs') {
        items = $scope.songs[$scope.currentAlbumId];
      }
      
      var scrollItemsCount = $scope.scrollItems[$scope.currentLevel].length;
      
      if(!items || !items[scrollItemsCount]) {
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
    
    function getArtistsFromCache() {
      if(Object.keys($scope.artistsCategorised).length === 0) {
        $scope.artistsCategorised = _cache.get({key: 'artistsCategorised'});
      }

      if($scope.artistsIndex.length === 0) {
        $scope.artistsIndex = _cache.get({key: 'artistsIndex'});
      }

      if($scope.artistsIndex.length > 0) {
        selectDefaultArtistsIndex();
      }
    }

    function createArtistsCategorised(artists) {
      $scope.artistsCategorised = {};
      
      for(var key in artists) {
        var firstLetter = artists[key].label.charAt(0).toUpperCase();

        if($scope.artistsCategorised[firstLetter] === undefined) {
          $scope.artistsCategorised[firstLetter] = [];
        }

        $scope.artistsCategorised[firstLetter].push(artists[key]);
      }
      
      _cache.set({
        data: $scope.artistsCategorised,
        key: 'artistsCategorised'
      });
      
      createArtistsCategorisedIndex();
    }
    
    function createArtistsCategorisedIndex() {
      $scope.artistsIndex = [];

      for (var key in $scope.artistsCategorised) {
        if ($scope.artistsCategorised.hasOwnProperty(key)) {
          $scope.artistsIndex.push(key);
        }
      }
      
      _cache.set({
        data: $scope.artistsIndex,
        key: 'artistsIndex'
      });
      
      selectDefaultArtistsIndex();
    }

    function selectDefaultArtistsIndex() {
      for(var key in $scope.artistsIndex) {
        if($scope.artistsIndex[key].toLowerCase() !== $scope.artistsIndex[key].toUpperCase()) {
          $scope.showItems($scope.artistsIndex[key], true);
          break;
        }
      }
    }

    $scope.getArtists = function() {
      $scope.currentLevel = 'artists';
      $scope.displayLimit = 15;
      $scope.clearFilter();

      if(kodiApi) {
        $scope.$root.$emit('rkStartLoading');
        getArtistsFromCache();
        
        kodiApi.AudioLibrary.GetArtists({
          albumartistsonly: false,
          sort: {
            order: 'ascending',
            method: 'label'
          }
        }).then(function(data) {
          data.artists = (data.artists === undefined)? [] : data.artists;
          var properties = {
            data: data.artists,
            key: 'artists'
          };

          if(_cache.update(properties)) {
            createArtistsCategorised(data.artists);
          }
          else {
            getArtistsFromCache();
          }

          $scope.$root.$emit('rkStopLoading');
          rkTooltipsService.apply($($element).find('.data-list-wrapper'));
        }, function(error) {
          rkHelperService.handleError(error);
          $scope.$root.$emit('rkStopLoading');
        });
      }
    };

    function getAlbumsFromCache(artistId) {
      if(!$scope.albums[artistId]) {
        $scope.albums[artistId] = _cache.get({
          key: 'albums',
          index: artistId
        });
      }
      
      $scope.showItems(null, true);
    }

    $scope.getAlbums = function(artist) {
      $scope.currentLevel = 'albums';
      $scope.currentArtistId = artist.artistid;
      $scope.displayLimit = 5;
      $scope.clearFilter();

      if(kodiApi) {
        $scope.$root.$emit('rkStartLoading');
        getAlbumsFromCache(artist.artistid);
        
        kodiApi.AudioLibrary.GetAlbums({
          properties: ['thumbnail', 'year', 'genre', 'displayartist'],
          filter: {
            artistid: artist.artistid
          },
          sort: {
            order: 'descending',
            method: 'year'
          }
        }).then(function(data) {
          data.albums = (data.albums === undefined)? [] : rkHelperService.addCustomFields(data.albums);
          var properties = {
            data: data.albums,
            key: 'albums',
            index: artist.artistid
          };
          
          if(_cache.update(properties)) {
            $scope.albums[artist.artistid] = data.albums;
            $scope.showItems(null, true);
          }
          else {
            getAlbumsFromCache(artist.artistid);
          }

          $scope.$root.$emit('rkStopLoading');
          rkTooltipsService.apply($($element).find('.data-list-wrapper'));
        }, function(error) {
          rkHelperService.handleError(error);
          $scope.$root.$emit('rkStopLoading');
        });
      }
    };

    function getSongsFromCache(albumId) {
      if(!$scope.songs[albumId]) {
        $scope.songs[albumId] = _cache.get({
          key: 'songs',
          index: albumId
        });
      }
      
      $scope.showItems(null, true);
    }

    $scope.getSongs = function(album) {
      $scope.currentLevel = 'songs';
      $scope.currentAlbumId = album.albumid;
      $scope.displayLimit = 5;
      $scope.clearFilter();
      
      if(kodiApi) {
        $scope.$root.$emit('rkStartLoading');
        getSongsFromCache(album.albumid);
        
        kodiApi.AudioLibrary.GetSongs({
          properties: ['thumbnail', 'year', 'genre', 'displayartist', 'track', 'album', 'duration'],
          filter: {
            albumid: $scope.currentAlbumId
          },
          sort: {
            order: 'ascending',
            method: 'track'
          }
        }).then(function(data) {
          data.songs = (data.songs === undefined)? [] : rkHelperService.addCustomFields(data.songs);
          var properties = {
            data: data.songs,
            key: 'songs',
            index: album.albumid
          };
          
          if(_cache.update(properties)) {
            $scope.songs[album.albumid] = data.songs;
            $scope.showItems(null, true);
          }
          else {
            getSongsFromCache(album.albumid);
          }

          $scope.$root.$emit('rkStopLoading');
          rkTooltipsService.apply($($element).find('.data-list-wrapper'));
        }, function(error) {
          rkHelperService.handleError(error);
          $scope.$root.$emit('rkStopLoading');
        });
      }
    };
    
    $scope.playSong = function(song) {
      if(song.back === true) {
        $scope.getAlbums(song);
      }
    };
    
    $scope.applyFilter = function(filterValue) {
      if(filterValue.length < 2) {
        $scope.isFiltering = false;
        $scope.showItems(null, true);
        return;
      }

      $scope.isFiltering = true;
      $scope.scrollItems[$scope.currentLevel] = [];
      var items = [];
      
      if($scope.currentLevel === 'artists') {
        items = _cache.get({key: 'artists'});
      }
      else if($scope.currentLevel === 'albums') {
        items = $scope.albums[$scope.currentArtistId];
      }
      else if($scope.currentLevel === 'songs') {
        items = $scope.songs[$scope.currentAlbumId];
      }
      
      for(var key in items) {
        if(items[key].label && items[key].label.toLowerCase().indexOf(filterValue.toLowerCase()) !== -1) {
          $scope.scrollItems[$scope.currentLevel].push(items[key]);
        }
      }
    };
    
    $scope.clearFilter = function() {
      $scope.isFiltering = false;
      $scope.filter.value = '';
      $scope.showItems(null, true);
    };

    function initConnectionChange() {
      kodiApi = kodiApiService.getConnection();

      if(kodiApi && $.isEmptyObject($scope.artists)) {
        $scope.getArtists();
      }
    }

    var init = function() {
      _cache = rkCacheService.create($scope.identifier);
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