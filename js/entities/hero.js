$.hero = function (opt) {
  $.merge(this, opt);

  this.radius = $.game.unit / 2;
  this.vx = 0;
  this.vy = 0;
  this.gap = this.radius / 10;
  this.gapMove = this.radius / 5;
  this.rotation = 0;
  this.jumpTickMax = 30;
  this.jumpTick = 0;
  this.sparkTickMax = 1;
  this.sparkTick = 0;
  this.grav = 2 / $.game.divisor;
  this.buffer = this.radius * 10;
  this.impactAngle = 0;
  this.rolling = false;
  this.panningValue = 0;

  this.crescentCanvas = document.createElement("canvas");
  this.crescentCtx = this.crescentCanvas.getContext("2d");
  this.crescentCanvas.width = this.radius * 2;
  this.crescentCanvas.height = this.radius * 2;
  this.crescentCtx.beginPath();
  this.crescentCtx.arc(this.radius, this.radius, this.radius, 0, $.TAU);
  this.crescentCtx.fillStyle = "hsla(0, 0%, 100%, 0.2)";
  this.crescentCtx.fill();
  this.crescentCtx.beginPath();
  this.crescentCtx.arc(this.radius * 0.7, this.radius, this.radius, 0, $.TAU);
  this.crescentCtx.globalCompositeOperation = "destination-out";
  this.crescentCtx.fillStyle = "#fff";
  this.crescentCtx.fill();

  this.tick = 0;
};

