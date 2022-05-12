class DrawingBoard {
  MODE = "NONE";
  isMouseDown = false;
  #background;
  isNavigatorVisible = false;
  undoArr = [];

  constructor() {
    this.assingElement();
    this.initContext();
    this.addEvent();
  }

  assingElement() {
    this.containerEl = document.getElementById("container");
    this.canvasEl = this.containerEl.querySelector("#canvas");
    this.toolbarEl = this.containerEl.querySelector("#toolbar");
    this.brushEl = this.toolbarEl.querySelector("#brush");
    this.colorPickerEl = this.toolbarEl.querySelector("#colorPicker");
    this.brushPanelEl = this.containerEl.querySelector("#brushPanel");
    this.brushSliderEl = this.brushPanelEl.querySelector("#brushSize");
    this.brushSizePreviewEl =
      this.brushPanelEl.querySelector("#brushSizePreview");
    this.eraserEl = this.toolbarEl.querySelector("#eraser");
    this.navigatorEl = this.toolbarEl.querySelector("#navigator");
    this.navigatorImgContainerEl = this.containerEl.querySelector("#imgNav");
    this.navigatorImgEl =
      this.navigatorImgContainerEl.querySelector("#canvasImg");
    this.undoEl = this.toolbarEl.querySelector("#undo");
    this.clearEl = this.toolbarEl.querySelector("#clear");
    this.downloadLinkEl = this.toolbarEl.querySelector("#download");
  }

  initContext() {
    this.context = this.canvasEl.getContext("2d");
    this.initCanvasBackground();
  }

  initCanvasBackground() {
    this.background = "#ffffff";
    console.log(this.background);
    this.context.fillStyle = this.background;
    this.context.fillRect(0, 0, this.canvasEl.width, this.canvasEl.height);
  }

  addEvent() {
    this.brushEl.addEventListener("click", this.onClickBrush.bind(this));
    this.canvasEl.addEventListener("mousedown", this.onMouseDown.bind(this));
    this.canvasEl.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.canvasEl.addEventListener("mouseup", this.onMouseUp.bind(this));
    this.canvasEl.addEventListener("mouseout", this.onMouseOut.bind(this));
    this.brushSliderEl.addEventListener(
      "input",
      this.onChangeBrushSize.bind(this)
    );
    this.colorPickerEl.addEventListener("input", this.onChangeColor.bind(this));
    this.eraserEl.addEventListener("click", this.onEraserClick.bind(this));
    this.navigatorEl.addEventListener(
      "click",
      this.onClickNavigator.bind(this)
    );
    this.undoEl.addEventListener("click", this.onClickUndo.bind(this));
    this.clearEl.addEventListener("click", this.onClickClear.bind(this));
    this.downloadLinkEl.addEventListener(
      "click",
      this.onClickDownload.bind(this)
    );
  }

  onClickDownload() {
    this.downloadLinkEl.href = this.canvasEl.toDataURL("image/jpeg", 1);
    this.downloadLinkEl.download = "exmaple.jpeg";
  }

  onClickClear() {
    this.context.clearRect(0, 0, this.canvasW, this.cnavasH);
    this.undoArr = [];
    this.updateNavigator();
    this.initCanvasBackground();
  }

  onClickUndo() {
    if (this.undoArr.length === 0) {
      alert("더이상 실행취소 불가!");
      return;
    }
    const previousDataUrl = this.undoArr.pop();
    const previousImg = new Image();
    previousImg.onload = () => {
      this.context.clearRect(0, 0, this.canvasW, this.cnavasH);
      this.context.drawImage(
        previousImg,
        0,
        0,
        this.canvasW,
        this.cnavasH,
        0,
        0,
        this.canvasW,
        this.cnavasH
      );
    };
    previousImg.src = previousDataUrl;
  }

  saveUndoState() {
    if (this.undoArr.length < 5) {
      this.undoArr.push(this.canvasEl.toDataURL());
    } else {
      this.undoArr.shift();
      this.undoArr.push(this.canvasEl.toDataURL());
    }
  }

  onClickNavigator(event) {
    this.isNavigatorVisible = !event.currentTarget.classList.contains("active");
    event.currentTarget.classList.toggle("active");
    this.navigatorImgContainerEl.classList.toggle("hide");
    this.updateNavigator();
  }

  updateNavigator() {
    if (!this.isNavigatorVisible) return;
    this.navigatorImgEl.src = this.canvasEl.toDataURL();
  }

  onEraserClick(event) {
    this.MODE = this.isActive(event) ? "NONE" : "ERASER";
    this.canvasEl.style.cursor = this.isActive(event) ? "default" : "crosshair";
    this.brushPanelEl.classList.add("hide");
    this.eraserEl.classList.toggle("active");
    this.brushEl.classList.remove("active");
  }

  onMouseOut() {
    if (this.MODE === "NONE") return;
    this.isMouseDown = false;
    this.updateNavigator();
  }

  onChangeColor(event) {
    this.brushSizePreviewEl.style.background = event.target.value;
  }

  onChangeBrushSize(event) {
    const { value } = event.target;
    this.brushSizePreviewEl.style.width = `${value}px`;
    this.brushSizePreviewEl.style.height = `${value}px`;
  }

  onClickBrush(event) {
    this.MODE = this.isActive(event) ? "NONE" : "BRUSH";
    this.canvasEl.style.cursor = this.isActive(event) ? "default" : "crosshair";
    this.brushPanelEl.classList.toggle("hide");
    this.brushEl.classList.toggle("active");
    this.eraserEl.classList.remove("active");
  }

  onMouseDown(event) {
    if (this.MODE === "NONE") return;
    this.isMouseDown = true;
    const currentPosition = this.getMousePosition(event);
    this.context.beginPath();
    this.context.moveTo(currentPosition.x, currentPosition.y);
    this.context.lineCap = "round";
    this.switchPenMode();
    this.saveUndoState();
  }

  switchPenMode() {
    if (this.MODE === "BRUSH") {
      this.context.strokeStyle = this.colorPickerEl.value;
      this.context.lineWidth = this.brushSliderEl.value;
    } else {
      this.context.strokeStyle = this.eraserColor;
      this.context.lineWidth = 50;
    }
  }

  onMouseMove(event) {
    if (!this.isMouseDown) return;
    const currentPosition = this.getMousePosition(event);
    this.context.lineTo(currentPosition.x, currentPosition.y);
    this.context.stroke();
  }

  onMouseUp() {
    if (this.MODE === "NONE") return;
    this.isMouseDown = false;
    this.updateNavigator();
  }

  getMousePosition(event) {
    const boundaries = this.canvasEl.getBoundingClientRect();
    return {
      x: event.clientX - boundaries.left,
      y: event.clientY - boundaries.top,
    };
  }

  isActive(event) {
    return event.currentTarget.classList.contains("active");
  }

  // geeter setter
  set background(color) {
    this.#background = color;
    this.eraserColor = color;
  }
  get background() {
    return this.#background;
  }

  get canvasW() {
    return this.canvasEl.width;
  }

  get cnavasH() {
    return this.canvasEl.height;
  }
}

new DrawingBoard();
