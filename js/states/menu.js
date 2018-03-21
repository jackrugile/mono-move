$.stateMenu = {};

$.stateMenu.create = function() {
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
};

$.stateMenu.enter = function() {
	var sound = $.game.playSound( 'end-game' );
	$.game.sound.setVolume( sound, 0.7 );
	$.game.sound.setPlaybackRate( sound, 1 );
	
	$.html.classList.add( 'state-menu' );

	this.titleScale = 2;
	this.titleAlpha = 0;

	this.tick = 0;
}

$.stateMenu.leave = function() {
	$.html.classList.remove( 'state-menu' );
};

$.stateMenu.step = function() {
	if( this.tick === 35 ) {
		$.game.tween( this ).to( {
			titleScale: 1,
			titleAlpha: 1
		}, 0.5, 'outExpo' );
		var sound = $.game.playSound( 'logo-1' );
		$.game.sound.setVolume( sound, 0.5 );
		$.game.sound.setPlaybackRate( sound, 1.1 );
	}

	this.tick++;
};

$.stateMenu.render = function() {
	// bg gradient color
	$.ctx.fillStyle( $.game.levels[ 0 ].gradient );
	$.ctx.fillRect( 0, 0, $.game.width, $.game.height );

	// track gradients
	$.ctx.save();
		!$.game.isPerf && $.ctx.globalCompositeOperation( 'overlay' );
		$.ctx.fillStyle( $.game.topGradient );
		$.ctx.fillRect( 0, 0, $.game.width, $.game.height / 3 );
		$.ctx.fillStyle( $.game.midGradient );
		$.ctx.fillRect( 0, $.game.height / 3, $.game.width, $.game.height / 3 );
		$.ctx.fillStyle( $.game.botGradient );
		$.ctx.fillRect( 0, $.game.height - $.game.height / 3, $.game.width, $.game.height / 3 );
	$.ctx.restore();

	// title
	$.ctx.save();
		!$.game.isPerf && $.ctx.globalCompositeOperation( 'overlay' );
		$.ctx.align( 0.5 );
		$.ctx.translate( $.game.width / 2, $.game.height / 2 );
		$.ctx.scale( this.titleScale, this.titleScale );
		$.ctx.a( 0.5 * this.titleAlpha );
		$.ctx.drawImage( $.game.images[ 'title2-glow' ], 0, 0 );
		$.ctx.a( 1 * this.titleAlpha );
		$.ctx.drawImage( $.game.images[ 'title2' ], 0, 0, $.game.images.title2.width, $.game.images.title2.height / 2, 0, -$.game.images.title2.height / 4, $.game.images.title2.width, $.game.images.title2.height / 2 );
		$.ctx.realign();
	$.ctx.restore();

	$.ctx.save();
		!$.game.isPerf && $.ctx.globalCompositeOperation( 'overlay' );
		$.ctx.fillStyle( 'hsla(0, 0%, 100%, ' + this.titleAlpha + ')' );

		$.ctx.font( '40px latowf400' );
		$.ctx.textBaseline( 'middle' );
		$.ctx.textAlign( 'center' );
		$.ctx.fillText( '[ SPACE / CLICK ] TO PLAY', $.game.width / 2, $.game.height - $.game.height / 6 + 15 );

		$.ctx.textBaseline( 'bottom' );
		$.ctx.font( '16px latowf400' );

		$.ctx.textAlign( 'left' );
		$.ctx.fillText( 'PLAY COUNT: ' + $.formatCommas( $.storage.get( 'playCount' ) ), 40, $.game.height - 85 );
		$.ctx.fillText( 'DEATH COUNT: ' + $.formatCommas( $.storage.get( 'deathCount' ) ), 40, $.game.height - 60 );
		var best = $.storage.get( 'deathBest' );
		best = ( best == 99999 ) ? 'N/A' : $.formatCommas( best );
		$.ctx.fillText( 'DEATH BEST: ' + best, 40, $.game.height - 35 );
		$.ctx.textAlign( 'right' );
		$.ctx.fillText( 'BY JACK RUGILE', $.game.width - 40, $.game.height - 85 );
		$.ctx.fillText( 'JACKRUGILE.COM', $.game.width - 40, $.game.height - 60 );
		$.ctx.fillText( '@JACKRUGILE', $.game.width - 40, $.game.height - 35 );

	$.ctx.restore();

	!$.game.isPerf && $.game.renderOverlay();
};

$.stateMenu.pointerdown = function( e ) {
	$.game.setState( $.statePlay );
	if( e.button === 'left' ) {
	} else if( e.button = 'right' ) {
	}
};

$.stateMenu.keydown = function( e ) {
	if( e.key != 'm' && $.game.keyTriggers.indexOf( e.key ) > -1 ) {
		$.game.setState( $.statePlay );
	}
};

$.stateMenu.gamepaddown = function( data ) {
	$.game.setState( $.statePlay );
	if( data.button == 'up' || data.button == 'right' || data.button == 'down' || data.button == 'left' || data.button == 'l1' || data.button == 'l2' ) {
	}
	if( data.button == '1' || data.button == '2' || data.button == '3' || data.button == '4' || data.button == 'r1' || data.button == 'r2' ) {
	}
};