$.hero.prototype.step = function () {
  this.vy += this.grav * $.game.dtNorm;

  var vxBase = $.game.levels[$.game.state.currentLevel].vx / $.game.divisor;
  if ($.game.state.currentLevel % 2 === 0) {
    // even levels
    if ($.game.state.currentTrack === 0) {
      // track 1
      this.vx = vxBase;
    } else if ($.game.state.currentTrack === 1) {
      // track 2
      this.vx = -vxBase;
    } else if ($.game.state.currentTrack === 2) {
      // track 3
      this.vx = vxBase;
    }
  } else {
    // odd levels
    if ($.game.state.currentTrack === 0) {
      // track 1
      this.vx = -vxBase;
    } else if ($.game.state.currentTrack === 1) {
      // track 2
      this.vx = vxBase;
    } else if ($.game.state.currentTrack === 2) {
      // track 3
      this.vx = -vxBase;
    }
  }

  this.x += this.vx * $.game.dtNorm;
  this.y += this.vy * $.game.dtNorm;
  this.panningValue = $.clamp((this.x / $.game.width) * 2 - 1, -1, 1);

  if (this.grav > 0) {
    // lock to track bot
    if (this.y > $.game.state.getTrack().bot - this.radius) {
      this.y = $.game.state.getTrack().bot - this.radius;
      this.vy = 0;
      if (!this.rolling) {
        var sound = $.game.playSound("jump-land");
        $.game.sound.setVolume(sound, 0.6);
        $.game.isChrome && $.game.sound.setPanning(sound, this.panningValue);
        $.game.sound.setPlaybackRate(sound, $.rand(1, 1.2));
      }
      this.rolling = true;
    } else {
      this.rolling = false;
    }
  } else {
    // lock to track top
    if (this.y < $.game.state.getTrack().top + this.radius) {
      this.y = $.game.state.getTrack().top + this.radius;
      this.vy = 0;
      if (!this.rolling) {
        var sound = $.game.playSound("jump-land");
        $.game.sound.setVolume(sound, 0.6);
        $.game.isChrome && $.game.sound.setPanning(sound, this.panningValue);
        $.game.sound.setPlaybackRate(sound, $.rand(1.6, 1.7));
      }
      this.rolling = true;
    } else {
      this.rolling = false;
    }
  }

  if (this.rolling) {
    $.game.sound.setVolume($.game.scrapeSound, 0.15);
  } else {
    $.game.sound.setVolume($.game.scrapeSound, 0);
  }
  $.game.isChrome &&
    $.game.sound.setPanning($.game.scrapeSound, this.panningValue);

  var trackChange = false,
    levelChange = false;
  // advance track and level
  if ($.game.state.currentLevel % 2 === 0) {
    // even levels
    if ($.game.state.currentTrack === 0) {
      // track 1
      if (this.x > $.game.width + this.radius) {
        $.game.state.currentTrack++;
        trackChange = true;
        this.y += $.game.height / 3;
      }
    } else if ($.game.state.currentTrack === 1) {
      // track 2
      if (this.x < -this.radius) {
        $.game.state.currentTrack++;
        trackChange = true;
        this.y += $.game.height / 3;
      }
    } else if ($.game.state.currentTrack === 2) {
      // track 3
      if (this.x > $.game.width + this.radius) {
        $.game.state.currentTrack = 0;
        levelChange = true;
        this.x += this.buffer;
        this.y -= ($.game.height / 3) * 2;
      }
    }
  } else {
    // odd levels
    if ($.game.state.currentTrack === 0) {
      // track 1
      if (this.x < -this.radius) {
        $.game.state.currentTrack++;
        trackChange = true;
        this.y += $.game.height / 3;
      }
    } else if ($.game.state.currentTrack === 1) {
      // track 2
      if (this.x > $.game.width + this.radius) {
        $.game.state.currentTrack++;
        trackChange = true;
        this.y += $.game.height / 3;
      }
    } else if ($.game.state.currentTrack === 2) {
      // track 3
      if (this.x < -this.radius) {
        $.game.state.currentTrack = 0;
        levelChange = true;
        this.x -= this.buffer;
        this.y -= ($.game.height / 3) * 2;
      }
    }
  }

  if (trackChange) {
    var sound = $.game.playSound("track-change");
    $.game.sound.setVolume(sound, 0.9);
    $.game.isChrome && $.game.sound.setPanning(sound, this.panningValue);
    $.game.sound.setPlaybackRate(sound, 0.8);
    $.game.state.trackChangeTick = $.game.state.trackChangeTickMax;
  }

  if (levelChange) {
    var sound = $.game.playSound("level-change");
    $.game.sound.setVolume(sound, 0.9);
    $.game.sound.setPlaybackRate(sound, $.rand(1, 1));

    if ($.game.state.currentLevel === $.game.levels.length - 1) {
      $.game.state.currentLevel = 0;
      $.game.state.destroyLevel();
      $.game.state.winFlag = true;
    } else {
      $.game.state.currentLevel++;
      $.game.state.destroyLevel();
      $.game.state.generateLevel();
      $.game.state.trackChangeTick = $.game.state.trackChangeTickMax;
    }
  }

  // handle rotation based on gravity
  let boost = this.rolling ? 1 : 1.5;
  if (this.grav > 0) {
    if (this.rolling) {
      this.rotation += (this.vx / 1.25 / this.radius) * boost * $.game.dtNorm;
    } else {
      this.rotation -= (this.vx / 1.25 / this.radius) * boost * $.game.dtNorm;
    }
  } else {
    if (this.rolling) {
      this.rotation -= (this.vx / 1.25 / this.radius) * boost * $.game.dtNorm;
    } else {
      this.rotation += (this.vx / 1.25 / this.radius) * boost * $.game.dtNorm;
    }
  }

  // handle jump pulse
  if (this.jumpTick > 0) {
    this.jumpTick -= $.game.dtNorm;
    this.jumpTick = Math.max(this.jumpTick, 0);
  }

  // collisions
  this.checkCollisions();

  // rolling sparks
  this.sparkTick += $.game.dtNorm;
  if (this.rolling && this.sparkTick > this.sparkTickMax) {
    this.sparkTick = this.sparkTick - this.sparkTickMax;

    for (let i = 0; i < 2; i++) {
      var size = $.rand(1, 5) / $.game.divisor,
        angle;

      if (this.vx > 0) {
        if (this.grav > 0) {
          angle = $.rand($.PI + 0.1, $.PI + 0.5);
        } else {
          angle = -$.rand($.PI + 0.1, $.PI + 0.5);
        }
      } else {
        if (this.grav > 0) {
          angle = $.rand($.PI - 0.1, $.PI - 0.5);
        } else {
          angle = -$.rand($.PI - 0.1, $.PI - 0.5);
        }
      }

      $.game.state.sparks.create({
        pool: $.game.state.sparks,
        x: this.x + $.rand(-5, 5) / $.game.divisor,
        y: this.grav > 0 ? this.y + this.radius : this.y - this.radius,
        angle: angle,
        vel: this.vx,
        drag: 0.9,
        decay: 0.02,
        w: size,
        h: size,
        burst: false,
        hue: $.rand(
          $.game.levels[$.game.state.currentLevel].hue2,
          $.game.levels[$.game.state.currentLevel].hue1
        ),
        saturation: $.rand(70, 100),
        lightness: $.rand(50, 80),
      });
    }
  }

  this.tick += $.game.dtNorm;
};

$.hero.prototype.renderWedge = function (rotation) {
  var length =
    this.gap +
    (0.5 + Math.sin(this.tick * Math.abs(this.vx) * 0.01) / 2) * this.gapMove;
  var x = this.x + Math.cos($.THIRDPI + rotation) * length;
  var y = this.y + Math.sin($.THIRDPI + rotation) * length;
  $.ctx.moveTo(x, y);
  $.ctx.arc(
    this.x,
    this.y,
    this.radius,
    length / (this.radius * 1.125) + rotation,
    $.THIRDTAU - length / (this.radius * 1.125) + rotation,
    false
  );
  $.ctx.lineTo(x, y);
};

