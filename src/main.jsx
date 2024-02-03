import React from "./react";
import ReactDOM from "./react-dom/client";

class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "计数器",
      count: 0,
    };
  }
  // state = {
  //   count: 0,
  // };

  handleIncrement = () => {
    // 可以调用 setState 方法更新状态，更新之后自动触发组件的更新
    // 只需要传递变更的属性即可
    this.setState({
      count: this.state.count + 1,
    });
  };
  render() {
    return (
      <button onClick={this.handleIncrement}>
        {this.state.title}:{this.state.count}
      </button>
    );
  }
}

const el = <Counter />;
// root 代表要渲染的目标容器
let root = ReactDOM.createRoot(document.getElementById("root"));
// 要把那个 React 元素（虚拟DOM） 渲染到容器中
root.render(el);
