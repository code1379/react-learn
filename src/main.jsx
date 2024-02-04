import React from "./react";
import ReactDOM from "./react-dom/client";

class RefComponent extends React.Component {
  /**
   * createRef 会返回一个对象，类似于 { current: null}
   * 我们可以把此对象作为属性出单递给 DOM 元素，然后当此DOM元素避难成真实DOM元素之后，这个真实DOM会赋值给 current
   * ref 允许我们直接访问DOM 元素
   */
  inputRef = React.createRef();

  handleClick = () => {
    this.inputRef.current.focus();
  };
  render() {
    return (
      <div>
        <input
          type="text"
          ref={this.inputRef}
          placeholder="点击按钮让我获得焦点"
        />
        <button onClick={this.handleClick}>click</button>
      </div>
    );
  }
}

const el = <RefComponent />;
// root 代表要渲染的目标容器
let root = ReactDOM.createRoot(document.getElementById("root"));
root.render(el);
