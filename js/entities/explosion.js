$.explosion = function (opt) {};

$.explosion.prototype.init = function (opt) {
  $.merge(this, opt);
  this.life = 1;
  this.alpha = 1;
  this.scale = 1;
  this.vx = opt.vx || 0;
  this.vy = opt.vy || 0;
};

$.explosion.prototype.step = function () {
  this.life -= this.decay * $.game.dtNorm;
  this.alpha = this.life / 2;
  this.scale = 2 - this.life;

  this.x += this.vx * $.game.dtNorm;
  this.y += this.vy * $.game.dtNorm;

  if (this.life <= 0) {
    this.pool.release(this);
  }
};

$.explosion.prototype.render = function () {
  $.ctx.save();
  // !$.game.isPerf && $.ctx.globalCompositeOperation("overlay");
  $.ctx.globalCompositeOperation("lighter");
  $.ctx.beginPath();
  $.ctx.translate(this.x, this.y);
  $.ctx.scale(this.scale, this.scale);
  var alpha = $.game.isPerf ? this.alpha * 0.75 : this.alpha;
  $.ctx.fillStyle("hsla(0, 0%, 100%, " + alpha + ")");
  $.ctx.arc(0, 0, this.radius, 0, $.TAU);
  $.ctx.fill();
  $.ctx.restore();
};

$.explosion.prototype.destroy = function () {};