$.hero.prototype.render = function () {
  $.ctx.save();

  var alpha = 0.4 + Math.sin(this.tick * Math.abs(this.vx) * 0.01) * 0.2;
  $.ctx.globalCompositeOperation("lighter");
  $.ctx.fillStyle("hsla(0, 0%, 100%, " + alpha * 2 + ")");

  // triangle core
  $.ctx.beginPath();
  let rad =
    this.radius / 10 +
    (Math.sin(this.tick * Math.abs(this.vx) * 0.01) * this.radius) / 10;
  // let offset = $.THIRDTAU / 2;
  let offset = 0;
  let baseRotation = this.rotation + offset;
  $.ctx.moveTo(
    this.x + Math.cos(baseRotation) * rad,
    this.y + Math.sin(baseRotation) * rad
  );
  $.ctx.lineTo(
    this.x + Math.cos(baseRotation + $.THIRDTAU) * rad,
    this.y + Math.sin(baseRotation + $.THIRDTAU) * rad
  );
  $.ctx.lineTo(
    this.x + Math.cos(baseRotation + $.THIRDTAU * 2) * rad,
    this.y + Math.sin(baseRotation + $.THIRDTAU * 2) * rad
  );
  $.ctx.fill();

  // main wedges
  $.ctx.beginPath();
  this.renderWedge(this.rotation);
  this.renderWedge($.THIRDTAU + this.rotation);
  this.renderWedge($.THIRDTAU * 2 + this.rotation);
  $.ctx.closePath();
  $.ctx.fillStyle("hsla(0, 0%, 100%, " + alpha + ")");
  $.ctx.fill();

  // clip to wedges
  $.ctx.clip();

  // crescent moon highlight
  $.ctx.save();
  $.ctx.globalCompositeOperation("lighter");
  if (this.vx > 0) {
    $.ctx.drawImage(
      this.crescentCanvas,
      this.x - this.radius,
      this.y - this.radius
    );
  } else {
    $.ctx.translate(this.x + this.radius, this.y + this.radius);
    $.ctx.scale(-1, 1);
    $.ctx.drawImage(this.crescentCanvas, 0, -this.radius * 2);
  }
  $.ctx.restore();

  // unclip to wedges
  $.ctx.restore();

  // general gradient highlight
  $.ctx.save();
  $.ctx.globalCompositeOperation("lighter");
  $.ctx.drawImage(
    $.game.heroGradientCanvas,
    this.x - $.game.heroGradientSize / 2,
    this.y - $.game.heroGradientSize / 2,
    $.game.heroGradientSize,
    $.game.heroGradientSize
  );
  $.ctx.restore();
};

$.hero.prototype.jump = function () {
  if (this.grav > 0) {
    var sound = $.game.playSound("jump");
    $.game.sound.setVolume(sound, 0.6);
    $.game.isChrome && $.game.sound.setPanning(sound, this.panningValue);
    $.game.sound.setPlaybackRate(sound, $.rand(1.9, 2.1));
  } else {
    var sound = $.game.playSound("jump");
    $.game.sound.setVolume(sound, 0.6);
    $.game.isChrome && $.game.sound.setPanning(sound, this.panningValue);
    $.game.sound.setPlaybackRate(sound, $.rand(1.2, 1.4));
  }

  for (var i = 0, length = 10; i < length; i++) {
    var size = $.rand(1, 3) / $.game.divisor;
    var angle = (i / length) * $.TAU;
    var amp = this.radius;
    $.game.state.sparks.create({
      pool: $.game.state.sparks,
      x: this.x + this.vx + Math.cos(angle) * amp,
      y: this.y + this.vy + Math.sin(angle) * amp,
      angle: angle,
      vel: $.rand(-3, -4) / $.game.divisor,
      drag: 0.97,
      decay: 0.025,
      w: size,
      h: size,
      burst: true,
      hue: $.rand(
        $.game.levels[$.game.state.currentLevel].hue2,
        $.game.levels[$.game.state.currentLevel].hue1
      ),
      saturation: $.rand(70, 100),
      lightness: $.rand(40, 70),
    });
  }

  $.game.state.explosions.create({
    pool: $.game.state.explosions,
    x: this.x + this.vx,
    y: this.y + this.vy,
    vx: 0,
    vy: 0,
    radius: this.radius,
    decay: 0.14,
    hue: $.rand(
      $.game.levels[$.game.state.currentLevel].hue2,
      $.game.levels[$.game.state.currentLevel].hue1
    ),
    saturation: $.rand(70, 100),
    lightness: $.rand(40, 70),
  });

  this.vy = 0;
  this.grav *= -1;
  this.jumpTick = this.jumpTickMax;
};

