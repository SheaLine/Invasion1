class UFO extends Phaser.GameObjects.PathFollower{
    constructor(scene, path, texture, frame, ufoSpeed, start, end){
        super(scene, path, -10, 120, texture,frame)
        scene.add.existing(this);
        this.ufoSpeed = ufoSpeed;
        this.health = 2;
        this.setScale(0.80);
        this.startFollow({
            duration: this.ufoSpeed,
            repeat: 0,
            yoyo: false,
            rotateToPath: false,
            ease: 'Linear',
            from: start,
            to: end,
            onComplete: () => {
                // Destroy the follower once the path is complete
                this.destroy();
                this.dropLaserEvent.remove(false);
                //this.scene.UFOs = this.scene.UFOs.filter(item => item !== item instanceof UFO);
            }
        });

        this.color = frame.split('_')[0].split('ship')[1];
        //Drop Lasers
        this.dropLaserEvent = this.scene.time.addEvent({
            delay : this.scene.laserFrequency,
            callback: () => {
               let newLaser =  new Laser(this.scene, this.x, this.y + 92, 'laser', `laser${this.color}1.png`);
               this.scene.lasers.push(newLaser);
            },
            loop: true
        })
    }
    pauseEvent(){
        if(this.dropLaserEvent){
            this.dropLaserEvent.paused = true;
        }
    }
    resumeEvent(){
        if (this.dropLaserEvent){
            this.dropLaserEvent.paused = false;
        }
    }
}

class Laser extends Phaser.GameObjects.Sprite{
    constructor(scene, x, y, texture, frame){
        super(scene, x, y, texture, frame);
        scene.add.existing(this);
    }
    update(){
        this.y += this.scene.laserSpeed;
        if (this.y >= 550){
            this.boom = this.scene.add.sprite(this.x, this.y, "boom", "tank_explosion1.png").play("boom");
            this.destroy();
        }
    }
}