$.statePlay = {};

$.statePlay.create = function() {
	this.tracks = [
		{
			top: 0,
			bot: $.game.height / 3
		},
		{
			top: $.game.height / 3,
			bot: $.game.height / 3 + $.game.height / 3
		},
		{
			top: $.game.height / 3 + $.game.height / 3,
			bot: $.game.height
		}
	];

	// blocks
	this.blocks = new $.pool( $.block, 0 );

	// sparks
	this.sparks = new $.pool( $.spark, 0 );

	// explosions
	this.explosions = new $.pool( $.explosion, 0 );
};

$.statePlay.enter = function() {
	$.storage.set( 'playCount', $.storage.get( 'playCount' ) + 1 );

	var sound = $.game.playSound( 'start-game' );
	$.game.sound.setVolume( sound, 1 );
	$.game.sound.setPlaybackRate( sound, 1 );

	// screen shake
	this.shake = {
		translate: 0,
		rotate: 0,
		x: 0,
		y: 0,
		xTarget: 0,
		yTarget: 0,
		xBias : 0,
		yBias : 0,
		angle: 0,
		angleTarget: 0
	};


	// deaths
	this.deaths = 0;

	// levels
	this.currentLevel = $.game.forceLevel ? ( $.game.forceLevel - 1 ) : 0;

	// tracks
	this.currentTrack = $.game.forceTrack ? ( $.game.forceTrack - 1 ) : 0;

	// track change tick
	this.trackChangeTick = 0;
	this.trackChangeTickMax = 35;

	// setup hero
	var x;
	if( this.currentLevel % 2 === 0 ) {
		if( this.currentTrack === 0 ) {
			x = -$.game.unit / 2;
		} else if( this.currentTrack === 1 ) {
			x = $.game.width + $.game.unit / 2;
		} else {
			x = -$.game.unit / 2;
		}
	} else {
		if( this.currentTrack === 0 ) {
			x = $.game.width + $.game.unit / 2;
		} else if( this.currentTrack === 1 ) {
			x = -$.game.unit / 2;
		} else {
			x = $.game.width + $.game.unit / 2;
		}
	}
	this.hero= new $.hero({
		x: x,
		y: this.tracks[ this.currentTrack ].bot -$.game.unit / 2
	});

	this.lightPosition = { x: 0, y: 0 };

	// death tick
	this.deathTickMax = 20;
	this.deathTick = 0;

	// level setup
	this.generateLevel();

	this.paused = false;

	this.textAlpha = 0;
	$.game.tween( this ).to( { textAlpha: 1 }, 2, 'inOutExpo' );

	this.tutHidden = false;
	this.tutTextAlpha = 0;
	if( this.currentLevel === 0 ) {
		$.game.tween( this ).to( { tutTextAlpha: 1 }, 2, 'inOutExpo' );
	}

	this.startTime = Date.now();
	this.pausedTime = 0;
	this.pausedStartTime = null;
	this.pausedEndTime = null;

	this.winFlag = false;

	this.tick = 0;
}

$.statePlay.leave = function() {
	this.blocks.empty();
	this.sparks.empty();
	this.explosions.empty();

	$.game.scrapeVolTarget = 0;
	if( this.paused ) {
		this.pausedEndTime = Date.now();
		this.pausedTime += this.pausedEndTime - this.pausedStartTime;
	}
	$.game.lastRunTime = Date.now() - this.startTime - this.pausedTime;
	$.game.lastRunDeaths = this.deaths;
	//console.log( $.game.lastRunTime, $.msToString( $.game.lastRunTime ), $.game.lastRunDeaths );
};

$.statePlay.step = function() {
	if( this.paused ) {
		return;
	}

	// handle track flash
	if( this.trackChangeTick > 0 ) {
		this.trackChangeTick--;
	}

	// handle death flash
	if( this.deathTick > 0 ) {
		this.deathTick--;
	}

	// spotlight
	var x = Math.min( Math.max( 0, this.hero.x ), $.game.width );
	var y = Math.min( Math.max( 0, this.hero.y ), $.game.height );
	this.lightPosition.x += ( x - this.lightPosition.x ) * 0.2;
	this.lightPosition.y += ( y - this.lightPosition.y ) * 0.2;

	this.handleScreenShake();
	this.blocks.each( 'step' );
	this.sparks.each( 'step' );
	this.explosions.each( 'step' );
	this.hero.step();

	this.tick++;

	if( this.winFlag ) {
		this.win();
	}
};

