<template>
  <div class="container">
    <div class="header">
      <h1 class="title">I Love You</h1>
    </div>

    <div class="content">
      <div class="input-group">
        <input v-model="inputText" class="input-text" placeholder="输入中文字"/>
        <button class="action-button" @click="generateImages">生成图片</button>
      </div>

      <div class="output-group">
        <div class="output-caption">
          <p class="caption-text">GIF 图片</p>
          <img :src="gifUrl" alt="Generating Image..." data-mode="video" class="output-image"/>
        </div>
        <div class="output-caption">
          <p class="caption-text">静态图片</p>
          <img :src="image" alt="Generating Image..." class="output-image"/>
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
  padding-right: 10px; /* 为 input 元素的右侧添加 10px 的内边距 */

}

.input-group input {
  margin: 10px;
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
      let first = -1;
      let canvas = document.getElementById("canvas");
      const gif_canvasList = [];
      let interval = 1
      let pic_width = 800
      let pic_height = 800

      canvas.width = text.length * (pic_width + interval) + interval
      canvas.height = pic_height + 2 * interval

      const charArray = this.splitText(text);
      for (let index = 0; index < charArray.length; index++) {
        let gif_canvas = document.createElement("canvas")
        gif_canvas.width = pic_width
        gif_canvas.height = pic_height
        gif_canvasList.push(gif_canvas)
      }
      for (let index = 0; index < charArray.length; index++) {

        const char = charArray[index];
        let randomIndex = Math.floor(Math.random() * back_image.length);
        if (randomIndex === past || index === charArray.length - 1 && randomIndex === first) {
          randomIndex = (randomIndex + 1) % back_image.length;
        }
        past = randomIndex
        if (index === 0) {
          first = randomIndex
        }
        const selectedImageUrl = back_image[randomIndex];
        let font = this.adjustFontSizeToFitWidth("bold 220px Arial",char,220)
        const myCanvas = new Canvas(selectedImageUrl, canvas, {
          x: index * (interval + pic_width) + interval,
          y: interval
        }, font);
        const myGifCanvas = new Canvas(selectedImageUrl, gif_canvasList[index], {
          x: 0,
          y: 0
        }, font);
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
    adjustFontSizeToFitWidth(font, text, maxWidth) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // 创建一个虚拟的Canvas来测量文本宽度
      ctx.font = font;
      let textWidth = ctx.measureText(text).width;

      // 根据文本宽度和最大宽度来动态计算字体大小
      let fontSize = maxWidth; // 获取当前字体大小
      while (textWidth > maxWidth && fontSize > 0) {
        fontSize--; // 逐渐减小字体大小
        ctx.font = `bold ${fontSize}px Arial`; // 更新字体大小
        textWidth = ctx.measureText(text).width; // 重新计算文本宽度
      }

      return `bold ${fontSize}px Arial`; // 返回调整后的字体样式
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
    splitText(text) {
      const chinesePattern = /[\u4e00-\u9fa5]/; // 匹配中文字符
      const englishPattern = /[a-zA-Z]/; // 匹配英文字符
      const charArray = [];
      let currentChar = '';
      for (const char of text) {
        if (chinesePattern.test(char)) {
          if (currentChar !== '') {
            charArray.push(currentChar);
            currentChar = '';
          }
          charArray.push(char);
        } else if (englishPattern.test(char) || char === ' ') {
          currentChar += char;
        } else {
          if (currentChar !== '') {
            charArray.push(currentChar);
            currentChar = '';
          }
          charArray.push(char);
        }
      }
      // 处理最后的字符
      if (currentChar !== '') {
        charArray.push(currentChar);
      }
      return charArray;
    }
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
