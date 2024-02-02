import React from "./react";

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
console.log("🚀 ~ vdom:", vdom);
