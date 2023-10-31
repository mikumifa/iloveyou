export default class Canvas {
    constructor(imageUrl, canvas, position) {
        this.imageUrl = imageUrl;
        this.canvas = canvas;
        this.position = position
        this.ctx = this.canvas.getContext('2d');
    }

    draw(position, text) {
        const image = new Image();
        image.src = this.imageUrl;

        image.onload = () => {
            this.ctx.save();

            this.ctx.drawImage(image, this.position.x, this.position.y);
            //this.ctx.rotate(randomAngle);
             //this.ctx.fillText(text, this.position.y+position.y, this.position.x+position.x);
            this.ctx.restore();
            this.ctx.save();
            const MAX_ANGLE = 10;
            const randomAngle = -(Math.round(Math.random() * MAX_ANGLE) % MAX_ANGLE) * randomOp();
            // 设置字体大小和颜色
            this.ctx.translate(this.position.x+position.x, this.position.y+position.y);
            this.ctx.rotate(randomAngle*Math.PI/180);
            this.ctx.font = "bold 220px Arial";
            this.ctx.fillStyle = "black"; // 红色字体颜色
            this.ctx.fillText(text, 0, 0);
            this.ctx.restore();
        };
    }
}

export function randomOp() {
    return Math.floor(Math.random() * 10) % 2 ? 1 : -1;
}
