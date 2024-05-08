// Jim Whitehead
// Created: 4/14/2024
// Phaser: 3.70.0
//
// Cubey
//
// An example of putting sprites on the screen using Phaser
// 
// Art assets from Kenny Assets "Shape Characters" set:
// https://kenney.nl/assets/shape-characters

// debug with extreme prejudice
"use strict"


// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    width: 1080,         // 10 tiles, each 18 pixels, scaled 4x
    height: 720,
    fps: { forceSetTimeOut: true, target: 60 },
    scene: [Title, MainMap, GameOver]
    
}

const game = new Phaser.Game(config);