$.statePlay.render = function() {
	// bg gradient color
	//$.ctx.fillStyle( this.bgGradient );
	$.ctx.fillStyle( $.game.levels[ this.currentLevel ].gradient );
	$.ctx.fillRect( 0, 0, $.game.width, $.game.height );

	// screen shake
	$.ctx.save();
		if( !this.paused && ( this.shake.translate || this.shake.rotate ) ) {
			$.ctx.translate( $.game.width / 2 + this.shake.x, $.game.height / 2 + this.shake.y );
			$.ctx.rotate( this.shake.angle );
			$.ctx.translate( -$.game.width / 2 + this.shake.x, -$.game.height / 2 + this.shake.y );
		}

		// track gradients
		$.ctx.save();
			!$.game.isPerf && $.ctx.globalCompositeOperation( 'overlay' );
			$.ctx.fillStyle( $.game.topGradient );
			$.ctx.fillRect( -$.game.trackPadding, -$.game.trackPadding, $.game.width + $.game.trackPadding * 2, $.game.height / 3 + $.game.trackPadding );
			$.ctx.fillStyle( $.game.midGradient );
			$.ctx.fillRect( -$.game.trackPadding, $.game.height / 3, $.game.width + $.game.trackPadding * 2, $.game.height / 3 );
			$.ctx.fillStyle( $.game.botGradient );
			$.ctx.fillRect( -$.game.trackPadding, $.game.height - $.game.height / 3, $.game.width + $.game.trackPadding * 2, $.game.height / 3 + $.game.trackPadding );
		$.ctx.restore();

		this.blocks.each( 'render' );
		this.hero.render();
		this.sparks.each( 'render' );
		this.explosions.each( 'render' );
	$.ctx.restore();

	// track change flash
	if( this.trackChangeTick > 0 ) {
		var y;
		if( this.currentTrack === 0 ) {
			y = this.tracks[ 2 ].top;
		} else {
			y = this.tracks[ this.currentTrack - 1 ].top;
		}
		$.ctx.save();			
			$.ctx.beginPath();
			if( $.game.isPerf ) {
				$.ctx.fillStyle( 'hsla(0, 0%, 100%, ' + ( ( this.trackChangeTick / this.trackChangeTickMax ) * 0.25 ) + ')' );
			} else {
				$.ctx.globalCompositeOperation( 'overlay' );
				$.ctx.fillStyle( 'hsla(0, 0%, 100%, ' + ( ( this.trackChangeTick / this.trackChangeTickMax ) * 1 ) + ')' );
			}
			$.ctx.fillRect( 0, y, $.game.width, $.game.height / 3 );
		$.ctx.restore();
	}

	// screen death flash
	if( this.deathTick > 0 ) {
		$.ctx.beginPath();
		$.ctx.fillStyle( 'hsla(0, 0%, 100%, ' + ( ( this.deathTick / this.deathTickMax ) * 0.5 ) + ')' );
		$.ctx.fillRect( 0, 0, $.game.width, $.game.height );
	}

	// spotlight
	if( !$.game.isPerf ) {
		$.ctx.save();
			$.ctx.globalCompositeOperation( 'overlay' );
			$.ctx.a( 0.35 );
			$.ctx.drawImage( $.game.images[ 'light' ], this.lightPosition.x - $.game.width, this.lightPosition.y - $.game.height, $.game.width * 2, $.game.height * 2 );
		$.ctx.restore();
	}

	this.renderUI();

	if( this.paused ) {
		this.renderPause();
	}

	!$.game.isPerf && $.game.renderOverlay();
};

$.statePlay.pointerdown = function( e ) {
	if( !this.paused ) {
		this.hero.jump();
	}
	if( e.button === 'left' ) {
	} else if( e.button = 'right' ) {
	}
};

$.statePlay.keydown = function( e ) {
	if( e.key == 'escape' ) {
		$.game.setState( $.stateMenu );
	} else if( e.key == 'p' ) {
		this.pause();
	} else if( e.key == 'm' ) {
	} else if( $.game.keyTriggers.indexOf( e.key ) > -1 ) {
		if( !this.paused ) {
			this.hero.jump();
		}
	}
};

$.statePlay.gamepaddown = function( data ) {
	if( !this.paused ) {
		this.hero.jump();
	}
	if( data.button == 'up' || data.button == 'right' || data.button == 'down' || data.button == 'left' || data.button == 'l1' || data.button == 'l2' ) {
	}
	if( data.button == '1' || data.button == '2' || data.button == '3' || data.button == '4' || data.button == 'r1' || data.button == 'r2' ) {
	}
};

$.statePlay.handleScreenShake = function() {
	this.shake.xBias *= 0.9;
	this.shake.yBias *= 0.9;

	if( this.shake.translate > 0 ) {
		this.shake.translate *= 0.9;
		this.shake.xTarget = $.rand( -this.shake.translate, this.shake.translate ) + this.shake.xBias;
		this.shake.yTarget = $.rand( -this.shake.translate, this.shake.translate ) + this.shake.yBias;
	} else {
		this.shake.xTarget = 0;
		this.shake.yTarget = 0;
	}

	if( this.shake.rotate > 0 ) {
		this.shake.rotate *= 0.9;
		this.shake.angleTarget = $.rand( -this.shake.rotate, this.shake.rotate );
	} else {
		this.shake.angleTarget = 0;
	}

	this.shake.x += ( this.shake.xTarget - this.shake.x ) * 0.25;
	this.shake.y += ( this.shake.yTarget - this.shake.y ) * 0.25;
	this.shake.angle += ( this.shake.angleTarget - this.shake.angle ) * 0.25;
};

$.statePlay.getTrack = function() {
	return this.tracks[ this.currentTrack ];
};

