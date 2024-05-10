$.stateMenu = {};

$.stateMenu.create = function () {
  this.tracks = [
    {
      top: 0,
      bot: $.game.height / 3,
    },
    {
      top: $.game.height / 3,
      bot: $.game.height / 3 + $.game.height / 3,
    },
    {
      top: $.game.height / 3 + $.game.height / 3,
      bot: $.game.height,
    },
  ];
};

$.stateMenu.enter = function () {
  var sound = $.game.playSound("end-game");
  $.game.sound.setVolume(sound, 0.7);
  $.game.sound.setPlaybackRate(sound, 1);

  $.html.classList.add("state-menu");

  this.titleScale = 2;
  this.titleAlpha = 0;

  this.tick = 0;
  this.entered = false;
};

$.stateMenu.leave = function () {
  $.html.classList.remove("state-menu");
};

$.stateMenu.step = function () {
  if (this.tick >= 35 && !this.entered) {
    $.game.tween(this).to(
      {
        titleScale: 1,
        titleAlpha: 1,
      },
      0.5,
      "outExpo"
    );
    var sound = $.game.playSound("logo-1");
    $.game.sound.setVolume(sound, 0.5);
    $.game.sound.setPlaybackRate(sound, 1.1);
    this.entered = true;
  }

  this.tick += $.game.dtNorm;
};

$.stateMenu.render = function () {
  // bg gradient color
  $.ctx.drawImage(
    $.game.levels[0].levelGradientCanvas,
    0,
    0,
    $.game.width,
    $.game.height
  );

  // track gradients
  $.ctx.drawImage(
    $.game.trackGradientCanvas,
    -$.game.trackPadding,
    -$.game.trackPadding,
    $.game.width + $.game.trackPadding * 2,
    $.game.height / 3 + $.game.trackPadding
  );
  $.ctx.drawImage(
    $.game.trackGradientCanvas,
    -$.game.trackPadding,
    $.game.height / 3,
    $.game.width + $.game.trackPadding * 2,
    $.game.height / 3
  );
  $.ctx.drawImage(
    $.game.trackGradientCanvas,
    -$.game.trackPadding,
    $.game.height - $.game.height / 3,
    $.game.width + $.game.trackPadding * 2,
    $.game.height / 3 + $.game.trackPadding
  );

  // title
  $.ctx.save();
  $.ctx.align(0.5);
  $.ctx.translate($.game.width / 2, $.game.height / 2);
  $.ctx.scale(
    this.titleScale / $.game.divisor,
    this.titleScale / $.game.divisor
  );
  $.ctx.a(0.5 * this.titleAlpha);
  $.ctx.drawImage($.game.images["title-glow"], 0, 0);
  $.ctx.a(this.titleAlpha);
  $.ctx.drawImage(
    $.game.images["title"],
    0,
    0,
    $.game.images.title.width,
    $.game.images.title.height / 2,
    0,
    -$.game.images.title.height / 4,
    $.game.images.title.width,
    $.game.images.title.height / 2
  );
  $.ctx.realign();
  $.ctx.restore();

  $.ctx.save();
  $.ctx.font(`${Math.round(50 / $.game.divisor)}px latowf400`);
  $.ctx.textBaseline("middle");
  $.ctx.textAlign("center");
  $.ctx.fillStyle(
    `hsla(${$.game.levels[0].hue2}, 100%, 85%, ${this.titleAlpha})`
  );
  $.ctx.fillText(
    `[ ${$.game.controlString} ] TO PLAY`,
    $.game.width / 2,
    $.game.height - $.game.height / 6 + 10 / $.game.divisor
  );

  $.ctx.textBaseline("bottom");
  $.ctx.font(`${Math.round(32 / $.game.divisor)}px latowf400`);

  $.ctx.textAlign("left");
  $.ctx.fillStyle(
    `hsla(${$.game.levels[0].hue2}, 100%, 85%, ${this.titleAlpha})`
  );
  $.ctx.fillText(
    "PLAY COUNT: " + $.formatCommas($.storage.get("playCount")),
    40 / $.game.divisor,
    $.game.height - 135 / $.game.divisor
  );
  $.ctx.fillText(
    "DEATH COUNT: " + $.formatCommas($.storage.get("deathCount")),
    40 / $.game.divisor,
    $.game.height - 85 / $.game.divisor
  );
  var best = $.storage.get("deathBest");
  best = best == 99999 ? "N/A" : $.formatCommas(best);
  $.ctx.fillText(
    "DEATH BEST: " + best,
    40 / $.game.divisor,
    $.game.height - 35 / $.game.divisor
  );
  $.ctx.textAlign("right");
  $.ctx.fillStyle(
    `hsla(${$.game.levels[0].hue1}, 100%, 85%, ${this.titleAlpha})`
  );
  $.ctx.fillText(
    "BY JACK RUGILE",
    $.game.width - 40 / $.game.divisor,
    $.game.height - 135 / $.game.divisor
  );
  $.ctx.fillText(
    "JACKRUGILE.COM",
    $.game.width - 40 / $.game.divisor,
    $.game.height - 85 / $.game.divisor
  );
  $.ctx.fillText(
    "@JACKRUGILE",
    $.game.width - 40 / $.game.divisor,
    $.game.height - 35 / $.game.divisor
  );

  $.ctx.restore();
};

$.stateMenu.pointerdown = function (e) {
  $.game.setState($.statePlay);
  if (e.button === "left") {
  } else if ((e.button = "right")) {
  }
};

$.stateMenu.keydown = function (e) {
  if (e.key != "m" && $.game.keyTriggers.indexOf(e.key) > -1) {
    $.game.setState($.statePlay);
  }
};

$.stateMenu.gamepaddown = function (data) {
  $.game.setState($.statePlay);
  if (
    data.button == "up" ||
    data.button == "right" ||
    data.button == "down" ||
    data.button == "left" ||
    data.button == "l1" ||
    data.button == "l2"
  ) {
  }
  if (
    data.button == "1" ||
    data.button == "2" ||
    data.button == "3" ||
    data.button == "4" ||
    data.button == "r1" ||
    data.button == "r2"
  ) {
  }
};
