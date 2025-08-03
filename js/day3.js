
// 📝 小衡留言儲存功能（localStorage）
function saveNote() {
  const note = document.getElementById("note").value;
  localStorage.setItem("day3_note", note);
}
window.onload = function() {
  const savedNote = localStorage.getItem("day3_note");
  if (savedNote) {
    document.getElementById("note").value = savedNote;
  }
}

// ✍️ 塗鴉區功能
let canvas = document.getElementById("drawCanvas");
let ctx = canvas.getContext("2d");
let drawing = false;
let history = [];

canvas.addEventListener("mousedown", start);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stop);
canvas.addEventListener("mouseout", stop);

canvas.addEventListener("touchstart", start, { passive: false });
canvas.addEventListener("touchmove", draw, { passive: false });
canvas.addEventListener("touchend", stop);

function start(e) {
  e.preventDefault();
  drawing = true;
  ctx.beginPath();
  const pos = getPos(e);
  ctx.moveTo(pos.x, pos.y);
  saveState();
}

function draw(e) {
  if (!drawing) return;
  const pos = getPos(e);
  ctx.lineTo(pos.x, pos.y);
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.stroke();
}

function stop() {
  drawing = false;
  ctx.closePath();
}

function getPos(e) {
  let rect = canvas.getBoundingClientRect();
  if (e.touches) {
    return {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top
    };
  } else {
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function saveCanvas() {
  const dataURL = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.download = "day3_drawing.png";
  link.href = dataURL;
  link.click();
}

function shareCanvas() {
  canvas.toBlob(blob => {
    const file = new File([blob], "day3_drawing.png", { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({
        title: "小衡的塗鴉作品",
        text: "來看看我在北海道畫了什麼～",
        files: [file]
      }).catch(err => console.log("分享失敗", err));
    } else {
      alert("此裝置不支援圖片分享，請改用儲存圖像方式");
    }
  });
}

// 回上一步功能
function saveState() {
  history.push(canvas.toDataURL());
  if (history.length > 30) history.shift(); // 限制歷史長度
}

function undo() {
  if (history.length > 0) {
    let dataURL = history.pop();
    let img = new Image();
    img.src = dataURL;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  }
}
