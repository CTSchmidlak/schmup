// consts
// ----------------------------------------------------------------------------
var STAGE_WIDTH = 800;
var STAGE_HEIGHT = 600;
var DEBUG = true;

// Singletons. One of each should be made in create().
// ----------------------------------------------------------------------------
function Settings() {
	game.stage.backgroundColor = '#202020';
	game.world.setBounds(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
	game.time.advancedTiming = true;

	// isometric stuff
	//	TODO(mbforbes): Play with each of these and see changes / what's needed.
	game.debug.renderShadow = false;
	game.stage.disableVisibilityChange = true;
	game.plugins.add(new Phaser.Plugin.Isometric(game));
	game.load.atlasJSONHash('tileset', 'assets/tileset.png', 'assets/tileset.json');
	game.physics.startSystem(Phaser.Plugin.Isometric.ISOARCADE);
	game.iso.anchor.setTo(0.5, 0.1);

	// random game stuff
	this.helpText = undefined;
	this.lastHover = undefined;

	// funcs
	this.toggleHelp = function() {
		if (this.helpText) {
			this.helpText.destroy();
			this.helpText = undefined;
		} else {
			this.helpText = game.add.text(
				20, game.world.centerY,
				"hi there, welcome to rts", {
					fill: "#BBBBBB"
			});
		}
	};

	this.render = function() {
		if (DEBUG) {
			game.debug.text(
				"fps: " + game.time.fps + " / " + game.time.desiredFps,
				2,
				15,
				"#a7aebe");
			// game.debug.pointer(
			// 	game.input.mousePointer,
			// 	true, // hideIfUp
			// 	'#FF0000', //downColor
			// 	'#aaaaaa',  //upColor
			// 	'#bbbbbb'); //color)
			game.debug.text(
				'mouse: ' + game.input.activePointer.position,
				2, 30, '#a7aebe');
			game.debug.text(
				'last hover: ' + this.lastHover || '(none)',
				2, 45, '#a7aebe');
		}
	};
}
var settings;

var Input = function() {
	// todo: make into a keymap object
	this.keyHelp = game.input.keyboard.addKey(Phaser.Keyboard.H);
	this.keyHelp.onDown.add(settings.toggleHelp, settings);

	// sprite: Phaser.Plugin.Isometric.IsoSprite (sub of Sprite)
	// pointer: Phaser.Pointer
	this.tileOver = function(sprite, pointer) {
		sprite.hover = true;
		settings.lastHover = sprite.position;
	};
	// sprite: Phaser.Plugin.Isometric.IsoSprite (sub of Sprite)
	// pointer: Phaser.Pointer
	this.tileOut = function(sprite, pointer) {
		sprite.hover = false;
	};
};
var input;

var State = function() {
	this.isoGroup = undefined;
	this.water = [];
};
var state;

// globals
// ----------------------------------------------------------------------------
var game = new Phaser.Game(
	STAGE_WIDTH,
	STAGE_HEIGHT,
	Phaser.WEBGL,
	'game',
	{
		preload: preload,
		create: create,
		render: render,
		update: update,
	}
);


// Core game functions.
// ----------------------------------------------------------------------------

function preload() {
	// singletons
	settings = new Settings();

	// sprite testing stuff
	game.load.image('planet', 'assets/sprites/planetRocky.png');
}

function create() {
	// singletons
	input = new Input();
	state = new State();

	state.isoGroup = game.add.group();
	// we won't really be using IsoArcade physics, but I've enabled it anyway so
	// the debug bodies can be seen
	state.isoGroup.enableBody = true;
	state.isoGroup.physicsBodyType = Phaser.Plugin.Isometric.ISOARCADE;

	// sprite testing stuff
	var planet = game.add.sprite(200, 500, 'planet');
	planet.inputEnabled = true;
	planet.hover = false;
	planet.events.onInputOver.add(input.tileOver);
	planet.events.onInputOut.add(input.tileOut);

	// iso demo stuff
	var tileArray = [];
	tileArray[0] = 'water';
	tileArray[1] = 'sand';
	tileArray[2] = 'grass';
	tileArray[3] = 'stone';
	tileArray[4] = 'wood';
	tileArray[5] = 'watersand';
	tileArray[6] = 'grasssand';
	tileArray[7] = 'sandstone';
	tileArray[8] = 'bush1';
	tileArray[9] = 'bush2';
	tileArray[10] = 'mushroom';
	tileArray[11] = 'wall';
	tileArray[12] = 'window';

	var tiles = [
		9, 2, 1, 1, 4, 4, 1, 6, 2, 10, 2,
		2, 6, 1, 0, 4, 4, 0, 0, 2, 2, 2,
		6, 1, 0, 0, 4, 4, 0, 0, 8, 8, 2,
		0, 0, 0, 0, 4, 4, 0, 0, 0, 9, 2,
		0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0,
		11, 11, 12, 11, 3, 3, 11, 12, 11, 11, 11,
		3, 7, 3, 3, 3, 3, 3, 3, 7, 3, 3,
		7, 1, 7, 7, 3, 3, 7, 7, 1, 1, 7
	];

	var size = 32;

	var i = 0, tile;
	for (var y = size; y <= game.physics.isoArcade.bounds.frontY - size; y += size) {
		for (var x = size; x <= game.physics.isoArcade.bounds.frontX - size; x += size) {
			// this bit would've been so much cleaner if I'd ordered the tileArray better, but I can't be bothered fixing it :P
			tile = game.add.isoSprite(
				x,
				y,
				tileArray[tiles[i]].match("water") ? 0 : game.rnd.pick([2, 3, 4]),
				'tileset',
				tileArray[tiles[i]],
				state.isoGroup);
			tile.anchor.set(0.5, 1);
			tile.smoothed = false;
			tile.body.moves = false;

			// trying to make it listen to mouseovers
			tile.inputEnabled = true;
			tile.hover = false;
			tile.events.onInputOver.add(input.tileOver);
			tile.events.onInputOut.add(input.tileOut);

			if (tiles[i] === 4) {
				tile.isoZ += 6;
			}
			if (tiles[i] <= 10 && (tiles[i] < 5 || tiles[i] > 6)) {
				tile.scale.x = game.rnd.pick([-1, 1]);
			}
			if (tiles[i] === 0) {
				state.water.push(tile);
			}
			i++;
		}
	}
}

function update() {
	// iso demo stuff
	state.water.forEach(function (w) {
		w.isoZ = (-2 * Math.sin((game.time.now + (w.isoX * 7)) * 0.004)) + (-1 * Math.sin((game.time.now + (w.isoY * 8)) * 0.005));
		w.alpha = Phaser.Math.clamp(1 + (w.isoZ * 0.1), 0.2, 1);
	});
}

function render() {
	settings.render();

	// iso demo stuff
	var normalColor = 'rgba(189, 221, 235, 0.6)';
	var hoverColor = 'rgba(255, 100, 100, 0.6)';
	state.isoGroup.forEach(function (tile) {
		var color = tile.hover ? hoverColor : normalColor;
		game.debug.body(tile, color, false);
	});
	// game.debug.text(game.time.fps || '--', 2, 14, "#a7aebe");
	// game.debug.text(Phaser.VERSION, 2, game.world.height - 2, "#ffff00");

}
