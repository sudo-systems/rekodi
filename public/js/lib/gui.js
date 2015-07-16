var Gui = function(app) {
  var remote = require('remote');
  var mainWindow = remote.getCurrentWindow();
  
  this.setPlaybackControls = function(state) {
    if(state === app.enums.api.PLAYING) {
      app.dom.elements.playButton.hide();
      app.dom.elements.pauseButton.css('display', 'inline-block');
      app.dom.elements.stopButton.css('display', 'inline-block');
    }
    else if(state === app.enums.api.PAUSED) {
      app.dom.elements.playButton.css('display', 'inline-block');
      app.dom.elements.pauseButton.hide();
      app.dom.elements.stopButton.css('display', 'inline-block');
    }
    else if(state === app.enums.api.STOPPED) {
      app.dom.elements.playButton.css('display', 'inline-block');
      app.dom.elements.pauseButton.hide();
      app.dom.elements.stopButton.hide();
    }
  };
  
  this.showNoConnectionOverlay = function(show) {
    if(show) {
      app.dom.elements.noConnectionOverlay.fadeIn(250);
    }
    else {
      app.dom.elements.noConnectionOverlay.fadeOut(250);
    }
  };

  this.setConnected = function(connected, message) {
    if(message) {
      new Notification(message);
    }
    
    if(connected) {
      app.dom.elements.heartbeatIcon.removeClass('offline').addClass('online');
      this.showNoConnectionOverlay(false);
    }
    else {
      app.dom.elements.heartbeatIcon.removeClass('online').addClass('offline');
      this.showNoConnectionOverlay(true);
    }
  };
  
  this.initTooltips = function() {
    $('[title]').jBox('Tooltip',  {
      animation: 'move'
    });
  };

  this.initWindowControls = function() {
    $('#player #topBar .windowControls .button.close').on('click', function() {
      mainWindow.close();
    });

    $('#player #topBar .windowControls .button.minimize').on('click', function() {
      mainWindow.minimize();
    });
  };
};

module.exports = Gui;