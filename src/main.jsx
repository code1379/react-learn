import React from "./react";
import ReactDOM from "./react-dom/client";

/**
 * 定义一个类组件集成自父类 React.Component
 * 类组件必须编写一个名为 render 的函数，负责返回要渲染的 虚拟DOM
 */
class ClassComponent extends React.Component {
  constructor(props) {
    super(props); // this.props = props;
    // 在内部会把收到的属性对象放在自己的实例上，以后可以通过 this.props 访问
  }
  render() {
    return (
      <div>
        Class Component - {this.props.name} - {this.props.age}{" "}
      </div>
    );
  }
}

const el = <ClassComponent name="dell" age={18} />;
// const el = React.createElement(ClassComponent);
console.log("🚀 ~ el:", el);
// root 代表要渲染的目标容器
let root = ReactDOM.createRoot(document.getElementById("root"));
// 要把那个 React 元素（虚拟DOM） 渲染到容器中
root.render(el);
