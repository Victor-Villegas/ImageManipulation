'use strict';

const imageWorker = new Worker('js/worker.js');

imageWorker.onmessage = function (event) {
  imgData = event.data;
  ctx.putImageData(imgData, 0, 0, 0, 0, srcImage.width, srcImage.height);
};

// ================ SPINNING ================

function spin () {
  const spinner = document.getElementById('spinner');
  let angle = 0;
  setInterval(() => {
    angle++;
    spinner.style.transform = `rotate(${angle}deg)`;
  }, 20);
}

spin();

// ================ IMAGE INPUT ================

const fileInput = document.getElementById('file-input');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const srcImage = new Image();
const selectedFilter = document.getElementById('form-stacked-select');

let imgData = null;
let originalPixels = null;
// const currentPixels = null;

fileInput.onchange = function (e) {
  if (e.target.files && e.target.files.item(0)) {
    srcImage.src = URL.createObjectURL(e.target.files[0]);
  }
};

srcImage.onload = function () {
  canvas.width = srcImage.width;
  canvas.height = srcImage.height;
  ctx.drawImage(srcImage, 0, 0, srcImage.width, srcImage.height);
  imgData = ctx.getImageData(0, 0, srcImage.width, srcImage.height);
  originalPixels = imgData.data.slice();
};

// ================ IMAGE PROCESS ================
function processImage () {
  imageWorker.postMessage([originalPixels.slice(), selectedFilter.value, { height: srcImage.height, width: srcImage.width }, imgData]);
}
