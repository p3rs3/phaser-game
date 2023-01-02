import Phaser from "phaser";

export class PhaserGame {
    static player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    static score: number = 0;
    static bestScore: number = 0;
    static scoreText: Phaser.GameObjects.Text;
    static bestScoreText: Phaser.GameObjects.Text;
    static isGameOver: boolean = false;
    static bombs: Phaser.Physics.Arcade.Group;
    static stars: Phaser.Physics.Arcade.Group;
    static jumpSound: Phaser.Sound.BaseSound;
    static backgroundSound: Phaser.Sound.BaseSound;
    static runSound: Phaser.Sound.BaseSound;
    static collectSound: Phaser.Sound.BaseSound;
    static gameOverSound: Phaser.Sound.BaseSound;
    static isSoundMute: boolean = false;
    static mute: Phaser.Types.Physics.Arcade.ImageWithStaticBody;
    static volume: Phaser.Types.Physics.Arcade.ImageWithStaticBody;
    static sound: Phaser.Types.Physics.Arcade.ImageWithStaticBody;
};