<template>
  <div>
    <h1>生成图片</h1>
    <input v-model="inputText" placeholder="输入中文字"/>
    <button @click="generateImages">生成图片</button>

    <button @click="saveImage(image)">保存图片</button>
  </div>
  <img :src="image" alt="Generated Image" :style="{ 'max-width': '1920px', 'max-height': 'auto' }">

  <canvas id="canvas"></canvas>
</template>

<script>
import Canvas from "@/components/Canvas";
import image1 from "@/assets/1.png"
import image2 from "@/assets/2.png"
import image3 from "@/assets/3.png"

export default {
  data() {
    return {
      inputText: "我爱你",
      image: "",
      fontSize: 30
    };
  },
  methods: {

    generateImages() {
      const text = (this.inputText || '').trim();
      if (!text) {
        return;
      }
      let back_image = [image1, image2, image3]
      let back_position = [
        {x:85,y:277},
        {x:269,y:751},
        {x:518,y:280}
      ]
      let past = -1;
      let canvas = document.getElementById("canvas");
      let interval = 1
      let pic_width = 800
      let pic_height = 800

      canvas.width = text.length * (pic_width + interval) + interval + 1000
      canvas.height = pic_height + 2 * interval + 1000
      const charArray = Array.from(text);

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
        myCanvas.draw(back_position[randomIndex], char);
      }
      // 在Canvas绘制完成后再保存图片
      setTimeout(() => {
        this.image = canvas.toDataURL("image/png");
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
  },
  mounted() {
    let canvas = document.getElementById("canvas");
    canvas.style.display = 'none'
    this.generateImages();
  }
};
</script>
