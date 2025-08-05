
window.onload = function () {
  const savedNote = localStorage.getItem("day1_note");
  if (savedNote) document.getElementById("note").value = savedNote;
  loadSavedImages();
};
document.getElementById("note").addEventListener("input", function () {
  localStorage.setItem("day1_note", this.value);
});

const MAX_IMAGES = 3;
let imageKeys = ["day1_photo1", "day1_photo2", "day1_photo3"];

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
