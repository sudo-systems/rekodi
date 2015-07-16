var Gui = function(app) {
  var remote = require('remote');
  var mainWindow = remote.getCurrentWindow();
  var volumeSlider = null;
  
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
  
  this.loadPartials = function() {
    $('#player [data-partial]').each(function() {
      var loThis = $(this);
      var templatePartial = 'partials/'+$(this).attr('data-partial')+'.html';

      $.ajax({
        url: templatePartial,
        success: function(data) {
          loThis.html(data);
        },
        error: function(error) {
          console.error(error);
        }
      });
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
  
  this.initVisualElements = function() {
    volumeSlider = new Dragdealer('volumeSlider');
    
    var magicLine = $('#player nav .magic-line');
    magicLine.css('left', $('#player nav li.active').position().left).data('origLeft', magicLine.position().left).data('origWidth', magicLine.width());

    $('#tabsWrapper nav li').on('click', function(e) {
      e.preventDefault();

      $('#tabsWrapper nav li').removeClass('active');
      $(this).addClass('active');

      var index = $(this).index();
      $('#tabsWrapper .tabs').attr('data-tab', index);

      var leftPos = $(this).position().left;
      var newWidth = $(this).width();

      magicLine.stop().animate({
        left: leftPos,
        width: newWidth
      }, 500);
    });
  };
};

module.exports = Gui;