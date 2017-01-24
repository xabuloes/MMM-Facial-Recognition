'use strict';
const NodeHelper = require('node_helper');

const PythonShell = require('python-shell');
var pythonStarted = false

module.exports = NodeHelper.create({

  pyshell: null,

  python_start: function () {
    const self = this;

    this.pyshell = new PythonShell('modules/' + this.name + '/facerecognition/facerecognition.py', { mode: 'json', args: [JSON.stringify(this.config)]})

    this.pyshell.on('message', function (message) {
      
      if(message.hasOwnProperty('status')){
        console.log("[" + self.name + "] " + message.status);
      }
      if (message.hasOwnProperty('login')){
        console.log("[" + self.name + "] " + "User " + self.config.users[message.login.user - 1] + " with confidence " + message.login.confidence + " logged in.");
        self.sendSocketNotification('user', {action: "login", user: message.login.user - 1, confidence: message.login.confidence});
        }
      if (message.hasOwnProperty('logout')){
        console.log("[" + self.name + "] " + "User " + self.config.users[message.logout.user - 1] + " logged out.");
        self.sendSocketNotification('user', {action: "logout", user: message.logout.user - 1});
        }
    });

/*
    this.pyshell.end(function (err) {
      if (err) throw err;
      console.log("[" + self.name + "] " + 'finished running...');
    }); */
  },
  
  // Subclass socketNotificationReceived received.
  socketNotificationReceived: function(notification, payload) {

    if(notification === 'CONFIG') {
      this.config = payload
      console.error("[MMM-FACIAL-RECOGNITION] socketNotificationReceived")
      if(!pythonStarted) {
        pythonStarted = true;
        this.python_start();
        };
    };


    if(!this.pyshell) {
        console.error("PYTHON SHELL NOT DEFINED YET");
    }

    if(payload.action === 'login'){
        console.log("["+ this.name + " in node_helper] login action received")
        this.pyshell.send({command: 'continue', args: []});
    };
    if(payload.action === 'logout'){
        console.log("["+ this.name + " in node_helper] logout action received")
        this.pyshell.send({command: 'suspend', args: []});
    };
  }
});