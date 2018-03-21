/*==============================================================================

Core

==============================================================================*/


var width = 2560,
	height = 1440,
	ratio = height / width,
	unit = 80,
	base,
	scale;

if( window.innerWidth > window.innerHeight / ratio ) {
	scale = ( window.innerHeight / ratio ) / width;
} else {
	scale = ( window.innerWidth * ratio ) / height;
}

$.game = playground({
	background: '#000',
	width: width,
	height: height,
	scale: scale,
	smoothing: true,
	paths: {
		fonts: 'fonts/'
	}
});

$.game.setScale = function() {
	if( window.innerWidth > window.innerHeight / ratio ) {
		scale = ( window.innerHeight / ratio ) / width;
	} else {
		scale = ( window.innerWidth * ratio ) / height;
	}

	//base = unit / height * 100000;
	//scale = $.snapTo( scale * 100000, base );
	//scale = scale / 100000;
	this.scale = scale;
};

$.game.create = function() {
	$.ctx = this.layer;
	$.html = document.querySelector( 'html' );
	$.body = document.querySelector( 'body' );

	this.isChrome = window.chrome;
	this.isPerf = parseInt( $.get( 'perf' ), 10 ) === 1;
	this.isDebug = parseInt( $.get( 'debug' ), 10 ) === 1;
	this.isSelect = parseInt( $.get( 'select' ), 10 ) === 1;
	this.forceLevel = parseInt( $.get( 'level' ), 10 );
	this.forceTrack = parseInt( $.get( 'track' ), 10 );

	if( this.isPerf ) {
		$.html.classList.add( 'perf' );
	}

	if( this.isDebug ) {
		$.html.classList.add( 'debug' );
	}

	if( this.isSelect ) {
		$.html.classList.add( 'select' );
	}

	// common units
	/*
	1
	2
	4
	5
	8
	10
	16
	20
	32
	40
	80
	160
	*/

	this.unit = unit;
	this.lastRunTime = null;
	this.lastRunDeaths = null;

	// default time
	this.dt = 0.016;
	this.dtMs = 16;
	this.dtNorm = 1;
	this.time = 0;
	this.timeMs = 0;
	this.timeNorm = 0;

	// fonts
	this.loadFonts(
		'lato-thin-webfont',
		'lato-light-webfont',
		'lato-regular-webfont',
		'lato-medium-webfont'
	);

	// images
	this.loadImages(
		//'title',
		//'title-glow',
		'title2',
		'title2-glow',
		'light'
	);

	// sounds
	this.loadSounds(
		'music-1',
		'jump-land',
		'jump',
		'track-change',
		'level-change',
		'explosion-1',
		'explosion-2',
		'explosion-3',
		'scrape',
		'start-game',
		'win-game',
		'end-game',
		'logo-1',
		'logo-2'
	);

	this.loadData( 
		'level1',
		'level2',
		'level3',
		'level4',
		'level5',
		'level6',
		'level7',
		'level8',
		'level9'
	);

	// overlay
	this.overlayTimer = {
		current: 0,
		target: 1,
		index: 0,
		max: 5
	};

	// vignette
	this.vignetteGradient = $.ctx.createRadialGradient(
		this.width / 2,
		this.height / 2,
		0,
		this.width / 2,
		this.height / 2,
		this.height
	);
	//this.vignetteGradient.addColorStop( 0, 'hsla(0, 0%, 100%, 1)' );
	//this.vignetteGradient.addColorStop( 1, 'hsla(0, 0%, 0%, 1)' );
	this.vignetteGradient.addColorStop( 0, 'hsla(0, 0%, 100%, 0.5)' );
	this.vignetteGradient.addColorStop( 1, 'hsla(0, 0%, 0%, 0.5)' );

	// hero gradient
	this.heroGradientSize = this.unit;
	this.heroGradient = $.ctx.createRadialGradient( this.heroGradientSize / 2, this.heroGradientSize / 2, 0, this.heroGradientSize / 2, this.heroGradientSize / 2, this.heroGradientSize / 2 );
	this.heroGradient.addColorStop( 0, 'hsla(0, 0%, 100%, 0.4)' );
	this.heroGradient.addColorStop( 1, 'hsla(0, 0%, 100%, 0)' );

	// block gradient
	this.blockGradient = $.ctx.createLinearGradient( this.unit, 0, 0, this.unit );
	this.blockGradient.addColorStop( 0, 'hsla(0, 0%, 0%, 0.15)' );
	this.blockGradient.addColorStop( 1, 'hsla(0, 0%, 0%, 0.8)' );


	// track padding for screen shake
	this.trackPadding = 100;

	// top gradient
	this.topGradient = $.ctx.createLinearGradient( 0, 0, 0, $.game.height / 3 );
	this.topGradient.addColorStop( 0, 'hsla(0, 0%, 0%, 0.1)' );
	this.topGradient.addColorStop( 1, 'transparent' );

	// mid gradient
	this.midGradient = $.ctx.createLinearGradient( 0, $.game.height / 3, 0, $.game.height - $.game.height / 3 );
	this.midGradient.addColorStop( 0, 'hsla(0, 0%, 0%, 0.3)' );
	this.midGradient.addColorStop( 1, 'transparent' );

	// bot gradient
	this.botGradient = $.ctx.createLinearGradient( 0, $.game.height - $.game.height / 3, 0, $.game.height );
	this.botGradient.addColorStop( 0, 'hsla(0, 0%, 0%, 0.4)' );
	this.botGradient.addColorStop( 1, 'transparent' );

	// storage
	$.storage = new $.storage( 'mono-move' );

	if( $.isObjEmpty( $.storage.obj ) ) {
		$.storage.set( 'mute', 0 );
		$.storage.set( 'playCount', 0 );
		$.storage.set( 'deathCount', 0 );
		$.storage.set( 'deathBest', 99999 );
	}

	this.musicVol = 0.6

	if( $.storage.get( 'mute' ) ) {
		this.sound.setMaster( 0 );
		this.music.setMaster( 0 );
	} else {
		this.sound.setMaster( 1 );
		this.music.setMaster( this.musicVol );
	}

	window.addEventListener( 'resize', this.customResize );

	(function() {
	  var hidden = "hidden";

	  // Standards:
	  if (hidden in document)
	    document.addEventListener("visibilitychange", onchange);
	  else if ((hidden = "mozHidden") in document)
	    document.addEventListener("mozvisibilitychange", onchange);
	  else if ((hidden = "webkitHidden") in document)
	    document.addEventListener("webkitvisibilitychange", onchange);
	  else if ((hidden = "msHidden") in document)
	    document.addEventListener("msvisibilitychange", onchange);
	  // IE 9 and lower:
	  else if ("onfocusin" in document)
	    document.onfocusin = document.onfocusout = onchange;
	  // All others:
	  else
	    window.onpageshow = window.onpagehide
	    = window.onfocus = window.onblur = onchange;

	  function onchange (evt) {
	    var v = "visible", h = "hidden",
	        evtMap = {
	          focus:v, focusin:v, pageshow:v, blur:h, focusout:h, pagehide:h
	        };

	    evt = evt || window.event;
	    if (evt.type in evtMap)
	      document.body.className = evtMap[evt.type];
	    else
	    	if( this[hidden] ) {
	    		$.game.customBlur();
	    	} else {
	    		$.game.customFocus();
	    	}
	      document.body.className = this[hidden] ? "hidden" : "visible";
	  }

	  // set the initial state (but only if browser supports the Page Visibility API)
	  if( document[hidden] !== undefined )
	    onchange({type: document[hidden] ? "blur" : "focus"});
	})();

};

