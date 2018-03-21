$.block = function( opt ) {};

$.block.prototype.init = function( opt ) {
	$.merge( this, opt );
	this.hitRadius = this.size * 0.35;
	this.tick = 0;
	this.scale = 0;
	this.scaleTarget = 0;
	this.rotation = -$.HALFPI;
	this.rotationTarget = 0;
	this.alpha = 1;
	this.alphaTarget = 1;
	this.destroying = false;
	this.hitTick = 0;
	this.hitTickMax = 60;
};

$.block.prototype.step = function() {
	this.tick++;

	if( this.destroying ) {
		this.scaleTarget = 0;
	} else if( this.tick * 20 > this.y ) {
		this.scaleTarget = 1;
	}
	this.scale += ( this.scaleTarget - this.scale ) * 0.1;

	if( this.destroying ) {
		this.rotationTarget = $.PI;
	} else if( this.tick * 20 > this.y && this.track == $.game.state.currentTrack ) {
		this.rotationTarget = 0;
	} else {
		this.rotationTarget = $.HALFPI;
	}
	this.rotation += ( this.rotationTarget - this.rotation ) * 0.1;

	if( this.destroying ) {
		this.alphaTarget = 0;
	} else if( this.tick * 20 > this.y && this.track == $.game.state.currentTrack ) {
		this.alphaTarget = 1;
	} else {
		this.alphaTarget = 0.25;
	}
	this.alpha += ( this.alphaTarget - this.alpha ) * 0.1;

	// handle hit
	if( this.hitTick > 0 ) {
		this.hitTick--;
	}

	this.tick++;

	if( this.destroying ) {
		if( this.scale < 0.001 ) {
			this.pool.release( this );
		}
	}
}

$.block.prototype.render = function() {
	$.ctx.save();
		$.ctx.translate( this.x + this.size / 2, this.y + this.size / 2 );
		$.ctx.scale( this.scale, this.scale );
		$.ctx.rotate( this.rotation );
		$.ctx.a( this.alpha );
		$.ctx.fillStyle( $.game.blockGradient );
		$.ctx.fillRect( -this.size / 2, -this.size / 2, this.size, this.size );
	$.ctx.restore();

	// hit flash
	if( this.hitTick > 0 ) {
		$.ctx.save();
			!$.game.isPerf && $.ctx.globalCompositeOperation( 'overlay' );
			$.ctx.beginPath();
			$.ctx.fillStyle( 'hsla(0, 0%, 100%, ' + ( ( this.hitTick / this.hitTickMax ) * 1 ) + ')' );
			$.ctx.fillRect( this.x, this.y, this.size, this.size );
			!$.game.isPerf && $.ctx.fillRect( this.x, this.y, this.size, this.size );
		$.ctx.restore();
	}

	// draw hit radius
	if( $.game.isDebug ) {
		$.ctx.beginPath();
		$.ctx.arc( this.x + this.size / 2, this.y + this.size / 2, this.hitRadius, 0, $.TAU );
		$.ctx.fillStyle( 'hsla(0, 0%, 100%, 0.25)' );
		$.ctx.fill();
	}
};

$.block.prototype.destroy = function() {
	this.destroying = true;
};