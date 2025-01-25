import React from "react";
import cv from "@techstark/opencv-js";
import { loadHaarFaceModels, detectHaarFace } from "./haarFaceDetection";

class TestPage extends React.Component {
  constructor(props) {
    super(props);
    this.inputImgRef = React.createRef();
    this.grayImgRef = React.createRef();
    this.cannyEdgeRef = React.createRef();
    this.haarFaceImgRef = React.createRef();
    this.state = {
      imgUrl: null,
    };
  }

  componentDidMount() {
    window.cv = cv;
    loadHaarFaceModels();
  }

  /////////////////////////////////////////
  //
  // process image with opencv.js
  //
  /////////////////////////////////////////
  async processImage(imgSrc) {
    const img = cv.imread(imgSrc);
    window.img = img;

    // to gray scale
    const imgGray = new cv.Mat();
    cv.cvtColor(img, imgGray, cv.COLOR_BGR2GRAY);
    cv.imshow(this.grayImgRef.current, imgGray);
    window.imgGray = imgGray;

    // detect edges using Canny
    const edges = new cv.Mat();
    cv.Canny(imgGray, edges, 100, 100);
    cv.imshow(this.cannyEdgeRef.current, edges);
    window.edges = edges;

    // detect faces using Haar-cascade Detection
    const haarFaces = await detectHaarFace(img);

    // Blur detected faces
    const faces = new cv.RectVector();
    const faceCascade = new cv.CascadeClassifier();
    faceCascade.load("haarcascade_frontalface_default.xml");
    faceCascade.detectMultiScale(imgGray, faces, 1.1, 3, 0);

    for (let i = 0; i < faces.size(); ++i) {
      let face = faces.get(i);
      let newHeight = face.height * 1.5;
      let yOffset = (newHeight - face.height) / 2;
      let newY = Math.max(face.y - yOffset, 0);
      let newFace = new cv.Rect(face.x, newY, face.width, newHeight);
      let roi = img.roi(newFace);
      cv.GaussianBlur(roi, roi, new cv.Size(55, 55), 30, 30);
      roi.delete();
    }

    cv.imshow(this.haarFaceImgRef.current, img);
    window.haarFaces = img;

    // Clean up
    imgGray.delete();
    edges.delete();
    faces.delete();
    faceCascade.delete();

    // need to release them manually
    // img.delete();
    // imgGray.delete();
    // edges.delete();
    // haarFaces.delete();
  }

  render() {
    const { imgUrl } = this.state;
    return (
      <div>
        <div style={{ marginTop: "30px" }}>
          <span style={{ marginRight: "10px" }}>Select an image file:</span>
          <input
            type="file"
            name="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files[0]) {
                this.setState({
                  imgUrl: URL.createObjectURL(e.target.files[0]),
                });
              }
            }}
          />
        </div>

        {imgUrl && (
          <div className="images-container">
            <div className="image-card">
              <div style={{ margin: "10px" }}>↓↓↓ The original image ↓↓↓</div>
              <img
                alt="Original input"
                src={imgUrl}
                onLoad={(e) => {
                  this.processImage(e.target);
                }}
              />
            </div>

            <div className="image-card">
              <div style={{ margin: "10px" }}>↓↓↓ The gray scale image ↓↓↓</div>
              <canvas ref={this.grayImgRef} />
            </div>

            <div className="image-card">
              <div style={{ margin: "10px" }}>↓↓↓ Canny Edge Result ↓↓↓</div>
              <canvas ref={this.cannyEdgeRef} />
            </div>

            <div className="image-card">
              <div style={{ margin: "10px" }}>
                ↓↓↓ Haar-cascade Face Detection Result ↓↓↓
              </div>
              <canvas ref={this.haarFaceImgRef} />
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default TestPage;
