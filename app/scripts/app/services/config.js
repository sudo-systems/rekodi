rekodiApp.factory('rkConfigService', [
  function() {
    var homedir = require('homedir');
    var fs = require('fs');
    var mkpath = require('mkpath');
    
    var storageRootPath = '';
    var config = {};
    config.application = require('../app.json');
    storageRootPath = homedir()+'/.'+config.application.name.toLowerCase()+'/';
    
    config.directories = {
      application: __dirname,
      storageRoot: storageRootPath,
      logs: storageRootPath+'logs/',
      cache: storageRootPath+'cache/',
      temp: storageRootPath+'tmp/'
    };
    
    config.files = {
      errorLog: config.directories.logs+'error.log',
      debugLog: config.directories.logs+'debug.log'
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
        audio: ['title', 'displayartist', 'album', 'track', 'year', 'genre', 'thumbnail', 'file', 'duration', 'fanart'],
        video: ['title', 'file', 'thumbnail', 'plotoutline', 'year', 'season', 'episode', 'showtitle', 'plot', 'runtime', 'fanart']
      }
    };

    var get = function(category, key) {
      if(category && key) {
        return config[category][key];
      }
      else if(category) {
        return config[category]
      }
      
      return config;
    };
    
    function init() {
      for(var key in config.directories) {
        if(!fs.existsSync(config.directories[key])) {
          mkpath.sync(config.directories[key]);
        }
      }
    }
    
    init();

    return {
      get: get
    };
  }
]);