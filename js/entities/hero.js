$.hero = function( opt ) { 
	$.merge( this, opt );

	this.radius = $.game.unit / 2;
	this.vy = 0;
	this.gap = 2;
	this.gapMove = 8;
	this.rotation = 0;
	this.jumpTickMax = 15;
	this.jumpTick = 0;
	this.grav = 2;
	this.buffer = 400;
	this.impactAngle = 0;
	this.rolling = false;

	this.trail = [];
	this.trailSize = 10;

	this.scratch = document.createElement( 'canvas' );
	this.scratchCtx = this.scratch.getContext( '2d' );
	this.scratch.width = this.radius * 2;
	this.scratch.height = this.radius * 2;
	this.scratchCtx.beginPath();
	this.scratchCtx.arc( this.radius, this.radius, this.radius, 0, $.TAU );
	this.scratchCtx.fillStyle = 'hsla(0, 0%, 100%, 0.5)';
	this.scratchCtx.fill();
	this.scratchCtx.beginPath();
	this.scratchCtx.arc( this.radius - 10, this.radius + 0, this.radius, 0, $.TAU );
	this.scratchCtx.globalCompositeOperation = 'destination-out';
	this.scratchCtx.fillStyle = '#fff';
	this.scratchCtx.fill();

	this.tick = 0;
};

