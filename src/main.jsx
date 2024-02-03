import React from "./react";
import ReactDOM from "./react-dom/client";
// import ReactDOM from "react-dom";

class Counter extends React.Component {
  state = {
    count: 0,
  };

  handleClick = () => {
    this.setState({
      count: this.state.count + 1,
    });
    // 在调用完 setState 之后，this.state 并没有立即更新，而是先缓存起来了。
    console.log(this.state);
    this.setState({
      count: this.state.count + 1,
    });
    console.log(this.state);
    // 最后等到事件处理器执行完成才进行实际的更新;
    // 在 setTimeout 里面是同步更新，非批量更新的
    setTimeout(() => {
      this.setState({
        count: this.state.count + 1,
      });
      console.log(this.state);
      this.setState({
        count: this.state.count + 1,
      });
      console.log(this.state);
    });
  };
  render() {
    return <button onClick={this.handleClick}>{this.state.count}</button>;
  }
}

const el = <Counter />;
// root 代表要渲染的目标容器
let root = ReactDOM.createRoot(document.getElementById("root"));
root.render(el);
// 要把那个 React 元素（虚拟DOM） 渲染到容器中
// ReactDOM.render(el, document.getElementById("root"));
