import { PhaserGame } from "../global/phaser-game";
import { AssetName } from "../types/asset-name";
import { SoundName } from "../types/sound-name";
import Phaser from "phaser";
import bomb from '../assets/bomb.png';
import sky from '../assets/sky.png';
import ground from '../assets/platform.png';
import dude from '../assets/dude.png';
import star from '../assets/star.png';
import mute from '../assets/mute.png';
import volume from '../assets/volume.png';
import reload from '../assets/reload.png';
import jump from '../assets/sounds/jump.mp3';
import background from '../assets/sounds/background.mp3';
import run from '../assets/sounds/run.mp3';
import collect from '../assets/sounds/collect.wav';
import gameOver from '../assets/sounds/game-over.mp3';

export function create(this: Phaser.Scene) {
    this.add.image(400, 300, AssetName.SKY);

    PhaserGame.jumpSound = this.sound.add(SoundName.JUMP);
    PhaserGame.runSound = this.sound.add(SoundName.RUN);
    PhaserGame.collectSound = this.sound.add(SoundName.COLLECT);
    PhaserGame.gameOverSound = this.sound.add(SoundName.GAME_OVER);
    PhaserGame.backgroundSound = this.sound.add(SoundName.BACKGROUND);

    playSound(() => {
        PhaserGame.backgroundSound.play({
            loop: true,
            volume: 0.2
        });
    })

    if (PhaserGame.isSoundMute) {
        PhaserGame.sound = this.physics.add.staticImage(750, 80, AssetName.MUTE);
    } else {
        PhaserGame.sound = this.physics.add.staticImage(750, 80, AssetName.VOLUME);
    }

    this.input.on('gameobjectup', (pointer: any, gameObject: any) => {
        gameObject.emit('clicked', gameObject);
    }, this);

    PhaserGame.sound.setInteractive();
    PhaserGame.sound.on('clicked', toggleIsMute, this);

    
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
        PhaserGame.backgroundSound.destroy();
        PhaserGame.runSound.destroy();
        PhaserGame.isGameOver = false;
        PhaserGame.score = 0;
    })

    this.physics.add.collider(PhaserGame.player, platforms);
    this.physics.add.collider(PhaserGame.stars, platforms);
    this.physics.add.overlap(PhaserGame.player, PhaserGame.stars, collectStar, undefined, this);
}

export function update(this: Phaser.Scene) {
    if (PhaserGame.isGameOver) {
        if (!PhaserGame.gameOverSound.isPlaying) {
            this.sound.stopAll();
        }
        if (PhaserGame.score > PhaserGame.bestScore) {
            localStorage.setItem('best_score', String(PhaserGame.score));
        }
        this.add.text(220, 300, 'Press "R" to restart', { fontSize: '32px', color: 'blue' });
        return;
    }

    const cursors = this.input.keyboard.createCursorKeys();

    if (cursors.up.isDown && PhaserGame.player.body.touching.down) {
        playSound(() => {
            PhaserGame.jumpSound.play();
        })
        PhaserGame.player.setVelocityY(-330);
    }

    if (cursors.left.isDown) {
        PhaserGame.player.setVelocityX(-160);
        if (!PhaserGame.runSound.isPlaying) {
            playSound(() => {
                PhaserGame.runSound.play({loop: true});            
            })
        }
        return;
    }
    if (cursors.right.isDown) {
        PhaserGame.player.setVelocityX(160);
        PhaserGame.player.anims.play('right', true);
        if (!PhaserGame.runSound.isPlaying) {
            playSound(() => {
                PhaserGame.runSound.play({loop: true});
            })
        }
        return;
    }

    PhaserGame.runSound.stop();
    PhaserGame.player.setVelocityX(0);
    PhaserGame.player.anims.play('turn');
}


export function preload(this: Phaser.Scene) {
    this.load.image(AssetName.VOLUME, volume);
    this.load.image(AssetName.MUTE, mute);
    this.load.audio(SoundName.JUMP, jump);
    this.load.audio(SoundName.BACKGROUND, background);
    this.load.audio(SoundName.COLLECT, collect);
    this.load.audio(SoundName.RUN, run);
    this.load.audio(SoundName.GAME_OVER, gameOver);
    this.load.image(AssetName.SKY, sky);
    this.load.image(AssetName.GROUND, ground);
    this.load.image(AssetName.STAR, star);
    this.load.image(AssetName.BOMB, bomb);
    this.load.image(AssetName.RELOAD, reload);
    this.load.spritesheet(AssetName.DUDE, dude, {frameWidth: 32, frameHeight: 48});
    
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(240, 270, 320, 50);

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const loadingText = this.make.text({
        x: width / 2,
        y: height / 2 - 50,
        text: 'Loading...',
        style: {
            font: '20px monospace',
        }
    });
    loadingText.setOrigin(0.5, 0.5);

    const percentText = this.make.text({
        x: width / 2,
        y: height / 2 - 5,
        text: '0%',
        style: {
            font: '18px monospace',
        }
    });
    percentText.setOrigin(0.5, 0.5);

    const assetText = this.make.text({
        x: width / 2,
        y: height / 2 + 50,
        text: '',
        style: {
            font: '18px monospace',
        }
    });
    assetText.setOrigin(0.5, 0.5);


    this.load.on('progress', function (value: string) {
        percentText.setText(parseInt(value) * 100 + '%');
        progressBar.clear();
        progressBar.fillStyle(0xffffff, 1);
        progressBar.fillRect(250, 280, 300 * Number(value), 30);
});
                
    this.load.on('fileprogress', function (file: any) {
        assetText.setText('Loading asset: ' + file.key);
    });

    this.load.on('complete', () => {
        progressBar.destroy();
        progressBox.destroy();
        loadingText.destroy();
        percentText.destroy();
    })
}

function collectStar(player: any, star: any) {
    star.disableBody(true, true);
    playSound(() => {
        PhaserGame.collectSound.play();
    })
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
    playSound(() => {
        PhaserGame.gameOverSound.play();
    })
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    PhaserGame.isGameOver = true;
}

function toggleIsMute(this: Phaser.Scene) {
    if (PhaserGame.isSoundMute) {
        PhaserGame.isSoundMute = false;
        PhaserGame.sound.setTexture(AssetName.VOLUME);
        this.sound.mute = false;
        this.game.sound.resumeAll();
        
        PhaserGame.backgroundSound.play({
            loop: true,
            volume: 0.2
        });

        return;
    }

    PhaserGame.isSoundMute = true;
    PhaserGame.sound.setTexture(AssetName.MUTE);
    this.game.sound.stopAll();
}

function playSound(callback: () => void) {
    if (!PhaserGame.isSoundMute) {
        callback();
    }
}