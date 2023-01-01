import Phaser from "phaser";
import { create, preload, update } from "./game/actions";

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 300},
            debug: false
        }
    },
    scene: {
        preload,
        create,
        update
    }
};

const game = new Phaser.Game(config);