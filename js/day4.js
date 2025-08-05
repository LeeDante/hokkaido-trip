
window.onload = function () {
  const savedNote = localStorage.getItem("day4_note");
  if (savedNote) document.getElementById("note").value = savedNote;
  loadSavedImages();
};
document.getElementById("note").addEventListener("input", function () {
  localStorage.setItem("day4_note", this.value);
});

const MAX_IMAGES = 3;
let imageKeys = ["day4_photo1", "day4_photo2", "day4_photo3"];

function handleImageUpload(event) {
  const files = Array.from(event.target.files);
  const existingCount = imageKeys.filter(k => localStorage.getItem(k)).length;
  if (existingCount + files.length > MAX_IMAGES) {
    alert("最多只能上傳三張照片唷！");
    return;
  }
  files.slice(0, MAX_IMAGES - existingCount).forEach(file => {
    const reader = new FileReader();
    reader.onload = function (e) {
      compressAndStoreImage(e.target.result);
    };
    reader.readAsDataURL(file);
  });
}

function compressAndStoreImage(dataUrl) {
  const img = new Image();
  img.src = dataUrl;
  img.onload = () => {
    const canvas = document.createElement("canvas");
    const MAX_WIDTH = 300;
    const scale = MAX_WIDTH / img.width;
    canvas.width = MAX_WIDTH;
    canvas.height = img.height * scale;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const compressed = canvas.toDataURL("image/jpeg", 0.8);
    const slot = imageKeys.find(k => !localStorage.getItem(k));
    if (slot) {
      localStorage.setItem(slot, compressed);
      addImagePreview(slot, compressed);
    }
  };
}

function loadSavedImages() {
  imageKeys.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) addImagePreview(key, data);
  });
}

function addImagePreview(key, dataUrl) {
  const container = document.getElementById("preview-container");
  const wrapper = document.createElement("div");
  wrapper.style.position = "relative";
  wrapper.innerHTML = `
    <img src="${dataUrl}" style="max-height:150px; border:1px solid #ccc; border-radius:5px;">
    <button onclick="removeImage('${key}', this)" style="position:absolute;top:2px;right:2px;">🗑️</button>
  `;
  container.appendChild(wrapper);
}

function removeImage(key, btn) {
  localStorage.removeItem(key);
  btn.parentElement.remove();
}

// 畫圖功能
let canvas = document.getElementById("canvas");
let ctx = canvas?.getContext("2d");
let drawing = false;
let lines = [], currentLine = [];

if (canvas) {
  canvas.addEventListener("mousedown", startDraw);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", endDraw);
  canvas.addEventListener("touchstart", startDrawTouch);
  canvas.addEventListener("touchmove", drawTouch);
  canvas.addEventListener("touchend", endDraw);
}

function startDraw(e) {
  drawing = true;
  currentLine = [];
  ctx.beginPath();
  let x = e.offsetX, y = e.offsetY;
  ctx.moveTo(x, y);
  currentLine.push([x, y]);
}

function draw(e) {
  if (!drawing) return;
  let x = e.offsetX, y = e.offsetY;
  ctx.lineTo(x, y);
  ctx.stroke();
  currentLine.push([x, y]);
}

function endDraw() {
  if (drawing) {
    drawing = false;
    lines.push(currentLine);
  }
}

function startDrawTouch(e) {
  e.preventDefault();
  let rect = canvas.getBoundingClientRect();
  let touch = e.touches[0];
  let x = touch.clientX - rect.left;
  let y = touch.clientY - rect.top;
  startDraw({ offsetX: x, offsetY: y });
}

function drawTouch(e) {
  e.preventDefault();
  let rect = canvas.getBoundingClientRect();
  let touch = e.touches[0];
  let x = touch.clientX - rect.left;
  let y = touch.clientY - rect.top;
  draw({ offsetX: x, offsetY: y });
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  lines = [];
}

function undoLine() {
  lines.pop();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  lines.forEach(line => {
    ctx.beginPath();
    ctx.moveTo(line[0][0], line[0][1]);
    for (let i = 1; i < line.length; i++) {
      ctx.lineTo(line[i][0], line[i][1]);
    }
    ctx.stroke();
  });
}

function saveCanvas() {
  let link = document.createElement("a");
  link.download = "canvas.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function shareCanvas() {
  let dataUrl = canvas.toDataURL("image/png");
  if (navigator.canShare && navigator.canShare({ files: [] })) {
    canvas.toBlob(blob => {
      const file = new File([blob], "canvas.png", { type: "image/png" });
      navigator.share({
        files: [file],
        title: "畫圖分享",
        text: "這是我今天畫的圖！"
      });
    });
  } else {
    alert("此裝置不支援分享功能");
  }
}
