/*==============================================================================

Core

==============================================================================*/

let baseWidth = 2560;
let baseHeight = 1440;
let baseRatio = baseWidth / baseHeight;
let widthToFill = Math.min(
  window.innerWidth * window.devicePixelRatio,
  baseWidth
);
// let widthToFill = Math.min(window.innerWidth, baseWidth);
let divisor = baseWidth / widthToFill;
let width = baseWidth / divisor;
let height = width / baseRatio;
let unit = width / 32;

$.game = playground({
  background: "#000",
  width: width,
  height: height,
  smoothing: true,
  paths: {
    fonts: "fonts/",
  },
});

$.game.divisor = divisor;

$.game.create = function () {
  $.ctx = this.layer;
  $.html = document.querySelector("html");
  $.body = document.querySelector("body");

  this.isChrome = window.chrome;
  this.isDebug = parseInt($.get("debug"), 10) === 1;
  this.isSelect = parseInt($.get("select"), 10) === 1;
  this.forceLevel = parseInt($.get("level"), 10);
  this.forceTrack = parseInt($.get("track"), 10);

  if (this.isDebug) {
    $.html.classList.add("debug");
  }

  if (this.isSelect) {
    $.html.classList.add("select");
  }

  $.game.isTouchDevice = $.isTouchDevice();
  $.game.controlString = $.game.isTouchDevice ? "TAP" : "SPACE / CLICK";

  this.unit = unit;
  this.lastRunTime = null;
  this.lastRunDeaths = null;

  // delta time
  this.dt = 0.016;
  this.dtMs = 16;
  this.dtNorm = 1;

  // time
  this.time = {};
  this.time.fpsTarget = 240;
  this.time.fpsInterval = 1000 / this.time.fpsTarget;
  this.time.then = Date.now();
  this.time.now = this.time.then;
  this.time.elapsed = 0;
  this.time.shouldStep = false;
  this.time.shouldRender = false;

  // fonts
  this.loadFonts("lato-medium-webfont");

  // images
  this.loadImages(
    "icon-home",
    "icon-pause",
    "icon-play",
    "icon-sound-off",
    "icon-sound-on",
    "title",
    "title-glow"
  );

  // sounds
  this.loadSounds(
    "music-1",
    "jump-land",
    "jump",
    "track-change",
    "level-change",
    "explosion-1",
    "explosion-2",
    "explosion-3",
    "scrape",
    "start-game",
    "win-game",
    "end-game",
    "logo-1"
  );

  this.loadData(
    "level1",
    "level2",
    "level3",
    "level4",
    "level5",
    "level6",
    "level7",
    "level8",
    "level9"
  );

  // overlay
  this.overlayTimer = {
    current: 0,
    target: 1,
    index: 0,
    max: 5,
  };

  // hero gradient
  this.heroGradientSize = this.unit;
  this.heroGradientCanvas = document.createElement("canvas");
  this.heroGradientCtx = this.heroGradientCanvas.getContext("2d");
  this.heroGradientCanvas.width = this.heroGradientSize;
  this.heroGradientCanvas.height = this.heroGradientSize;
  this.heroGradientGradient = this.heroGradientCtx.createRadialGradient(
    this.heroGradientSize / 2,
    this.heroGradientSize / 2,
    0,
    this.heroGradientSize / 2,
    this.heroGradientSize / 2,
    this.heroGradientSize / 2
  );
  this.heroGradientGradient.addColorStop(0, "hsla(0, 0%, 100%, 0.3)");
  this.heroGradientGradient.addColorStop(1, "hsla(0, 0%, 100%, 0)");
  this.heroGradientCtx.fillStyle = this.heroGradientGradient;
  this.heroGradientCtx.fillRect(
    0,
    0,
    this.heroGradientCanvas.width,
    this.heroGradientCanvas.height
  );

  // block gradient
  this.blockGradientCanvas = document.createElement("canvas");
  this.blockGradientCtx = this.blockGradientCanvas.getContext("2d");
  this.blockGradientCanvas.width = this.unit;
  this.blockGradientCanvas.height = this.unit;
  this.blockGradient = this.blockGradientCtx.createLinearGradient(
    this.unit,
    0,
    0,
    this.unit
  );
  this.blockGradient.addColorStop(0, "hsla(0, 0%, 0%, 0.3)");
  this.blockGradient.addColorStop(1, "hsla(0, 0%, 0%, 0.9)");
  this.blockGradientCtx.fillStyle = this.blockGradient;
  this.blockGradientCtx.fillRect(
    0,
    0,
    this.blockGradientCanvas.width,
    this.blockGradientCanvas.height
  );

  // track padding for screen shake
  this.trackPadding = 100 / $.game.divisor;

  // track gradient
  this.trackGradientCanvas = document.createElement("canvas");
  this.trackGradientCtx = this.trackGradientCanvas.getContext("2d");
  this.trackGradientCanvas.width = $.game.width / 10;
  this.trackGradientCanvas.height = $.game.height / 3 / 10;
  this.trackGradient = this.trackGradientCtx.createLinearGradient(
    0,
    0,
    0,
    this.trackGradientCanvas.height
  );
  this.trackGradient.addColorStop(0, "hsla(0, 0%, 0%, 0.4)");
  this.trackGradient.addColorStop(1, "hsla(0, 0%, 0%, 0)");
  this.trackGradientCtx.fillStyle = this.trackGradient;
  this.trackGradientCtx.fillRect(
    0,
    0,
    this.trackGradientCanvas.width,
    this.trackGradientCanvas.height
  );

  // storage
  $.storage = new $.storage("mono-move");

  if ($.isObjEmpty($.storage.obj)) {
    $.storage.set("mute", 0);
    $.storage.set("playCount", 0);
    $.storage.set("deathCount", 0);
    $.storage.set("deathBest", 99999);
  }

  this.musicVol = 0.5;

  if ($.storage.get("mute")) {
    this.sound.setMaster(0);
    this.music.setMaster(0);
  } else {
    this.sound.setMaster(1);
    this.music.setMaster(this.musicVol);
  }
};

