import { PhaserGame } from "../global/phaser-game";
import { AssetName } from "../types/asset-name";
import Phaser from "phaser";
import bomb from '../assets/bomb.png';
import sky from '../assets/sky.png';
import ground from '../assets/platform.png';
import dude from '../assets/dude.png';
import star from '../assets/star.png';
import reload from '../assets/reload.png';

export function create(this: Phaser.Scene) {
    this.add.image(400, 300, AssetName.SKY);

    const platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, AssetName.GROUND).setScale(2).refreshBody();
    platforms.create(600, 400, AssetName.GROUND);
    platforms.create(50, 250, AssetName.GROUND);
    platforms.create(750, 220, AssetName.GROUND);

    PhaserGame.player = this.physics.add.sprite(100, 450, 'dude');
    PhaserGame.player.setBounce(0.2);
    PhaserGame.player.setCollideWorldBounds(true);

    PhaserGame.stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    PhaserGame.bombs = this.physics.add.group();
    this.physics.add.collider(PhaserGame.bombs, platforms);
    this.physics.add.collider(PhaserGame.player, PhaserGame.bombs, hitBomb, undefined, this);

    PhaserGame.stars.children.iterate((child: Phaser.Physics.Arcade.Sprite) => {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    const bestScore = Number(localStorage.getItem('best_score') || '0');
    PhaserGame.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px' });
    PhaserGame.bestScoreText = this.add.text(600, 16, `Best: ${bestScore}`, { fontSize: '32px' });

    this.input.keyboard.on('keydown-R', () => {
        this.scene.restart();
        PhaserGame.isGameOver = false;
        PhaserGame.score = 0;
    })

    this.physics.add.collider(PhaserGame.player, platforms);
    this.physics.add.collider(PhaserGame.stars, platforms);
    this.physics.add.overlap(PhaserGame.player, PhaserGame.stars, collectStar, undefined, this);
}

export function update(this: Phaser.Scene) {
    if (PhaserGame.isGameOver) {
        if (PhaserGame.score > PhaserGame.bestScore) {
            localStorage.setItem('best_score', String(PhaserGame.score));
        }
        this.add.text(220, 300, 'Press "R" to restart', { fontSize: '32px', color: 'blue' });
        return;
    }

    const cursors = this.input.keyboard.createCursorKeys();

    if (cursors.up.isDown && PhaserGame.player.body.touching.down) {
        PhaserGame.player.setVelocityY(-330);
    }

    if (cursors.left.isDown) {
        PhaserGame.player.setVelocityX(-160);
        PhaserGame.player.anims.play('left', true);
        return;
    }
    if (cursors.right.isDown) {
        PhaserGame.player.setVelocityX(160);
        PhaserGame.player.anims.play('right', true);
        return;
    }

    PhaserGame.player.setVelocityX(0);
    PhaserGame.player.anims.play('turn');
}


export function preload() {
    this.load.image(AssetName.SKY, sky);
    this.load.image(AssetName.GROUND, ground);
    this.load.image(AssetName.STAR, star);
    this.load.image(AssetName.BOMB, bomb);
    this.load.image(AssetName.RELOAD, reload);
    this.load.spritesheet(AssetName.DUDE, dude, {frameWidth: 32, frameHeight: 48});
}

function collectStar(player: any, star: any) {
    star.disableBody(true, true);
    PhaserGame.score += 10;
    PhaserGame.scoreText.setText('Score: ' + PhaserGame.score);

    if (PhaserGame.stars.countActive(true) === 0) {
        PhaserGame.stars.children.iterate((child: any) => {
            child.enableBody(true, child.x, 0, true, true);
        });

        const x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
        const bomb = PhaserGame.bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;
    }
}

function hitBomb(player: any, bomb: any) {
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    PhaserGame.isGameOver = true;
}