$.game.ready = function() {
	this.music.play( 'music-1', true );

	this.levels = [
		{
			map: this.data[ 'level1' ],
			vx: 10
		},
		{
			map: this.data[ 'level2' ],
			vx: 11
		},
		{
			map: this.data[ 'level3' ],
			vx: 12
		},
		{
			map: this.data[ 'level4' ],
			vx: 13
		},
		{
			map: this.data[ 'level5' ],
			vx: 14
		},
		{
			map: this.data[ 'level6' ],
			vx: 15
		},
		{
			map: this.data[ 'level7' ],
			vx: 16
		},
		{
			map: this.data[ 'level8' ],
			vx: 17
		},
		{
			map: this.data[ 'level9' ],
			vx: 18
		}
	];

	for( var i = 0; i < this.levels.length; i++ ) {
		var hue = ( i / ( this.levels.length ) ) * ( 360 - ( 1 / this.levels.length ) );
		if( this.isPerf ) {
			this.levels[ i ].color1 = 'hsl( ' + hue + ', 55%, 45%)';
			this.levels[ i ].color2 = 'hsl( ' + ( hue - 75 ) + ', 55%, 45%)';
		} else {
			this.levels[ i ].color1 = 'hsl( ' + hue + ', 50%, 55%)';
			this.levels[ i ].color2 = 'hsl( ' + ( hue - 75 ) + ', 50%, 55%)';
		}
		this.levels[ i ].gradient = $.ctx.createLinearGradient( $.game.width, 0, 0, $.game.height );
		this.levels[ i ].gradient.addColorStop( 0, this.levels[ i ].color1 );
		this.levels[ i ].gradient.addColorStop( 1, this.levels[ i ].color2 );
	}

	this.keyTriggers = [
		'w', 'a', 's', 'd',
		'up', 'left', 'down', 'right',
		'space'
	];

	this.scrapeVol = 0;
	this.scrapeVolTarget = 0;
	this.scrapeSound = this.playSound( 'scrape', true );
	this.sound.setVolume( this.scrapeSound, this.scrapeVol );
	this.sound.setPlaybackRate( this.scrapeSound, 1.5 );

	this.setState( $.stateMenu );
};

