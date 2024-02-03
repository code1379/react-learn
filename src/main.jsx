import React from "./react";
import ReactDOM from "./react-dom/client";

class ClassComponent extends React.Component {
  parentBubble() {
    console.log("parentBubble");
  }
  parentCapture(e) {
    console.log("parentCapture");
    // e.stopPropagation();
  }

  childBubble(e) {
    console.log("childBubble");
    e.stopPropagation();
  }
  childCapture() {
    console.log("childCapture");
  }

  handleLinkClick(e) {
    e.preventDefault();
  }
  render() {
    return (
      <div
        id="parent"
        onClick={this.parentBubble}
        onClickCapture={this.parentCapture}
      >
        <button
          id="child"
          onClick={this.childBubble}
          onClickCapture={this.childCapture}
        >
          点击
        </button>
        <a href="http://www.baidu.com" onClick={this.handleLinkClick}>
          link
        </a>
      </div>
    );
  }
}

const el = <ClassComponent />;
// root 代表要渲染的目标容器
let root = ReactDOM.createRoot(document.getElementById("root"));
// 要把那个 React 元素（虚拟DOM） 渲染到容器中
root.render(el);

setTimeout(() => {
  const root = document.getElementById("root");
  const parent = document.getElementById("parent");
  const child = document.getElementById("child");
  root.addEventListener(
    "click",
    (e) => {
      console.log("original rootCapture");
    },
    true
  );
  root.addEventListener("click", (e) => {
    console.log("original rootBubble");
  });

  parent.addEventListener(
    "click",
    (e) => {
      console.log("original parentCapture");
    },
    true
  );
  parent.addEventListener("click", (e) => {
    console.log("original parentBubble");
  });

  child.addEventListener(
    "click",
    (e) => {
      console.log("original childCapture");
    },
    true
  );
  child.addEventListener("click", (e) => {
    console.log("original childBubble");
  });
}, 200);
