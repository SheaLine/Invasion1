class Bullet extends Phaser.GameObjects.Sprite{
    constructor(scene, x, y, texture, frame, bulletSpeed){
        super(scene, x, y, texture, frame);
        scene.add.existing(this);
        this.bulletSpeed = bulletSpeed;
        this.setScale(0.90);
        return this;
    }

    update(){

        this.y -= this.bulletSpeed;

        if (this.y < -1){
            this.destroy();
        }
        
    }
}

class BulletManager{
    constructor(scene){
        this.scene = scene;
        this.bullets = [];
        this.ammoCount = Infinity; // incase I ever want to implement a max ammo or something like that
        this.clipSize = 10;
        this.bulletsInClip = this.clipSize;
        this.isReloading = false;
        this.alienHit = false;
    }

    createBullet(x, y, texture, frame, bulletSpeed){
        if (this.bulletsInClip > 0 && !this.isReloading){
            const newBullet = new Bullet(this.scene, x, y, texture, frame, bulletSpeed);
            this.scene.sound.play("shoot");
            this.bullets.push(newBullet);
            this.bulletsInClip--;
            this.updateAmmo();
        }
    }

    reload(){
        if (this.ammoCount > 0 && !this.isReloading){
            this.isReloading = true;
            this.scene.time.delayedCall(1000, () =>{
                const reloadAmount = Math.min(this.clipSize, this.ammoCount);
                this.bulletsInClip = reloadAmount;
                this.ammoCount -= reloadAmount;
                this.isReloading = false;
                this.updateAmmo();
            });
            this.scene.sound.play("reload", {seek: 2});
        }
    }

    updateAmmo(){
        // TODO: add current ammo count to the screen UI
        this.scene.my.text.ammo.setText("Ammo " + this.bulletsInClip/2);
    }

    update(){
        this.bullets.forEach((bullet, index) => {
            bullet.update();
            if (!bullet.active){
                this.bullets.splice(index, 1);
            }
        })
    }
}