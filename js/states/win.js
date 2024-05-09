$.stateWin = {};

$.stateWin.create = function () {
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

  // sparks
  this.sparks = new $.pool($.spark, 0);

  // explosions
  this.explosions = new $.pool($.explosion, 0);
};

$.stateWin.enter = function () {
  $.html.classList.add("state-win");
  this.actionTickMax = 150;
  this.tick = 0;

  if ($.game.lastRunDeaths < $.storage.get("deathBest")) {
    $.storage.set("deathBest", $.game.lastRunDeaths);
  }
};

$.stateWin.leave = function () {
  this.sparks.empty();
  this.explosions.empty();
  $.html.classList.remove("state-win");
};

$.stateWin.step = function () {
  if ($.rand(0, 1) > 0.96) {
    var x = $.rand(0, $.game.width),
      y = $.rand(0, $.game.height),
      radius = $.rand(40, 160) / $.game.divisor;

    for (var i = 0, length = 15; i < length; i++) {
      var size = $.rand(1, 4);
      this.sparks.create({
        pool: this.sparks,
        x: x + $.rand(0, Math.cos((i / length) * $.TAU) * radius),
        y: y + $.rand(0, Math.sin((i / length) * $.TAU) * radius),
        angle: (i / length) * $.TAU,
        vel: $.rand(1, 10) / $.game.divisor,
        drag: 0.96,
        decay: 0.01,
        w: size,
        h: size,
        burst: true,
      });
    }

    for (var i = 0, length = 30; i < length; i++) {
      var size = $.rand(1, 4) / $.game.divisor;
      this.sparks.create({
        pool: this.sparks,
        x: x + $.rand(0, Math.cos((i / length) * $.TAU) * radius),
        y: y + $.rand(0, Math.sin((i / length) * $.TAU) * radius),
        angle: (i / length) * $.TAU,
        vel: $.rand(1, 10) / $.game.divisor,
        drag: 0.96,
        decay: 0.01,
        w: size,
        h: size,
        burst: false,
      });
    }

    for (var i = 0; i < 20; i++) {
      $.game.state.explosions.create({
        pool: $.game.state.explosions,
        x: x + $.rand(0, Math.cos((i / length) * $.TAU) * radius * 2),
        y: y + $.rand(0, Math.sin((i / length) * $.TAU) * radius * 2),
        radius: $.rand(1, 3) / $.game.divisor,
        decay: 0.02,
      });
    }

    $.game.state.explosions.create({
      pool: $.game.state.explosions,
      x: x,
      y: y,
      radius: 20 / $.game.divisor,
      decay: 0.02,
    });

    var sound = $.game.playSound("explosion-1");
    $.game.sound.setVolume(sound, $.rand(0.05, 0.25));
    $.game.isChrome &&
      $.game.sound.setPanning(
        sound,
        $.clamp((x / $.game.width) * 2 - 1, -1, 1)
      );
    $.game.sound.setPlaybackRate(sound, $.rand(0.2, 0.8));
  }

  this.sparks.each("step");
  this.explosions.each("step");
  this.tick += $.game.dtNorm;
};

$.stateWin.render = function () {
  // bg gradient color
  $.ctx.fillStyle($.game.levels[0].gradient);
  $.ctx.fillRect(0, 0, $.game.width, $.game.height);

  // track gradients
  $.ctx.save();
  $.ctx.fillStyle($.game.topGradient);
  $.ctx.fillRect(0, 0, $.game.width, $.game.height / 3);
  $.ctx.fillStyle($.game.midGradient);
  $.ctx.fillRect(0, $.game.height / 3, $.game.width, $.game.height / 3);
  $.ctx.fillStyle($.game.botGradient);
  $.ctx.fillRect(
    0,
    $.game.height - $.game.height / 3,
    $.game.width,
    $.game.height / 3
  );
  $.ctx.restore();

  var timesText = $.game.lastRunDeaths === 1 ? "TIME" : "TIMES",
    statusText =
      "YOU DIED " +
      $.formatCommas($.game.lastRunDeaths) +
      " " +
      timesText +
      " IN " +
      $.msToString($.game.lastRunTime);

  $.ctx.save();
  $.ctx.textAlign("center");
  $.ctx.textBaseline("middle");
  $.ctx.font(`${Math.round(120 / $.game.divisor)}px latowf400`);
  $.ctx.fillStyle("#fff");
  $.ctx.fillText(
    "VICTORY!",
    $.game.width / 2,
    $.game.height / 2 + 35 / $.game.divisor
  );
  $.ctx.font(`${Math.round(64 / $.game.divisor)}px latowf400`);
  $.ctx.fillText(
    statusText,
    $.game.width / 2,
    $.game.height - $.game.height / 6 - 20 / $.game.divisor
  );
  $.ctx.font(`${Math.round(34 / $.game.divisor)}px latowf400`);
  $.ctx.fillText(
    `[ ${$.game.controlString} ] RETURN TO MENU`,
    $.game.width / 2,
    $.game.height - $.game.height / 6 + 70 / $.game.divisor
  );
  $.ctx.restore();

  this.sparks.each("render");
  this.explosions.each("render");
};

$.stateWin.pointerdown = function (e) {
  if (this.tick < this.actionTickMax) {
    return false;
  }
  $.game.setState($.stateMenu);
  if (e.button === "left") {
  } else if ((e.button = "right")) {
  }
};

$.stateWin.keydown = function (e) {
  if (this.tick < this.actionTickMax) {
    return false;
  }
  if (
    e.key != "m" &&
    ($.game.keyTriggers.indexOf(e.key) > -1 || e.key == "escape")
  ) {
    $.game.setState($.stateMenu);
  }
};

$.stateWin.gamepaddown = function (data) {
  if (this.tick < this.actionTickMax) {
    return false;
  }
  $.game.setState($.stateMenu);
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
