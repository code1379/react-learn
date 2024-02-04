import React from "./react";
import ReactDOM from "./react-dom/client";

function ChildComponent(props, forwardRef) {
  return <input type="text" ref={forwardRef}/>
}
// 可以把函数组件传递给 forwardRef，它会返回一个新组件
// 在你需要在子组件内部DOM节点做事情的时候，
// forwardRef 可以接收一个函数组件的渲染函数，返回一个新组件。此函数可以接收 ref
const ForwardComponent = React.forwardRef(ChildComponent)

console.log('ForwardComponent', ForwardComponent)

class ParentComponent extends React.Component {
  childRef = React.createRef();
  handleClick = () => {
    this.childRef.current.focus();
  };
  render() {
    return (
      <div>
        <ForwardComponent ref={this.childRef} />
        <button onClick={this.handleClick}>click</button>
      </div>
    );
  }
}

const el = <ParentComponent />;
// root 代表要渲染的目标容器
let root = ReactDOM.createRoot(document.getElementById("root"));
root.render(el);
