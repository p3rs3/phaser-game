import Phaser from "phaser";

const preload = () => {}
const create = () => {}
const update = () => {}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload,
        create,
        update
    }
};

const game = new Phaser.Game(config);
console.log(game);