$.hero.prototype.step = function() {
	this.vy += this.grav;

	var vxBase = $.game.levels[ $.game.state.currentLevel ].vx;
	if( $.game.state.currentLevel % 2 === 0 ) {
		// even levels
		if( $.game.state.currentTrack === 0 ) {
			// track 1
			this.vx = vxBase;
		} else if( $.game.state.currentTrack === 1 ) {
			// track 2
			this.vx = -vxBase;
		} else if( $.game.state.currentTrack === 2) {
			// track 3
			this.vx = vxBase;
		}
	} else {
		// odd levels
		if( $.game.state.currentTrack === 0 ) {
			// track 1
			this.vx = -vxBase;
		} else if( $.game.state.currentTrack === 1 ) {
			// track 2
			this.vx = vxBase;
			
		} else if( $.game.state.currentTrack === 2) {
			// track 3
			this.vx = -vxBase;
		}
	}

	this.x += this.vx;
	this.y += this.vy;

	if( this.grav > 0 ) {
		// lock to track bot
		if( this.y > $.game.state.getTrack().bot - this.radius ) {
			this.y = $.game.state.getTrack().bot - this.radius;
			this.vy = 0;
			if( !this.rolling ) {
				var sound = $.game.playSound( 'jump-land' );
				$.game.sound.setVolume( sound, 0.7 );
				$.game.isChrome && $.game.sound.setPanning( sound, ( this.x / $.game.width ) * 2 - 1 );
				$.game.sound.setPlaybackRate( sound, $.rand( 1, 1.2 ) );
			}
			this.rolling = true;
		} else {
			this.rolling = false;
		}
	} else {
		// lock to track top
		if( this.y < $.game.state.getTrack().top + this.radius ) {
			this.y = $.game.state.getTrack().top + this.radius;
			this.vy = 0;
			if( !this.rolling ) {
				var sound = $.game.playSound( 'jump-land' );
				$.game.sound.setVolume( sound, 0.7 );
				$.game.isChrome && $.game.sound.setPanning( sound, ( this.x / $.game.width ) * 2 - 1 );
				$.game.sound.setPlaybackRate( sound, $.rand( 1.6, 1.7 ) );
			}
			this.rolling = true;
		} else {
			this.rolling = false;
		}
	}

	if( this.rolling ) {
		$.game.scrapeVolTarget = 0.15;
	} else {
		$.game.scrapeVolTarget = 0;
	}
	$.game.isChrome && $.game.sound.setPanning( $.game.scrapeSound, ( this.x / $.game.width ) * 2 - 1 );

	var trackChange = false,
		levelChange= false;
	// advance track and level
	if( $.game.state.currentLevel % 2 === 0 ) {
		// even levels
		if( $.game.state.currentTrack === 0 ) {
			// track 1
			if( this.x > $.game.width + this.radius ) {
				$.game.state.currentTrack++;
				trackChange = true;
				this.y += $.game.height / 3;
			}
		} else if( $.game.state.currentTrack === 1 ) {
			// track 2
			if( this.x < -this.radius ) {
				$.game.state.currentTrack++;
				trackChange = true;
				this.y += $.game.height / 3;
			}
		} else if( $.game.state.currentTrack === 2) {
			// track 3
			if( this.x > $.game.width + this.radius ) {
				$.game.state.currentTrack = 0;
				levelChange = true;
				this.x += this.buffer;
				this.y -= $.game.height / 3 * 2;
			}
		}
	} else {
		// odd levels
		if( $.game.state.currentTrack === 0 ) {
			// track 1
			if( this.x < -this.radius ) {
				$.game.state.currentTrack++;
				trackChange = true;
				this.y += $.game.height / 3;
			}
		} else if( $.game.state.currentTrack === 1 ) {
			// track 2
			if( this.x > $.game.width + this.radius ) {
				$.game.state.currentTrack++;
				trackChange = true;
				this.y += $.game.height / 3;
			}
		} else if( $.game.state.currentTrack === 2) {
			// track 3
			if( this.x < -this.radius  ) {
				$.game.state.currentTrack = 0;
				levelChange = true;
				this.x -= this.buffer;
				this.y -= $.game.height / 3 * 2;
			}
		}
	}

	if( trackChange ) {
		var sound = $.game.playSound( 'track-change' );
		$.game.sound.setVolume( sound, 1 );
		$.game.isChrome && $.game.sound.setPanning( sound, ( this.x / $.game.width ) * 2 - 1 );
		$.game.sound.setPlaybackRate( sound, 0.8 );
		$.game.state.trackChangeTick = $.game.state.trackChangeTickMax;
	}

	if( levelChange ) {
		var sound = $.game.playSound( 'level-change' );
		$.game.sound.setVolume( sound, 1 );
		$.game.sound.setPlaybackRate( sound, $.rand( 1, 1 ) );

		if( $.game.state.currentLevel === $.game.levels.length - 1 ) {
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
	if( this.grav > 0 ) {
		this.rotation += this.rolling ? this.vx / 80 : this.vx / 140;
	} else {
		this.rotation -= this.rolling ? this.vx / 80 : this.vx / 140;
	}

	// handle jump pulse
	if( this.jumpTick > 0 ) {
		this.jumpTick--;
	}

	// for collision testing
	//this.x = $.game.mouse.x;
	//this.y = $.game.mouse.y;

	// collisions
	this.checkCollisions();

	// rolling sparks
	if( this.rolling ) {
		var size = $.rand( 1, 5 ),
			angle;

		if( this.vx > 0 ) {
			if( this.grav > 0 ) {
				angle = $.rand( $.PI + 0.1, $.PI + 0.6 );
			} else {
				angle = -$.rand( $.PI + 0.1, $.PI + 0.6 )
			}
		} else {
			if( this.grav > 0 ) {
				angle = $.rand( $.PI - 0.1, $.PI - 0.6 );
			} else {
				angle = -$.rand( $.PI - 0.1, $.PI - 0.6 )
			}
		}

		for( var i = 0; i < ( $.game.isPerf ? 1 : 2 ); i++ ) {
			$.game.state.sparks.create({
				pool: $.game.state.sparks,
				x: this.x + $.rand( -5, 5 ),
				y: this.grav > 0 ? this.y + this.radius + $.rand( 0, -5 ) : this.y - this.radius + $.rand( 0, 5 ),
				angle: angle,
				vel: this.vx,
				drag: 0.95,
				decay: 0.02,
				w: size,
				h: size,
				burst: false
			});
		}
	}

	this.trail.unshift( [ this.x, this.y] );
	if( this.trail.length > this.trailSize ) {
		this.trail.pop();
	}

	// bubble trail
	/*
		$.game.state.explosions.create({
			pool: $.game.state.explosions,
			x: this.x,
			y: this.y,
			radius: $.rand( 1, 5 ),
			decay: 0.01
		});
	*/
	/*
		var angle = $.rand( 0, $.TAU ),
			length = $.rand( 0, this.radius );

		$.game.state.explosions.create({
			pool: $.game.state.explosions,
			x: this.x + Math.cos( angle ) * length,
			y: this.y + Math.sin( angle ) * length,
			radius: $.rand( 1, 3 ),
			decay: 0.05
		});
	*/

	//3d tilt
	/*var xdeg = ( ( this.y / $.game.height ) - 0.5 ) * 45,
		ydeg = ( ( this.x / $.game.width ) - 0.5 ) * -45;
	$.body.style.transform = 'rotateX(' + xdeg + 'deg) rotateY(' + ydeg + 'deg)';*/

	this.tick++;
};

$.hero.prototype.renderWedge = function( color, rotation, offset ) {
	var length = this.gap + (  0.5 + ( Math.sin( this.tick * Math.abs( this.vx ) * 0.01 + offset ) ) / 2 ) * this.gapMove,
		x = Math.cos( $.THIRDPI ) * length,
		y = Math.sin( $.THIRDPI ) * length;
	$.ctx.save();
	$.ctx.rotate( rotation );
	$.ctx.beginPath();
	$.ctx.arc( 0, 0, this.radius, length / ( this.radius * 1.125 ), $.THIRDTAU - length / ( this.radius * 1.125 ), false );
	$.ctx.lineTo( x, y );
	$.ctx.fillStyle( color );
	$.ctx.fill();
	$.ctx.restore();
};

$.hero.prototype.render = function() {
	// main wedges
	$.ctx.save();
		$.ctx.translate( this.x, this.y );
		$.ctx.rotate( this.rotation );
		!$.game.isPerf && $.ctx.globalCompositeOperation( 'overlay' );
		// weird bug in firefox
		!$.game.isPerf && $.game.isChrome && $.ctx.shadowBlur( 30 );
		!$.game.isPerf && $.game.isChrome && $.ctx.shadowColor( '#fff' );
		var alpha = 0.75 + Math.sin( this.tick * Math.abs( this.vx ) *  0.01 ) * 0.25 ;
		this.renderWedge( 'hsla(0, 0%, 100%, ' + alpha + ')', 0, 0 );
		this.renderWedge( 'hsla(120, 0%, 100%, ' + alpha + ')', $.THIRDTAU, 0 );
		this.renderWedge( 'hsla(240, 0%, 100%, ' + alpha + ')', $.THIRDTAU * 2, 0 );
	$.ctx.restore();

	// crescent moon highlight
	if( !$.game.isPerf ) {
		$.ctx.save();
			$.ctx.globalCompositeOperation( 'overlay' );
			if( this.vx > 0 ) {
				$.ctx.drawImage( this.scratch, this.x - this.radius, this.y - this.radius );
			} else {
				$.ctx.translate( this.x + this.radius, this.y + this.radius );
				$.ctx.scale( -1, 1 );
				$.ctx.drawImage( this.scratch, 0, -this.radius * 2 );
			}
		$.ctx.restore();
	}

	// general gradient highlight
	if( !$.game.isPerf ) {
		$.ctx.save();
			$.ctx.globalCompositeOperation( 'overlay' );
			$.ctx.translate( this.x - $.game.heroGradientSize / 2, this.y - $.game.heroGradientSize / 2 );
			$.ctx.fillStyle( $.game.heroGradient );
			$.ctx.fillRect( 0, 0, $.game.heroGradientSize, $.game.heroGradientSize );
		$.ctx.restore();
	}

	// jump body flash
	if( this.jumpTick > 0 ) {
		$.ctx.beginPath();
		$.ctx.arc( this.x, this.y, this.radius, 0, $.TAU )
		$.ctx.fillStyle( 'hsla(0, 0%, 100%, ' + ( ( this.jumpTick / this.jumpTickMax ) * 1 ) + ')' );
		$.ctx.fill();
	}

	// cray cray lighting and trails
	/*$.ctx.save();
		var sh = 10;
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
		$.ctx.strokeStyle( '#fff' );
		$.ctx.lineWidth( 3 );
		!$.game.isPerf && $.ctx.globalCompositeOperation( 'overlay' );
		$.ctx.stroke();
	$.ctx.restore();

	$.ctx.save();
		var sh = 5,
			amt = ~~$.rand( 10, 20 );
		$.ctx.beginPath();
		for( var i = 0; i < amt; i++ ) {
			var p = this.trail[ i ];

			var x = this.x + Math.cos( ( i / amt ) * $.TAU ) * this.radius + $.rand( -sh, sh );
			var y = this.y + Math.sin( ( i / amt ) * $.TAU ) * this.radius + $.rand( -sh, sh );

			if( i == 0 ) {
				$.ctx.moveTo( x, y );
			} else {
				$.ctx.lineTo( x, y );
			}
		}
		$.ctx.closePath()
		$.ctx.strokeStyle( '#fff' );
		$.ctx.lineWidth( $.rand( 1, 10 ) );
		!$.game.isPerf && $.ctx.globalCompositeOperation( 'overlay' );
		$.ctx.stroke();
	$.ctx.restore();

	$.ctx.save();
		$.ctx.beginPath();
		
		var angle = $.rand( 0, $.TAU );
		var x1 = this.x + Math.cos( angle ) * this.radius + $.rand( -sh, sh );
		var y1 = this.y + Math.sin( angle ) * this.radius + $.rand( -sh, sh );
		var x2 = this.x + Math.cos( angle + $.PI ) * this.radius + $.rand( -sh, sh );
		var y2 = this.y + Math.sin( angle + $.PI ) * this.radius + $.rand( -sh, sh );

		$.ctx.moveTo( x1, y1 );
		$.ctx.lineTo( x2, y2 );

		$.ctx.closePath()
		$.ctx.strokeStyle( '#fff' );
		$.ctx.lineWidth( $.rand( 1, 10 ) );
		!$.game.isPerf && $.ctx.globalCompositeOperation( 'overlay' );
		$.ctx.stroke();
	$.ctx.restore();
	*/
};

$.hero.prototype.destroy = function() {
};

$.hero.prototype.jump = function() {
	if( this.grav > 0 ) {
		var sound = $.game.playSound( 'jump' );
		$.game.sound.setVolume( sound, 0.7 );
		$.game.isChrome && $.game.sound.setPanning( sound, ( this.x / $.game.width ) * 2 - 1 );
		$.game.sound.setPlaybackRate( sound, $.rand( 1.9, 2.1 ) );
	} else {
		var sound = $.game.playSound( 'jump' );
		$.game.sound.setVolume( sound, 0.7 );
		$.game.isChrome && $.game.sound.setPanning( sound, ( this.x / $.game.width ) * 2 - 1 );
		$.game.sound.setPlaybackRate( sound, $.rand( 1.2, 1.4 ) );
	}

	this.vy = 0;
	this.grav *= -1;
	this.jumpTick = this.jumpTickMax;
	$.game.state.explosions.create({
		pool: $.game.state.explosions,
		x: this.x,
		y: this.y,
		radius: 50,
		decay: 0.14
	});
};

$.hero.prototype.die = function() {
	var hero  = this;

	$.storage.set( 'deathCount', $.storage.get( 'deathCount' ) + 1 );

	var sound = $.game.playSound( 'explosion-1' );
	$.game.sound.setVolume( sound, 0.4 );
	$.game.isChrome && $.game.sound.setPanning( sound, ( this.x / $.game.width ) * 2 - 1 );
	$.game.sound.setPlaybackRate( sound, $.rand( 0.7, 1.2 ) );
	var sound = $.game.playSound( 'explosion-2' );
	$.game.sound.setVolume( sound, 0.4 );
	$.game.isChrome && $.game.sound.setPanning( sound, ( this.x / $.game.width ) * 2 - 1 );
	$.game.sound.setPlaybackRate( sound, $.rand( 0.7, 1.2 ) );
	var sound = $.game.playSound( 'explosion-3' );
	$.game.sound.setVolume( sound, 0.4 );
	$.game.isChrome && $.game.sound.setPanning( sound, ( this.x / $.game.width ) * 2 - 1 );
	$.game.sound.setPlaybackRate( sound, $.rand( 0.7, 1.2 ) );

	$.game.state.deathTick = $.game.state.deathTickMax;

	// burst
	for( var i = 0, length = ( $.game.isPerf ? 5 : 15 ); i < length; i++ ) {
		var size = $.rand( 1, 4 );
		$.game.state.sparks.create({
			pool: $.game.state.sparks,
			x: hero.x + $.rand( 0, Math.cos( ( i / length ) * $.TAU ) * hero.radius ),
			y: hero.y + $.rand( 0, Math.sin( ( i / length ) * $.TAU ) * hero.radius ),
			angle: ( i / length ) * $.TAU,
			vel: $.rand( 1, 10 ),
			drag: 0.96,
			decay: 0.01,
			w: size,
			h: size,
			burst: true
		});
	};
	// non-burst
	for( var i = 0, length = ( $.game.isPerf ? 10 : 30 ); i < length; i++ ) {
		var size = $.rand( 1, 4 );
		$.game.state.sparks.create({
			pool: $.game.state.sparks,
			x: hero.x + $.rand( 0, Math.cos( ( i / length ) * $.TAU ) * hero.radius ),
			y: hero.y + $.rand( 0, Math.sin( ( i / length ) * $.TAU ) * hero.radius ),
			angle: ( i / length ) * $.TAU,
			vel: $.rand( 1, 10 ),
			drag: 0.96,
			decay: 0.01,
			w: size,
			h: size,
			burst: false
		});
	};

	for( var i = 0; i < 3; i++ ) {
		$.game.state.explosions.create({
			pool: $.game.state.explosions,
			x: hero.x,
			y: hero.y,
			radius: 30 + i * 15,
			decay: 0.02
		});
	}

	// screen shake
	if( this.vx > 0 ) {
		this.x = -this.radius;
	} else {
		this.x = $.game.width + this.radius;
	}
	this.impactAngle = Math.atan2( this.trail[ 5 ][ 1 ] - this.y, this.trail[ 5 ][ 0 ] - this.x );
	$.game.state.shake.translate = 10;
	$.game.state.shake.rotate = 0.15;
	$.game.state.shake.xBias = Math.cos( this.impactAngle ) * 25;
	$.game.state.shake.yBias = Math.sin( this.impactAngle ) * -100;
	//$.game.state.shake.xBias = Math.cos( this.impactAngle ) * ( 25 * Math.abs( this.vx ) );
	//$.game.state.shake.yBias = Math.sin( this.impactAngle ) * ( 25 * Math.abs( this.vy ) );

	$.game.state.deaths++;
};

$.hero.prototype.checkCollisions = function() {
	var hero = this;
	for( var i = 0, length = $.game.state.blocks.length; i < length; i++ ) {
		var block = $.game.state.blocks.getAt( i );
		if( !block.destroying && block.track === $.game.state.currentTrack && $.circleColliding( hero.x, hero.y, hero.radius, block.x + block.size / 2, block.y + block.size / 2, block.hitRadius ) ) {
			block.hitTick = block.hitTickMax;
			//this.impactAngle = Math.atan2( block.y- this.y, block.x - this.x );
			hero.die();
		}
	}
};