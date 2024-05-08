class Title extends Phaser.Scene{
    constructor(){
        super("title");
    }
    preload(){
        this.load.setPath("./assets/");
        this.load.atlasXML("hud", "spritesheet_hud.png", "spritesheet_hud.xml");

        // for Map
        this.load.image("background", "backgroundForest.png");
        this.load.image("pixel_platformer_tiles", "tilemap_packed.png");
        this.load.tilemapTiledJSON("MainMap", "MainMap.json");

        // audio
        this.load.audio("coin", "coin.ogg");
        this.load.audio("theme", "night_tune3.ogg");
    }
    create(){
        this.themeSong = this.sound.add("theme");
        this.themeSong.play();
        
        // for map
        this.map = this.add.tilemap("MainMap", 18,18,15,10);

        this.tileset_skys = this.map.addTilesetImage("sky", "background");
        this.tileset_objects = this.map.addTilesetImage("objects", "pixel_platformer_tiles");
        
        this.skyLayer = this.map.createLayer("Sky", this.tileset_skys, 0,0);
        this.groundLayer = this.map.createLayer("Ground", this.tileset_objects, 0,0);
        this.skyLayer.setScale(4.0);
        this.groundLayer.setScale(4.0);

        
        // text
        this.add.text(this.game.config.width/2, this.game.config.height/2, 'INVASION 1',
        { 
            fontFamily: '"Bungee Spice", sans-serif',
            //fontWeight: '400',
            //fontStyle: 'Normal',
            //color:'#50C878',
            fontSize: '100px'
        }).setOrigin(0.5);

        this.add.text(this.game.config.width/2, this.game.config.height/2 + 80, 'Press I To Insert Coin',
        { 
            fontFamily: 'Times, serif',
            color:'#50C878',
            fontSize: '32px'
        }).setOrigin(0.5);

        //keys
        this.nextScene = this.input.keyboard.addKey("I");

    }

    update(){
        
        if (Phaser.Input.Keyboard.JustDown(this.nextScene)) {
            this.themeSong.stop();
            this.sound.play("coin");
            this.scene.start("mainMap");
        }
    }
    
}
