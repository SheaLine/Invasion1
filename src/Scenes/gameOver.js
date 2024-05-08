class GameOver extends Phaser.Scene{
    constructor(){
        super("gameOver");
        this.aliens = [];
        this.my = {
            text: {}
        };
    }
    init(data) {
        this.score = data.score;
        this.wave = data.wave;
    }

    create(){
        let my = this.my;
        document.getElementById('description').innerHTML = '<h2>Thank You For Playing!</h2> <br> Developer: Shea Line <br><br><br> Assets: https://kenney.nl <br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; https://opengameart.org/';
        this.theme = this.sound.add("theme", {volume: 0.1});
        this.theme.play();
        // for map
        this.map = this.add.tilemap("MainMap", 18,18,15,10);

        this.tileset_skys = this.map.addTilesetImage("sky", "background");
        this.tileset_objects = this.map.addTilesetImage("objects", "pixel_platformer_tiles");
        
        this.skyLayer = this.map.createLayer("Sky", this.tileset_skys, 0,0);
        this.groundLayer = this.map.createLayer("Ground", this.tileset_objects, 0,0);
        this.skyLayer.setScale(4.0);
        this.groundLayer.setScale(4.0);

        // Invasion Animations
        // for Aliens
        const alienImageKeys = ["alienBeige_hurt.png", "alienBlue_hurt.png", "alienGreen_hurt.png", "alienPink_hurt.png", "alienYellow_hurt.png"];
        this.alienSpawn = this.time.addEvent({
            delay: 500,
            callback: () => {
                let x = Phaser.Math.Between(20, game.config.width - 20);
                let y = Phaser.Math.Between(-50, -100); 
                let newAlien = new Alien(this, x, y, 'alien', alienImageKeys[Phaser.Math.Between(0, alienImageKeys.length - 1)], 6, false);
                this.aliens.push(newAlien);
            },
            loop: true
        });

        //text
        this.add.sprite(this.game.config.width/2, this.game.config.height/2, "hud", "text_gameover.png");

        this.add.text(this.game.config.width/2, this.game.config.height/2 + 60, 'Press I To Insert Coin',
        { 
            fontFamily: 'Times, serif',
            color:'#FF0000',
            fontSize: '32px'
        }).setOrigin(0.5);

        my.text.score = this.add.bitmapText(this.game.config.width/2, 650, "rocketSquare", "Score " + this.score).setOrigin(0.5);
        my.text.wave = this.add.bitmapText(this.game.config.width/2, 680, "rocketSquare", "Wave " + this.wave).setOrigin(0.5);
        my.text.score.setBlendMode(Phaser.BlendModes.ADD);
        my.text.wave.setBlendMode(Phaser.BlendModes.ADD);




        //keys
        this.nextScene = this.input.keyboard.addKey("I");
    }

    update(){
        if (Phaser.Input.Keyboard.JustDown(this.nextScene)) {
            this.theme.stop();
            this.sound.play("coin");
            this.scene.stop('MainMap');
            this.scene.start("mainMap");
        }

        this.aliens.forEach(alien => {
            alien.update();
            
            //checks if alien hits ground
            if(alien.y >= 550 && alien.x <= 1080 && alien.y >= 0){
                alien.alienLanded = true; //performs logic in Alien.js
            }
        });
    }
}