$.game.ready = function () {
  this.music.play("music-1", true);

  this.levels = [
    {
      map: this.data["level1"],
      vx: 10,
    },
    {
      map: this.data["level2"],
      vx: 11,
    },
    {
      map: this.data["level3"],
      vx: 12,
    },
    {
      map: this.data["level4"],
      vx: 13,
    },
    {
      map: this.data["level5"],
      vx: 14,
    },
    {
      map: this.data["level6"],
      vx: 15,
    },
    {
      map: this.data["level7"],
      vx: 16,
    },
    {
      map: this.data["level8"],
      vx: 17,
    },
    {
      map: this.data["level9"],
      vx: 18,
    },
  ];

  for (var i = 0; i < this.levels.length; i++) {
    var hue = (i / this.levels.length) * (360 - 1 / this.levels.length);
    this.levels[i].hue1 = hue;
    this.levels[i].hue2 = hue - 75;
    this.levels[i].color1 = `hsl(${this.levels[i].hue1}, 75%, 50%)`;
    this.levels[i].color2 = `hsl(${this.levels[i].hue2}, 75%, 50%)`;
    // this.levels[i].gradient = $.ctx.createLinearGradient(
    //   $.game.width,
    //   0,
    //   0,
    //   $.game.height
    // );
    // this.levels[i].gradient.addColorStop(0, this.levels[i].color1);
    // this.levels[i].gradient.addColorStop(1, this.levels[i].color2);

    let levelGradientCanvas = document.createElement("canvas");
    let levelGradientCtx = levelGradientCanvas.getContext("2d", {
      alpha: false,
    });
    levelGradientCanvas.width = $.game.width;
    levelGradientCanvas.height = $.game.height;
    let levelGradient = levelGradientCtx.createLinearGradient(
      levelGradientCanvas.width,
      0,
      0,
      levelGradientCanvas.height
    );
    levelGradient.addColorStop(0, this.levels[i].color1);
    levelGradient.addColorStop(1, this.levels[i].color2);
    levelGradientCtx.fillStyle = levelGradient;
    levelGradientCtx.fillRect(
      0,
      0,
      levelGradientCanvas.width,
      levelGradientCanvas.height
    );
    this.levels[i].levelGradientCanvas = levelGradientCanvas;
  }

  this.keyTriggers = [
    "w",
    "a",
    "s",
    "d",
    "up",
    "left",
    "down",
    "right",
    "space",
  ];

  this.scrapeSound = this.playSound("scrape", true);
  this.sound.setVolume(this.scrapeSound, 0);
  this.sound.setPlaybackRate(this.scrapeSound, 1.5);

  this.setState($.stateMenu);
};

$.game.step = function (dt) {
  this.manageTime(dt);
};

$.game.blur = function () {
  $.game.sound.setMaster(0);
  $.game.music.setMaster(0);
  if (!$.statePlay.paused) {
    $.statePlay.pause();
  }
};

$.game.focus = function () {
  var muted = $.storage.get("mute");
  if (!muted) {
    $.game.sound.setMaster(1);
    $.game.music.setMaster(this.musicVol);
  }
  $.game.resizelistener();
};

$.game.visibilitychange = function () {
  // console.log("visibilitychange", document.hidden);
};

$.game.keydown = function (e) {
  if (e.key == "m") {
    this.mute();
  }
};

/*==============================================================================

Custom

==============================================================================*/

$.game.mute = function () {
  var muted = $.storage.get("mute");
  if (muted) {
    $.storage.set("mute", 0);
    this.sound.setMaster(1);
    this.music.setMaster(this.musicVol);
  } else {
    $.storage.set("mute", 1);
    this.sound.setMaster(0);
    this.music.setMaster(0);
  }
};

$.game.manageTime = function (dt) {
  this.dt = dt;
  this.dtMs = this.dt * 1000;
  this.dtNorm = this.dt * 60;

  // this.time.now = Date.now();
  // this.time.elapsed = this.time.now - this.time.then;
  this.time.shouldStep = true;
  this.time.shouldRender = true;

  // if (this.time.elapsed > this.time.fpsInterval) {
  //   this.time.then =
  //     this.time.now - (this.time.elapsed % this.time.fpsInterval);

  //   this.time.shouldRender = true;
  // }
};
