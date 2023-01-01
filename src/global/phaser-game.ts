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
};