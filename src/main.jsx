import React from "./react";
import ReactDOM from "./react-dom/client";
const vdom = React.createElement(
  // type
  "div",
  // props
  {
    style: { color: "red", className: "container" },
  },
  // children
  "hello",
  React.createElement("span", { style: { color: "blue" } }, "world")
);
// root 代表要渲染的目标容器
let root = ReactDOM.createRoot(document.getElementById("root"));
// 要把那个 React 元素（虚拟DOM） 渲染到容器中
root.render(vdom);
