<template>
  <div class="container">
    <div class="header">
      <h1 class="title">生成图片</h1>
    </div>

    <div class="content">
      <div class="input-group">
        <input v-model="inputText" class="input-text" placeholder="输入中文字" />
        <button class="action-button" @click="generateImages">生成图片</button>
      </div>

      <div class="output-group">
        <div class="output-caption">
          <p class="caption-text">GIF 图片</p>
          <img :src="gifUrl" alt="Generated GIF" data-mode="video" class="output-image" />
        </div>
        <div class="output-caption">
          <p class="caption-text">静态图片</p>
          <img :src="image" alt="Generated Image" class="output-image" />
        </div>
      </div>

      <div class="button-group">
        <button class="action-button" @click="saveImage">保存图片</button>
        <button class="action-button" @click="saveGif">保存GIF</button>
      </div>
    </div>

    <canvas id="canvas" class="hidden-canvas"></canvas>
    <canvas id="gif_canvas" class="hidden-canvas"></canvas>
  </div>
</template>


<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.header {
  text-align: center;
  margin-bottom: 20px;
}

.title {
  font-size: 36px;
  font-weight: bold;
  color: #4285f4; /* Google Blue */
}

.content {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.input-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.input-text {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.action-button {
  padding: 10px 20px;
  background-color: #4285f4; /* Google Blue */
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.action-button:hover {
  background-color: #357ABD; /* Slightly darker blue on hover */
}

.output-group {
  flex-direction: column; /* Stack children vertically */
  margin-bottom: 20px;
}

.output-caption {
  text-align: center;
  margin-bottom: 10px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
}

.caption-text {
  font-weight: bold;
  color: #333; /* Dark text color */
  font-size: 24px;

}

.output-image {
  max-width: 100%;
  height: auto;
}

.button-group {
  text-align: center;
}
.button-group button {
  margin: 10px;
}

.button-group button:first-child {
  margin-left: 0;
}

.button-group button:last-child {
  margin-right: 0;
}
.hidden-canvas {
  display: none;
}
</style>




<script>
import Canvas from "@/components/Canvas";
import image1 from "@/assets/1.png"
import image2 from "@/assets/2.png"
import image3 from "@/assets/3.png"
import GIF from 'gif.js';

export default {
  data() {
    return {
      inputText: "我爱你",
      image: "",
      fontSize: 30,
      gifUrl: "",
    };
  },
  methods: {
    generateImages() {
      const text = (this.inputText || '').trim();
      if (!text) {
        return;
      }

      const gif = new GIF({
        workers: 2,
        quality: 10, // 调整GIF质量，可以根据需要进行调整
        width: 800,  // GIF宽度
        height: 800, // GIF高度
        workerScript: "/iloveyou/gif.worker.js"
      });


      let back_image = [image1, image2, image3]
      let back_position = [
        {x: 85, y: 277},
        {x: 269, y: 751},
        {x: 518, y: 280}
      ]
      let past = -1;
      let canvas = document.getElementById("canvas");
      const gif_canvasList = [];
      let interval = 1
      let pic_width = 800
      let pic_height = 800

      canvas.width = text.length * (pic_width + interval) + interval
      canvas.height = pic_height + 2 * interval

      const charArray = Array.from(text);
      for (let index = 0; index < charArray.length; index++) {
        let gif_canvas = document.createElement("canvas")
        gif_canvas.width = pic_width
        gif_canvas.height = pic_height
        gif_canvasList.push(gif_canvas)
      }
      for (let index = 0; index < charArray.length; index++) {

        const char = charArray[index];
        let randomIndex = Math.floor(Math.random() * back_image.length);
        if (randomIndex === past) {
          randomIndex = (past + 1) % back_image.length;
        }
        past = randomIndex
        const selectedImageUrl = back_image[randomIndex];
        const myCanvas = new Canvas(selectedImageUrl, canvas, {
          x: index * (interval + pic_width) + interval,
          y: interval
        });
        const myGifCanvas = new Canvas(selectedImageUrl, gif_canvasList[index], {
          x: 0,
          y: 0
        });
        myCanvas.draw(back_position[randomIndex], char);
        myGifCanvas.draw(back_position[randomIndex], char);
      }
      // 在Canvas绘制完成后再保存图片
      setTimeout(() => {
        this.image = canvas.toDataURL("image/png");
      }, 100); // 可能需要调整延迟时间


      // 在Canvas绘制完成后再保存图片
      setTimeout(() => {

        for (let i = 0; i < gif_canvasList.length; i++) {
          gif.addFrame(gif_canvasList[i], {delay: 500});
        }

        gif.on('finished', function (blob) {
          this.gifUrl = URL.createObjectURL(blob); // 将生成的 GIF 显示在页面上
        }.bind(this));

        gif.render(); // 开始渲染GIF

      }, 100); // 可能需要调整延迟时间

    },
    saveImage() {
      // 创建一个隐藏的链接元素并设置下载属性，然后模拟用户点击以保存图片
      const link = document.createElement("a");
      link.href = this.image;
      link.download = "generated_image.png"; // 设置保存时的文件名
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    saveGif() {
      // 创建一个隐藏的链接元素并设置下载属性，然后模拟用户点击以保存图片
      const link = document.createElement("a");
      link.href = this.gifUrl;
      link.download = "generated_image.gif"; // 设置保存时的文件名
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  },
  mounted() {
    let canvas = document.getElementById("canvas");
    canvas.style.display = 'none'
    let gif_canvas = document.getElementById("gif_canvas");
    gif_canvas.style.display = 'none'
    this.generateImages();
  }
};
</script>
