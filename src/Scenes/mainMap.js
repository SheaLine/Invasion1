class MainMap extends Phaser.Scene {
    constructor() {
        super("mainMap");
        this.my = {
            sprite: {},
            text: {}
        };
    }

    init_game(){
        this.gameOver = false;
        //scores
        this.score = 0;
        this.lives = 3;
        this.wave = 1;
        this.kills = 0;

        // speeds
        this.playerSpeed = 5;
        this.bulletSpeed = 5;
        this.alienSpeed = 0.3;
        this.alienSpawnDelay = 1500;
        this.ufoSpeed = 10000;
        this.ufoSpawnDelay = 10000
        this.laserSpeed = 3
        this.laserFrequency = 1000

        // object arrays
        this.aliens = [];
        this.UFOs = [];
        this.lasers = [];
        //this.pauseLasers = false;
    }

    nextWave(){
        // raise difficulty
        this.alienSpawnDelay -= 500
        this.alienSpeed += 0.3
        this.ufoSpawnDelay -= 10
        this.ufoSpeed += 1000
        this.laserFrequency -= 100;
        this.playerSpeed += 0.5

        let my = this.my;
        //pause spawns
        this.alienSpawn.paused = true;
        this.ufoSpawn.paused = true;
        //this.pauseLasers = true;

        //clear enemies
        this.aliens.forEach(alien => {
            alien.destroy();
            alien.para.destroy();
            alien.paraDismount.destroy();
        });
        this.aliens = [];

        this.UFOs.forEach(ufo => {
            ufo.destroy();
            ufo.pauseEvent();

        });
        this.UFOs = [];

        this.lasers.forEach(laser => laser.destroy());
        this.lasers = [];


        this.bulletManager.bullets.forEach(bullet => bullet.destroy());
        this.bulletManager.bullets = [];

        // Max wave levels
        if (this.alienSpawnDelay < 1000) {this.alienSpawnDelay = 1000}
        if (this.ufoSpawnDelay < 1000) {this.ufoSpawnDelay = 1000}
        if (this.laserFrequency < 500) {this.laserFrequency = 500};

        // do animation
        let waveOverText = this.add.text(this.game.config.width/2, this.game.config.height/2, 'Wave Over!',
        { 
            fontFamily: '"Bungee Spice", sans-serif',
            fontSize: '100px'
        }).setOrigin(0.5);
        this.readyGo = this.add.sprite(this.game.config.width/2, this.game.config.height/2,"hud", "text_ready.png");
        this.readyGo.visible = false;
        this.time.delayedCall(2000, () => { // wait to display animation after wave over text
            waveOverText.destroy();  // Remove or hide the text
            this.readyGo.visible = true;
            this.readyGo.play("readyGo");  // Start the next part of the sequence
        });

        this.readyGo.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            //this.scene.resume();
            this.sound.play("waveUp");
            this.alienSpawn.paused = false;
            this.ufoSpawn.paused = false;
            this.UFOs.forEach(ufo => {
                ufo.resumeEvent
            });
        })

        //update hud
        this.wave++;
        my.text.wave.setText("Wave " + this.wave);
    }

    preload() {

        // for map
        this.load.setPath("./assets/");

        // for player
        this.load.atlasXML("player", "spritesheet_jumper.png", "spritesheet_jumper.xml");

        // for bullets
        this.load.atlasXML("bullet", "space_sheet.png", "space_sheet.xml");

        // for aliens
        this.load.atlasXML("alien", "aliens.png", "aliens.xml");

        // for UFOs
        this.load.atlasXML("ufo", "spritesheet_spaceships.png", "spritesheet_spaceships.xml");
        this.load.atlasXML("laser", "spritesheet_lasers.png", "spritesheet_lasers.xml");

        // for explosions
        this.load.atlasXML("boom", "tanks_spritesheetDefault.png", "tanks_spritesheetDefault.xml");

        // Sounds
        this.load.audio("shoot", "laserSmall_002.ogg");
        this.load.audio("explosion", "explosionCrunch_000.ogg");
        this.load.audio("explosionBig", "explosionCrunch_001.ogg");
        this.load.audio("reload", "reload.mp3");
        this.load.audio("landed", "slime_001.ogg");
        this.load.audio("playerDamage", "lowFrequency_explosion_000.ogg");
        this.load.audio("waveUp", "waveup.ogg");

        //text
        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");

    }

    create() {
        let my = this.my;

        // set default vars
        this.init_game();
        
        // for map
        this.map = this.add.tilemap("MainMap", 18,18,15,10);

        this.tileset_skys = this.map.addTilesetImage("sky", "background");
        this.tileset_objects = this.map.addTilesetImage("objects", "pixel_platformer_tiles");
        
        this.skyLayer = this.map.createLayer("Sky", this.tileset_skys, 0,0);
        this.groundLayer = this.map.createLayer("Ground", this.tileset_objects, 0,0);
        this.skyLayer.setScale(4.0);
        this.groundLayer.setScale(4.0);
        

        //keys
        this.left = this.input.keyboard.addKey("A");
        this.right = this.input.keyboard.addKey("D");
        this.reload = this.input.keyboard.addKey("R");
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // for player
        my.sprite.player = new Player(this, game.config.width/2,game.config.height - 175, "player", "jetpack.png", this.left, this.right, this.playerSpeed);
        my.sprite.player.setScale(0.50);

        // for bullets
        this.bulletManager = new BulletManager(this);
        
        // for Aliens
        const alienImageKeys = ["alienBeige_hurt.png", "alienBlue_hurt.png", "alienGreen_hurt.png", "alienPink_hurt.png", "alienYellow_hurt.png"];
        this.alienSpawn = this.time.addEvent({
            delay: this.alienSpawnDelay,
            callback: () => {
                let x = Phaser.Math.Between(20, game.config.width - 20);
                let y = Phaser.Math.Between(-50, -100); 
                let newAlien = new Alien(this, x, y, 'alien', alienImageKeys[Phaser.Math.Between(0, alienImageKeys.length - 1)], this.alienSpeed, true);
                this.aliens.push(newAlien);
            },
            loop: true
        });

        // for UFO paths
        this.pointsBank = [ // predefined coordinates for a particular path
            [
                3.0052080154418945, 196.00519139987594,
                168.0052080154419, 278.0051844486504,
                318.0052080154419, 138.00519631659645,
                516.0052080154419, 235.00518809380526,
                514.0052080154419, 415.0051728350175,
                762.0052080154419, 177.00519301052577,
                1077.005208015442, 167.0051938582362
            ],
            [
                7.0052080154418945, 456.0051722204274,
                242.0052080154419, 423.00517501787186,
                114.0052080154419, 372.00517934119506,
                144.0052080154419, 463.0051716270301,
                403.0052080154419, 468.0051712031749,
                580.0052080154419, 414.0051757808112,
                372.0052080154419, 407.00517637420853,
                475.0052080154419, 497.0051687448146,
                716.0052080154419, 467.0051712879459,
                867.0052080154419, 490.00516933821194,
                948.0052080154419, 558.005163573781,
                1067.005208015442, 433.0051741701614,
                1077.005208015442, 430.00517442447455
            ],
            [
                2.0052080154418945, 382.0051784934846,
                208.0052080154419, 412.0051759503533,
                369.0052080154419, 494.00516899912776,
                483.0052080154419, 593.0051606067944,
                689.0052080154419, 392.0051776457742,
                483.0052080154419, 395.0051773914611,
                598.0052080154419, 333.0051826472657,
                1068.005208015442, 339.0051821386395,
            ],
            [
                0.005208015441894531, 175.00519318006783,
                1079.005208015442, 173.00519334960993
            ]
            
            
        ];
        this.curves = this.pointsBank.map(points => new Phaser.Curves.Spline(points)); //this line creates a spline curve for each set of points in the point bank

        // for UFOs
        const ufoImageKeys = ["shipBeige_manned.png", "shipBlue_manned.png", "shipGreen_manned.png", "shipPink_manned.png", "shipYellow_manned.png"]
        this.ufoSpawn = this.time.addEvent({
            delay: this.ufoSpawnDelay,
            callback: () => {
                
                let selectedCurve = Phaser.Math.RND.pick(this.curves);
                let start = Math.floor(Math.random() * 2); //randomly picks 0 or 1
                let end = start ^ 1; // end is flipped start bit
                let texture = ufoImageKeys[Phaser.Math.Between(0, ufoImageKeys.length - 1)]
                let newUFO = new UFO(this, selectedCurve,'ufo', texture, this.ufoSpeed, start, end);
                this.UFOs.push(newUFO);
            },
            loop: true
        });

        //Hearts that represent lives
        this.threeLives = this.map.createLayer("threeLife", this.tileset_objects, 0,0);
        this.twoLives = this.map.createLayer("twoLife", this.tileset_objects, 0,0);
        this.oneLives = this.map.createLayer("oneLife", this.tileset_objects, 0,0);
        this.threeLives.setScale(4.0);
        this.twoLives.setScale(4.0);
        this.oneLives.setScale(4.0);
        
        //animations
        const alienColors = ['Beige', 'Blue', 'Green', 'Pink', 'Yellow']
        alienColors.forEach(color =>{
            this.anims.create({
                key: `run${color}`,
                frames: this.anims.generateFrameNames('alien', {
                    prefix: `alien${color}_walk`,
                    start: 1,
                    end: 2,
                    zeroPad: 1,
                    suffix: '.png'
                }),
                duration: 300,
                repeat: -1,
            });
        });

        this.anims.create({
            key: "boom",
            frames: this.anims.generateFrameNames('boom', {
                prefix: "tank_explosion",
                start: 1,
                end: 10,
                zeroPad: 1,
                suffix: ".png"
            }),
            frameRate: 20,
            
            hideOnComplete: true
        });

        this.anims.create({
            key: "readyGo",
            frames:[
                {key: "hud", frame: "text_ready.png"},
                {key: "hud", frame: "text_go.png"}
            ],
            duration: 3000,
            hideOnComplete: true
        });

        // Text
        my.text.score = this.add.bitmapText(800, 650, "rocketSquare", "Score " + this.score);
        my.text.ammo = this.add.bitmapText(100, 650, "rocketSquare", "Ammo " + this.bulletManager.bulletsInClip/2);
        my.text.wave = this.add.bitmapText(540, 667, "rocketSquare", "Wave " + this.wave).setOrigin(0.5);
        my.text.score.setBlendMode(Phaser.BlendModes.ADD);
        my.text.ammo.setBlendMode(Phaser.BlendModes.ADD);
        my.text.wave.setBlendMode(Phaser.BlendModes.ADD);

        // HTML Text
        document.getElementById('description').innerHTML = '<h2>Controls: </h2>A: move left <br> D: move right <br> R: Reload <br> Space: shoot <h2>How To Play: </h2>Rule 1: Don\'t let the aliens reach the ground!<br>Rule 2: Don\'t get hit by a UFO laser!<br>Rule 3: Shoot 20 falling aliens to move to next wave!<br> <h2>GOOD LUCK!!</h2>';
        
        //temp 
        // this.nextScene = this.input.keyboard.addKey("I");

    }

    collides(a,b){
        if (Math.abs(a.x - b.x) > (a.displayWidth/2 + b.displayWidth/2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayWidth/2 + b.displayHeight/2)) return false;
        return true;
    }

    updateScore() {
        let my = this.my;
        my.text.score.setText("Score " + this.score);
    }

    

    takeLife() {
        this.lives--;
        switch (this.lives) {
            case 2:
                this.threeLives.setVisible(false);
                this.twoLives.setVisible(true);
                break;
            case 1:
                this.twoLives.setVisible(false);
                this.oneLives.setVisible(true);
                break;
            case 0:
                this.oneLives.setVisible(false);
                // Go to game over scene
                this.gameOver = true;
                this.sound.stopAll();
                this.scene.start("gameOver", {score: this.score, wave: this.wave});
            default:
                break;
        }
    }

    update(){
        let my = this.my;

        //temp
        // if (Phaser.Input.Keyboard.JustDown(this.nextScene)) {
        //     //this.themeSong.stop();
        //     this.sound.play("coin");
        //     this.scene.start("gameOver", {score: this.score, wave: this.wave});
        // }

        if (Phaser.Input.Keyboard.JustDown(this.space)) {
            this.bulletManager.createBullet(my.sprite.player.x - 20, my.sprite.player.y - 50, "bullet", "laserRed03.png", this.bulletSpeed);
            this.bulletManager.createBullet(my.sprite.player.x + 20, my.sprite.player.y - 50, "bullet", "laserRed03.png", this.bulletSpeed);
        }

        if (Phaser.Input.Keyboard.JustDown(this.reload)){
            this.bulletManager.reload();
        }

        // update player
        my.sprite.player.update();

        // update bullets
        this.bulletManager.update();

        // update UFOs
        this.UFOs.forEach(ufo => {
            ufo.update();
        })

        // Update lasers
        this.lasers.forEach((laser, index) => {
            if(laser.active){
                laser.update();
            }else{
                this.lasers.splice(index, 1);
            }
        })

        //update Aliens and check for collisions
        this.aliens.forEach(alien => {
            alien.update();
            
            //checks if alien hits ground
            if(alien.y >= 550 && alien.x <= 1080 && alien.y >= 0){
                alien.alienLanded = true; //performs logic in Alien.js
            }

            //checks if bullet hits alien
            this.bulletManager.bullets.forEach(bullet => {
                if(this.collides(bullet, alien)){
                    this.score++;
                    this.kills++
                    this.updateScore();
                    this.boom = this.add.sprite(alien.x, alien.y, "boom", "tank_explosion1.png").play("boom");
                    alien.visible = false;
                    alien.para.visible = false;
                    alien.y = -100;
                    alien.x = -100;
                    alien.paraDismount.y = -100;
                    bullet.y = -100;
                    this.sound.play("explosion");
                    alien.isWalking = true; // this allows the alien to walk off screen without taking another player life
                    
                }
            });
        });

        //Check for UFO and bullet collisions
        this.UFOs.forEach(ufo => {
            this.bulletManager.bullets.forEach(bullet => {
                if(this.collides(bullet,ufo)){
                    this.score += 2;
                    this.updateScore();
                    this.boom = this.add.sprite(ufo.x, ufo.y, "boom", "tank_explosion1.png").setScale(3.0).play("boom");
                    this.sound.play("explosionBig");
                    bullet.y = -100;
                    ufo.destroy();
                    ufo.dropLaserEvent.remove(false);
                    this.UFOs = this.UFOs.filter(item => item !== ufo);
                }
            })
        })

        //Check for Player and Laser collisions
        this.lasers.forEach(laser => {
            if(this.collides(laser, my.sprite.player)){
                this.takeLife();
                laser.y = 820;
                this.sound.play("playerDamage");
                this.boom = this.add.sprite(my.sprite.player.x, my.sprite.player.y - 50, "boom", "tank_explosion1.png").play("boom");
            }    
        })

        // move to next wave when 20 aliens have been killed
        if(this.kills % 20 === 0 && this.kills != 0){
            this.kills = 0;
            this.nextWave();
        }
    }
}