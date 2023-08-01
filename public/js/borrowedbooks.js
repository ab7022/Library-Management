const guideBtn = document.getElementById("guide-btn")
const guide = document.querySelector(".additional-info")
function showGuide(){
    guide.style.display = "block"
}
guideBtn.addEventListener("click",showGuide)