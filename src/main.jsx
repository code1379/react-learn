import React from "./react";
import ReactDOM from "./react-dom/client";

class ChildCounter extends React.Component {
  // 当此子组件收到父组件传递过来的新属性
  componentWillReceiveProps() {
    console.log("ChildCounter 4. componentWillReceiveProps 组件收到新的属性对象")
  }

  shouldComponentUpdate(nextProps) {
    console.log("ChildCounter 5. shouldComponentUpdate 子组件要不要更新")
    return nextProps.count % 3 === 0
  }
  componentWillMount() {
    console.log("ChildCounter 1. componentWillMount 子组件将要挂载")
  }
  render() {
    console.log("ChildCounter 2. render 子组件将要渲染")
    return <div>{this.props.count}</div>
  }
  componentDidMount() {
    console.log("ChildCounter 3. componentDidMount 子组件挂载完成")
  }

  componentWillUnmount() {
    console.log("ChildCounter 6. componentWillUnmount 子组件将要卸载")
  }
}

class Counter extends React.Component {
  constructor(props) {
    super(props)
    this.state = { count: 0 }
    console.log("1. constructor 父组件初始化属性和状态")
  }
  componentWillMount() {
    console.log("2. compoenntWillMount 父组件将要挂载")
  }

  handleClick = () => {
    this.setState({
      count: this.state.count + 1
    })
  }

  componentDidMount() {
    console.log("4. componentDidMount 父组件挂载完成")
  }

  shouldComponentUpdate(nextProps, nextState) {
    console.log("5. shoudlComponentUpdate 父组件要不要更新")
    return nextState.count % 2 === 0; // 如果是偶数就返回 true 更新，如果是奇数就返回fasle，不更新
  }

  componentWillUpdate() {
    console.log("6. componentWillUpdate 父组件更新前")
  }
  componentDidUpdate() {
    console.log("7. componentDidUpdate 父组件更新后")
  }

  render() {
    console.log("3. render 父组件渲染")
    return <div>
      <p>{this.state.count}</p>
      {this.state.count === 4 ? null : <ChildCounter count={this.state.count}/>}
      <button onClick={this.handleClick}>+</button>
    </div>
  }
}

let root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Counter />);
