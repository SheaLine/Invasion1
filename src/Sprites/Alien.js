class Alien extends Phaser.GameObjects.Sprite{
    constructor(scene, x, y, texture, frame, alienSpeed, status){
        super(scene,x,y,texture,frame, status)
        scene.add.existing(this);
        this.alienSpeed = alienSpeed;
        this.setScale(0.80);
        this.para = scene.add.sprite(x, y - this.height / 2 - 20, "player", "flyMan_fly.png");
        this.paraDismount = scene.add.sprite(x, y - this.height / 2 - 20, "player", "flyMan_jump.png");
        this.paraDismount.visible = false;
        this.para.setScale(0.50);
        this.paraDismount.setScale(0.50);
        this.alienLanded = false;
        this.color = frame.split('_')[0];
        this.isWalking = false;
        this.status = status; // true if game running, false if game over
        return this;
    }

    update(){
        if (!this.alienLanded){ // move alien and its parachute down
            this.y += this.alienSpeed;
            this.para.x = this.x;
            this.para.y = this.y - this.height / 2 - 20;

            this.paraDismount.x = this.x;
            this.paraDismount.y = this.y - this.height / 2 - 20;
        }
        // Alien reached the ground
        else if (this.alienLanded){
            this.para.visible = false;
            this.paraDismount.visible = true;
            this.paraDismount.y -= 15;

             //set lives
             if(this.isWalking == false && this.status){
                console.log(this.scene.gameOver);
                this.scene.sound.play("landed");
                this.scene.takeLife();
            }

            // Alien Movement across ground
            if (this.x > 540) {this.x += 3; this.isWalking = true;}
            if (this.x < 540) {this.flipX = true; this.x -= 3; this.isWalking = true;}

            if (this.active){
                //play animations
                switch (this.color) {
                    case "alienBeige":
                        this.play("runBeige", true);
                        break;
                    case "alienBlue":
                        this.play("runBlue", true);
                        break;
                    case "alienGreen":
                        this.play("runGreen", true);
                        break;
                    case "alienPink":
                        this.play("runPink", true);
                        break;
                    case "alienYellow":
                        this.play("runYellow", true);
                        break;
                }
            }

            //destroy when its off screen
            if (this.x > 1080){this.color = null;this.destroy();}
            if (this.x < 0){this.color = null;this.destroy();}
            if (this.paraDismount.y < 0){this.para.destroy(); this.paraDismount.destroy();}
            if (this.paraDismount.y > 720){this.para.destroy(); this.paraDismount.destroy();}
        }
    }


}
