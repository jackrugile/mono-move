$.spark = function( opt ) {};

$.spark.prototype.init = function( opt ) {
	$.merge( this, opt );
	this.life = 1;
	this.alpha = 1;
	this.scale = 1;
	this.rotation = $.rand( 0, $.TAU );
	this.spin = $.rand( -0.1, 0.1 );

	this.trail = [];
	this.trailSize = 7;
	this.trailWidth = 1;
};

$.spark.prototype.step = function() {
	this.vel *= this.drag;
	this.x += Math.cos( this.angle ) * this.vel;
	this.y += Math.sin( this.angle ) * this.vel;
	this.rotation += this.spin;

	this.life -= this.decay;
	this.alpha = this.life;
	this.scale = this.life;

	this.trail.unshift( [ this.x, this.y ] );
	if( this.trail.length > this.trailSize ) {
		this.trail.pop();
	}

	if( this.life <= 0 ) {
		this.pool.release( this );
	}
};

$.spark.prototype.render = function() {
	if( this.burst ) {
		$.ctx.save();
			var sh = 0;
			$.ctx.beginPath();
			for( var i = 0, length = this.trail.length; i < length; i++ ) {
				var p = this.trail[ i ];
				if( i == 0 ) {
					$.ctx.moveTo( p[ 0 ], p[ 1 ] );
				} else {
					$.ctx.lineTo( p[ 0 ], p[ 1 ] );
				}

				if( i == 0 ) {
					$.ctx.moveTo( p[ 0 ] + $.rand( -sh, sh ), p[ 1 ] + $.rand( -sh, sh ) );
				} else {
					$.ctx.lineTo( p[ 0 ] + $.rand( -sh, sh ), p[ 1 ] + $.rand( -sh, sh ) );
				}
			}
			$.ctx.strokeStyle( 'hsla(0, 0%, 100%, ' + this.alpha + ')' );
			$.ctx.lineWidth( this.trailWidth );
			!$.game.isPerf && $.ctx.globalCompositeOperation( 'overlay' );
			$.ctx.stroke();
		$.ctx.restore();
	} else {
		$.ctx.save();
			$.ctx.translate( this.x - this.w / 2, this.y - this.h / 2 );
			$.ctx.scale( this.scale, this.scale );
			$.ctx.rotate( this.rotation );
			$.ctx.fillStyle( 'hsla(0, 0%, 100%, ' + this.alpha + ')' );
			$.ctx.fillRect( -this.w / 2, -this.w / 2, this.w, this.h );
		$.ctx.restore();
	}
};

$.spark.prototype.destroy = function() {
};