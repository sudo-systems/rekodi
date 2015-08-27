rekodiApp.factory('rkConfigService', [
  function() {
    var homedir = require('homedir');
    var fs = require('fs');
    var mkpath = require('mkpath');

    var config = {
      application: require('../app.json'),
      directories: {
        application: __dirname,
        views: './views/'
      }
    };
    
    config.directories.dialogTemplates = config.directories.views+'partials/dialogs/';
    var storageRootPath = homedir()+'/.'+config.application.name.toLowerCase()+'/';

    config.storageDirectories = {
      root: storageRootPath,
      logs: storageRootPath+'logs/',
      cache: storageRootPath+'cache/',
      temp: storageRootPath+'tmp/'
    };
    
    config.storageDirectories.cacheData = config.storageDirectories.cache+'data/';
    config.storageDirectories.cacheImages = config.storageDirectories.cache+'images/';
    config.storageDirectories.cacheThumbnails = config.storageDirectories.cacheImages+'thumbnails/';
    config.storageDirectories.cacheFanart = config.storageDirectories.cacheImages+'fanart/';

    config.files = {
      errorLog: config.storageDirectories.logs+'error.log',
      debugLog: config.storageDirectories.logs+'debug.log'
    };

    config.apiRequestProperties = {
      videoLibrary: {
        movies: ['thumbnail', 'year', 'rating', 'plotoutline', 'genre', 'runtime', 'resume', 'lastplayed', 'file'],
        tvShows: ['thumbnail', 'watchedepisodes', 'episode', 'premiered', 'rating', 'plot', 'genre', 'file'],
        seasons: ['thumbnail', 'showtitle', 'season', 'watchedepisodes', 'episode'],
        episodes: ['thumbnail', 'showtitle', 'plot', 'rating', 'season', 'episode', 'firstaired', 'runtime', 'streamdetails', 'lastplayed', 'resume']
      },
      audioLibrary: {
        artists: [],
        albums: ['thumbnail', 'year', 'genre', 'displayartist'],
        songs: ['thumbnail', 'year', 'genre', 'displayartist', 'track', 'album', 'duration']
      },
      files: {
        video: ['file', 'thumbnail', 'genre', 'plotoutline', 'rating', 'year'],
        audio: ['file']
      },
      playlist: {
        audio: ['file'],
        video: ['file']
      },
      kodi: {
        volume: 0,
        muted: false, 
        name: 'Kodi', 
        version: ''
      },
      player: {
        audiostreams: [],
        canchangespeed: false,
        canmove: false,
        canrepeat: false,
        canrotate: false,
        canseek: false,
        canshuffle: false,
        canzoom: false,
        currentaudiostream: {},
        currentsubtitle: {},
        live: false,
        partymode: false,
        percentage: 0,
        playlistid: -1,
        position: 0,
        repeat: 'off',
        shuffled: false,
        speed: 0,
        subtitleenabled: false,
        subtitles: [],
        time: {},
        totaltime: {},
        type: null
      },
      nowPlaying: {
        audio: ['title', 'displayartist', 'album', 'track', 'year', 'genre', 'thumbnail', 'file', 'duration', 'fanart', 'artistid', 'albumid', 'streamdetails'],
        video: ['title', 'file', 'thumbnail', 'plotoutline', 'year', 'season', 'episode', 'showtitle', 'plot', 'runtime', 'fanart','streamdetails']
      }
    };
    
    config.templates = {
      dialog: {
        movieOptions: config.directories.dialogTemplates+'movie_options.html',
        episodeOptions: config.directories.dialogTemplates+'episode_options.html',
        albumOptions: config.directories.dialogTemplates+'album_options.html',
        artistOptions: config.directories.dialogTemplates+'artist_options.html',
        songOptions: config.directories.dialogTemplates+'song_options.html',
        pictureOptions: config.directories.dialogTemplates+'picture_options.html'
      }
    };

    var get = function(category, key) {
      if(category && key) {
        return config[category][key];
      }
      else if(category) {
        return config[category];
      }
      
      return config;
    };
    
    function init() {
      for(var key in config.storageDirectories) {
        if(!fs.existsSync(config.storageDirectories[key])) {
          mkpath.sync(config.storageDirectories[key]);
        }
      }
    }
    
    init();

    return {
      get: get
    };
  }
]);