$.game.step = function( dt ) {
	this.manageTime( dt );

	this.scrapeVol += ( this.scrapeVolTarget - this.scrapeVol ) * 0.2;
	this.sound.setVolume( this.scrapeSound, this.scrapeVol );
};

$.game.customResize = function() {
	$.game.setScale();
	$.game.resizelistener();
};

$.game.customBlur = function() {
	$.game.sound.setMaster( 0 );
	$.game.music.setMaster( 0 );
};

$.game.customFocus = function() {
	var muted = $.storage.get( 'mute' );
	if( !muted ) {
		$.game.sound.setMaster( 1 );
		$.game.music.setMaster( this.musicVol );
	}
	$.game.setScale();
	$.game.resizelistener();
};

$.game.keydown = function( e ) {
	if( e.key == 'm' ) {
		var muted = $.storage.get( 'mute' );
		if( muted ) {
			$.storage.set( 'mute', 0 );
			this.sound.setMaster( 1 );
			this.music.setMaster( this.musicVol );
		} else {
			$.storage.set( 'mute', 1 );
			this.sound.setMaster( 0 );
			this.music.setMaster( 0 );
		}
	}
};

/*==============================================================================

Custom

==============================================================================*/

$.game.manageTime = function( dt ) {
	this.dt = dt;
	this.dtMs = this.dt * 1000;
	this.dtNorm = this.dt * 60;

	this.time += this.dt;
	this.timeMs += this.dtMs;
	this.timeNorm += this.dtNorm;
}

$.game.renderOverlay = function() {
	$.ctx.save();
	$.ctx.globalCompositeOperation( 'overlay' );
	$.ctx.fillStyle( this.vignetteGradient );
	$.ctx.fillRect( 0, 0, this.width, this.height );
	$.ctx.restore();
};