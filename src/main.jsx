import React from "./react";
import ReactDOM from "./react-dom/client";

class ShoppingCart extends React.Component {
  state = {
    itemCount: this.props.itemCount
  }
  // 从属性中映射出一个派生的状态
  // nextProps 新属性、prevState 老状态
  static getDerivedStateFromProps(nextProps, prevState) {
    console.log("nextProps", nextProps);
    console.log("prevState", prevState);
    if (nextProps.itemCount !== prevState.itemCount) {
      // 如果返回值不为空，则返回值将用来更新状态
      return {
        itemCount: nextProps.itemCount
      }
    }
    // 如果返回值为空，则不更新状态
    return null
  }
  render() {
    return <div>Items in Cart: {this.state.itemCount}</div>
  }
}

class App extends React.Component {
  state = {
    itemCount: 0
  }

  addItemToCart = () => {
    this.setState((prevState) => ({
      itemCount: prevState.itemCount + 1
    }))
  }

  render() {
    return <div>
      <h1>online store</h1>
      <button onClick={this.addItemToCart}>add item</button>
      <div>Items in Cart: {this.state.itemCount}</div>
      <hr />
      <ShoppingCart itemCount={this.state.itemCount} />
    </div>
  }
}


let root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);