import React from "./react";
import ReactDOM from "./react-dom/client";

class Counter extends React.Component {
  constructor(props) {
    super(props)
    this.state = { count: 0 }
    console.log("1. constructor")
  }
  componentWillMount() {
    console.log("2. compoenntWillMount")
  }

  handleClick = () => {
    this.setState({
      count: this.state.count + 1
    })
  }

  componentDidMount() {
    console.log("4. componentDidMount")
  }

  shouldComponentUpdate(nextProps, nextState) {
    console.log("5. shoudlComponentUpdate")
    return nextState.count % 2 === 0; // 如果是偶数就返回 true 更新，如果是奇数就返回fasle，不更新
  }

  componentWillUpdate() {
    console.log("6. componentWillUpdate")
  }
  componentDidUpdate() {
    console.log("7. componentDidUpdate")
  }

  render() {
    console.log("3. render")
    return <div>
      <p>{this.state.count}</p>
      <button onClick={this.handleClick}>+</button>
    </div>
  }
}

let root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Counter />);
