import React from "./react";
import ReactDOM from "./react-dom/client";

class ChildComponent extends React.Component {
  // 这是 ChildComponent 这个类组件身上的实例方法
  alertMessage() {
    alert(`Hello from ChildComponent`);
  }
  render() {
    return <div>ChildComponent</div>;
  }
}

class ParentComponent extends React.Component {
  childComponentRef = React.createRef();
  handleClick = () => {
    this.childComponentRef.current.alertMessage();
  };
  render() {
    return (
      <div>
        <ChildComponent ref={this.childComponentRef} />
        <button onClick={this.handleClick}>click</button>
      </div>
    );
  }
}

const el = <ParentComponent />;
// root 代表要渲染的目标容器
let root = ReactDOM.createRoot(document.getElementById("root"));
root.render(el);
