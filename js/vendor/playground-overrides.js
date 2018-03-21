PLAYGROUND.Transitions = function(app) {

  this.app = app;

  app.on("enterstate", this.enterstate.bind(this));
  app.on("afterpostrender", this.postrender.bind(this));
  app.on("step", this.step.bind(this));

  this.progress = 1;
  this.lifetime = 0;

  app.transition = app.transition ? app.transition : 'explode';
  app.transitionDuration = app.transitionDuration ?
    app.transitionDuration : 0.5;

};

PLAYGROUND.Transitions.plugin = true;

PLAYGROUND.Transitions.prototype = {

  enterstate: function(data) {

    this.app.screenshot = this.screenshot = this.app.layer.cache();

    if (data.prev) {

      this.lifetime = 0;
      this.progress = 0;

    }

  },

  postrender: function() {

    if (this.progress >= 1) return;

    var transition = PLAYGROUND.Transitions[this.app.transition];

    transition(this.app, this.progress, this.screenshot);

  },

  step: function(delta) {

    if (this.progress >= 1) return;

    this.lifetime += delta;

    this.progress = Math.min(this.lifetime / this.app.transitionDuration, 1);

  }

};

PLAYGROUND.Transitions.implode = function(app, progress, screenshot) {

  progress = app.ease(progress, "outCubic");

  var negative = 1 - progress;

  app.layer.save();
  app.layer.tars(app.center.x, app.center.y, 0.5, 0.5, 0, 0.5 + 0.5 * negative, negative);
  app.layer.drawImage(screenshot, 0, 0);

  app.layer.restore();

};

PLAYGROUND.Transitions.explode = function(app, progress, screenshot) {

  var layer = app.layer;

  progress = app.ease(progress, 'inOutExpo');

  var scale = 1 + progress * 2;

  layer.save();
  layer.a(1-progress);
  layer.tars(app.center.x, app.center.y, 0.5, 0.5, 0, scale, scale);
  layer.drawImage(screenshot, 0, 0);
  layer.restore();

};

PLAYGROUND.Transitions.split = function(app, progress, screenshot) {

  progress = app.ease(progress, "inOutCubic");

    var negative = 1 - progress;

    app.layer.save();

    //app.layer.a(negative).clear("#fff").ra();

    app.layer.drawImage(screenshot, 0, 0, app.width, app.height / 2 | 0, 0, 0, app.width, negative * app.height / 2 | 0);
    app.layer.drawImage(screenshot, 0, app.height / 2 | 0, app.width, app.height / 2 | 0, 0, app.height / 2 + progress * app.height / 2 + 1 | 0, app.width, Math.max(1, negative * app.height * 0.5 | 0));

    app.layer.restore();

};

PLAYGROUND.Transitions.custom = function(app, progress, screenshot) {

  progress = app.ease(progress, "inOutExpo");

    var negative = 1 - progress;

    app.layer.save();

    //app.layer.a(negative).clear("#fff").ra();

    app.layer.drawImage(screenshot, 0, 0, app.width, app.height / 2 | 0, 0, 0, app.width, negative * app.height / 2 | 0);
    app.layer.drawImage(screenshot, 0, app.height / 2 | 0, app.width, app.height / 2 | 0, 0, app.height / 2 + progress * app.height / 2 + 1 | 0, app.width, Math.max(1, negative * app.height * 0.5 | 0));

    app.layer.restore();

};

/* file: src/layer/LoadingScreen.js */

/** Basic loading screen using cnavas
 *
 * In playground.js build this file will be appended after
 * `src/LoadingScreen.js` and, thus, will override it.
 */

PLAYGROUND.LoadingScreen = {

  logoRaw: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANoAAAASBAMAAADPiN0xAAAAGFBMVEUAAQAtLixHSUdnaGaJioimqKXMzsv7/fr5shgVAAAAAWJLR0QAiAUdSAAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB98EAwkeA4oQWJ4AAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAAB9klEQVQ4y72UvW+rMBDAz+FrpVKrrFmesmapWNOlrKjSe1kZ+uoVAvj+/frujG1SaJcqJwU7voOf7xMQzQmsIDi5NPTMsLRntH3U+F6SAZo3NlCvcgBFJz8o+vkDiE63lI95Y/UmpinsZWkgJWJiDbAVQ16htptxSTNloIlugwaw001Ey3ASF3so6L1qLNXzQS5S0UGKL/CI5wWNriE0UH9Yty37LqIVg+wsqu7Ix0MwVBSF/dU+jv2SNnma021LEdPqVnMeU3xAu0kXcSGjmq7Ox4E2Wn88LZ2+EFj3avjixzai6VPVyuYveZLHF2XfdDnvAq27DIHGuq+0DJFsE30OtB1KqOwd8Dr7PcM4b+jfj2g5lp4WyntBK66qua3JzEA+uXJpwH/NlVuzRVPY/kTLB2mjuN+KwdZ8FOy8j2gDbEUSqumnSCY4lf4ibq3IhVM4ycZQRnv+zFqVdJQVn6BxvUqebGpuaNo3sZxwBzjajiMZOoBiwyVF+kCr+nUaJOaGpnAeRPPJZTr4FqmHRXcneEo4DqQ/ftfdnLeDrUAME8xWKPeKCwW6YkEpXfs3p1EWJhdcUAYP0TI/uYaV8cgjwBovaeyWwji2T9rTFIdS/cP/MnkTLRUWxgNNZVin7bT5fqT9miDcUVJzR1gRpfIONMmulU+5Qqr6zXAUqAAAAABJRU5ErkJggg==",

  create: function() {

    var self = this;

    this.logo = new Image;

    this.logo.addEventListener("load", function() {
      self.ready = true;
    });

    this.logo.src = this.logoRaw;


    if (window.getComputedStyle) {
      // this.background = window.getComputedStyle(document.body).backgroundColor || "#000";
    }


  },

  enter: function() {

    this.current = 0;

  },

  leave: function() {

    this.locked = true;

    this.animation = this.app.tween(this)
      .to({
        current: 1
      }, 0.5);

  },

  step: function(delta) {

    if (this.locked) {
      if (this.animation.finished) this.locked = false;
    } else {
      this.current = this.current + Math.abs(this.app.loader.progress - this.current) * delta;
    }

  },

  ready: function() {


  },

  render: function() {

    if (!this.ready) return;

    this.app.layer.clear(this.app.background);

    this.app.layer.fillStyle("#fff");

    this.app.layer.save();
    this.app.layer.align(0.5, 0.5);
    //this.app.layer.globalCompositeOperation("lighter");
    //this.app.layer.drawImage(this.logo, this.app.center.x, this.app.center.y);

    var w = this.current * this.app.width;

    
    this.app.layer.fillStyle("#333");
    this.app.layer.fillRect(this.app.center.x, this.app.center.y, this.app.width, 4);
    this.app.layer.fillStyle("#fff");
    this.app.layer.fillRect(this.app.center.x, this.app.center.y, w, 4);

    this.app.layer.restore();

  }

};