$.hero.prototype.die = function () {
  $.storage.set("deathCount", $.storage.get("deathCount") + 1);

  var sound = $.game.playSound("explosion-1");
  $.game.sound.setVolume(sound, 0.3);
  $.game.isChrome && $.game.sound.setPanning(sound, this.panningValue);
  $.game.sound.setPlaybackRate(sound, $.rand(0.7, 1.2));
  var sound = $.game.playSound("explosion-2");
  $.game.sound.setVolume(sound, 0.3);
  $.game.isChrome && $.game.sound.setPanning(sound, this.panningValue);
  $.game.sound.setPlaybackRate(sound, $.rand(0.7, 1.2));
  var sound = $.game.playSound("explosion-3");
  $.game.sound.setVolume(sound, 0.3);
  $.game.isChrome && $.game.sound.setPanning(sound, this.panningValue);
  $.game.sound.setPlaybackRate(sound, $.rand(0.7, 1.2));

  $.game.state.deathTick = $.game.state.deathTickMax;

  // burst
  for (var i = 0, length = 10; i < length; i++) {
    var size = $.rand(1, 3) / $.game.divisor;
    $.game.state.sparks.create({
      pool: $.game.state.sparks,
      x: this.x + $.rand(0, Math.cos((i / length) * $.TAU) * this.radius),
      y: this.y + $.rand(0, Math.sin((i / length) * $.TAU) * this.radius),
      angle: (i / length) * $.TAU,
      vel: $.rand(1, 10) / $.game.divisor,
      drag: 0.96,
      decay: 0.01,
      w: size,
      h: size,
      burst: true,
      hue: $.rand(
        $.game.levels[$.game.state.currentLevel].hue2,
        $.game.levels[$.game.state.currentLevel].hue1
      ),
      saturation: $.rand(70, 100),
      lightness: $.rand(40, 70),
    });
  }

  // non-burst
  for (var i = 0, length = 30; i < length; i++) {
    var size = $.rand(1, 5) / $.game.divisor;
    $.game.state.sparks.create({
      pool: $.game.state.sparks,
      x: this.x + $.rand(0, Math.cos((i / length) * $.TAU) * this.radius),
      y: this.y + $.rand(0, Math.sin((i / length) * $.TAU) * this.radius),
      angle: (i / length) * $.TAU,
      vel: $.rand(1, 10) / $.game.divisor,
      drag: 0.96,
      decay: 0.02,
      w: size,
      h: size,
      burst: false,
      hue: $.rand(
        $.game.levels[$.game.state.currentLevel].hue2,
        $.game.levels[$.game.state.currentLevel].hue1
      ),
      saturation: $.rand(70, 100),
      lightness: $.rand(50, 80),
    });
  }

  let count = 3;
  let baseRadius = $.game.unit * 0.375;
  let growthRadius = $.game.unit * 0.1875;
  for (var i = 0; i < count; i++) {
    let radius = baseRadius + i * growthRadius;
    $.game.state.explosions.create({
      pool: $.game.state.explosions,
      x: this.x,
      y: this.y,
      radius: radius,
      decay: 0.03,
      hue: $.rand(
        $.game.levels[$.game.state.currentLevel].hue2,
        $.game.levels[$.game.state.currentLevel].hue1
      ),
      saturation: $.rand(70, 100),
      lightness: $.rand(50, 100),
    });
  }

  // reset to track start
  if (this.vx > 0) {
    this.x = -this.radius * 3;
  } else {
    this.x = $.game.width + this.radius * 3;
  }

  // screen shake
  this.impactAngle = Math.atan2(this.vy, this.vx);
  $.game.state.shake.translate = 5 / $.game.divisor;
  $.game.state.shake.xBias = (Math.cos(this.impactAngle) * 25) / $.game.divisor;
  $.game.state.shake.yBias = (Math.sin(this.impactAngle) * 25) / $.game.divisor;

  $.game.state.deaths++;
};

$.hero.prototype.checkCollisions = function () {
  for (var i = 0, length = $.game.state.blocks.length; i < length; i++) {
    var block = $.game.state.blocks.getAt(i);
    if (
      !block.destroying &&
      block.track === $.game.state.currentTrack &&
      $.circleColliding(
        this.x,
        this.y,
        this.radius,
        block.x + block.size / 2,
        block.y + block.size / 2,
        block.hitRadius
      )
    ) {
      block.hitTick = block.hitTickMax;
      this.die();
    }
  }
};

$.hero.prototype.destroy = function () {
  this.crescentCanvas = null;
  this.crescentCanvasCtx = null;
};
