'use strict';

let originalPixels = null;
let selectedFilter = null;
let srcImage = null;
let imgData = null;

let currentPixels = null;

const availableFilters = [
  addRed,
  addGreen,
  addBlue,
  addContrast,
  addBrightness,
  setGrayscale
];

function getIndex (x, y) {
  return (x + y * srcImage.width) * 4;
}

function clamp (value) {
  return Math.max(0, Math.min(Math.floor(value), 255));
}

function processImage () {
  currentPixels = originalPixels.slice();

  for (let i = 0; i < srcImage.height; i++) {
    for (let j = 0; j < srcImage.width; j++) {
      availableFilters[selectedFilter](j, i, 100);
    }
  }

  commitChanges();
}

function commitChanges () {
  for (let i = 0; i < imgData.data.length; i++) {
    imgData.data[i] = currentPixels[i];
  }

  postMessage(imgData);
}

// ================ FILTERS ================

const R_OFFSET = 0;
const G_OFFSET = 1;
const B_OFFSET = 2;

function addRed (x, y, value) {
  const index = getIndex(x, y) + R_OFFSET;
  const currentValue = currentPixels[index];
  currentPixels[index] = clamp(currentValue + value);
}

function addGreen (x, y, value) {
  const index = getIndex(x, y) + G_OFFSET;
  const currentValue = currentPixels[index];
  currentPixels[index] = clamp(currentValue + value);
}

function addBlue (x, y, value) {
  const index = getIndex(x, y) + B_OFFSET;
  const currentValue = currentPixels[index];
  currentPixels[index] = clamp(currentValue + value);
}

function addBrightness (x, y, value) {
  addRed(x, y, value);
  addGreen(x, y, value);
  addBlue(x, y, value);
}

function addContrast (x, y, value) {
  const redIndex = getIndex(x, y) + R_OFFSET;
  const greenIndex = getIndex(x, y) + G_OFFSET;
  const blueIndex = getIndex(x, y) + B_OFFSET;

  const redValue = currentPixels[redIndex];
  const greenValue = currentPixels[greenIndex];
  const blueValue = currentPixels[blueIndex];

  const alpha = (value + 255) / 255; // Goes from 0 to 2, where 0 to 1 is less contrast and 1 to 2 is more contrast

  const nextRed = alpha * (redValue - 128) + 128;
  const nextGreen = alpha * (greenValue - 128) + 128;
  const nextBlue = alpha * (blueValue - 128) + 128;

  currentPixels[redIndex] = clamp(nextRed);
  currentPixels[greenIndex] = clamp(nextGreen);
  currentPixels[blueIndex] = clamp(nextBlue);
}

function setGrayscale (x, y) {
  const redIndex = getIndex(x, y) + R_OFFSET;
  const greenIndex = getIndex(x, y) + G_OFFSET;
  const blueIndex = getIndex(x, y) + B_OFFSET;

  const redValue = currentPixels[redIndex];
  const greenValue = currentPixels[greenIndex];
  const blueValue = currentPixels[blueIndex];

  const mean = (redValue + greenValue + blueValue) / 3;

  currentPixels[redIndex] = clamp(mean);
  currentPixels[greenIndex] = clamp(mean);
  currentPixels[blueIndex] = clamp(mean);
}

onmessage = function (event) {
  originalPixels = event.data[0];
  selectedFilter = event.data[1];
  srcImage = event.data[2];
  imgData = event.data[3];
  processImage();
};