$.statePlay.generateLevel = function() {
	for( var col = 0; col < $.game.levels[ this.currentLevel ].map.width; col++ ) {
		for( var row = 0; row < $.game.levels[ this.currentLevel ].map.height; row++ ) {
			var val = $.game.levels[ this.currentLevel ].map.layers[ 1 ].data[ ( $.game.levels[ this.currentLevel ].map.width * row ) + col ];
			if( val === 1 ) {
				var x = col * $.game.unit,
					y = row * $.game.unit,
					track;
				if( y < this.tracks[ 0 ].bot ) {
					track = 0;
				} else if( y < this.tracks[ 1 ].bot ) {
					track = 1;
				} else if( y < this.tracks[ 2 ].bot ) {
					track = 2;
				}
				this.blocks.create({
					pool: this.blocks,
					x: x,
					y: y,
					size: $.game.unit,
					track: track
				});
			}
		}
	}
};

$.statePlay.destroyLevel = function() {
	this.blocks.each( 'destroy' );
};

$.statePlay.pause = function() {
	if( this.paused ) {
		this.paused = false;
		$.html.classList.remove( 'paused' );
		this.pausedEndTime = Date.now();
		this.pausedTime += this.pausedEndTime - this.pausedStartTime;
	} else {
		this.paused = true;
		$.game.scrapeVolTarget = 0;
		$.html.classList.add( 'paused' );
		this.pausedStartTime = Date.now();
	}
};

$.statePlay.renderUI = function() {
	$.ctx.save();
		!$.game.isPerf && $.ctx.globalCompositeOperation( 'overlay' );

		// hide tut text after level 1
		if( this.currentLevel > 0 ) {
			if( !this.tutHidden ) {
				this.tutHidden = true;
				$.game.tween( this ).to( { tutTextAlpha: 0 }, 1, 'outExpo' );
			}
		}

		// tutorial
		$.ctx.textBaseline( 'middle' );
		$.ctx.textAlign( 'center' );
		$.ctx.font( '40px latowf400' );
		$.ctx.fillStyle( 'hsla(0, 0%, 100%, ' + this.tutTextAlpha + ')' );
		$.ctx.fillText( '[ SPACE / CLICK ] TO SWITCH GRAVITY', $.game.width / 2, $.game.height / 3 / 2 );
		$.ctx.fillText( 'AVOID THE OBSTACLES', $.game.width / 2, $.game.height / 2 );
		$.ctx.fillText( 'STAY CALM', $.game.width / 2, $.game.height - $.game.height / 3 / 2  );

		// styles
		$.ctx.textBaseline( 'top' );
		$.ctx.font( '60px latowf400' );
		$.ctx.fillStyle( 'hsla(0, 0%, 100%, ' + this.textAlpha + ')' );

		// death display
		var deathShake = ( this.deathTick / this.deathTickMax ) * 10;
		$.ctx.textAlign( 'left' );
		$.ctx.fillText( $.pad( this.deaths, 3 ), 40 + $.rand( -deathShake, deathShake ), 40 + $.rand( -deathShake, deathShake ) );

		// level display
		$.ctx.textAlign( 'right' );
		$.ctx.fillText( ( this.currentLevel + 1 ) + '/' + $.game.levels.length, $.game.width - 40, 40 );

		// death label
		$.ctx.font( '18px latowf400' );
		$.ctx.textAlign( 'left' );
		$.ctx.fillText( 'DEATHS', 40 + $.rand( -deathShake, deathShake ) , 100 + $.rand( -deathShake, deathShake )  );

		// level label
		$.ctx.textAlign( 'right' );
		$.ctx.fillText( 'LEVEL', $.game.width - 40, 100 );

		// controls display
		$.ctx.textBaseline( 'bottom' );
		$.ctx.font( '16px latowf400' );
		$.ctx.textAlign( 'left' );
		$.ctx.fillText( '[ P ] PAUSE', 40, $.game.height - 85 );
		$.ctx.fillText( '[ M ] MUTE', 40, $.game.height - 60 );
		$.ctx.fillText( '[ ESC ] MENU', 40, $.game.height - 35 );
	$.ctx.restore();
};

$.statePlay.renderPause = function() {
	$.ctx.fillStyle( 'hsla(0, 0%, 0%, 0.6)' );
	$.ctx.fillRect( 0, 0, $.game.width, $.game.height );
	$.ctx.textAlign( 'center' );
	$.ctx.textBaseline( 'middle' );

	$.ctx.font( '80px latowf400' );
	$.ctx.fillStyle( '#fff' );
	$.ctx.fillText( 'PAUSED', $.game.width / 2, $.game.height / 2 - 30 );
	$.ctx.font( '30px latowf400' );
	$.ctx.fillText( '[ P ] RESUME                [ M ] MUTE                [ ESC ] MENU', $.game.width / 2, $.game.height / 2 + 60 );
};

$.statePlay.win = function() {
	var sound = $.game.playSound( 'win-game' );
	$.game.sound.setVolume( sound, 1 );
	$.game.sound.setPlaybackRate( sound, 1 );
	$.game.setState( $.stateWin );
};