var Language = function(app) {
  this.strings = [];
  
  /* ENGLISH */
  this.strings['en'] = {};
  this.strings['en'].eventClient = {
    CONNECTION_ERROR: 'Could not connect to KODI Event Sever. Please check your sttings.'
  };
  
  this.get = function(key) {
    return this.strings[app.config.app.language][key];
  };
};

module.exports = Language;