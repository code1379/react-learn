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

  render() {
    console.log("3. render")
    return <div>
      <p>{this.state.number}</p>
      <button onClick={this.handleClick}>+</button>
    </div>
  }
}

let root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Counter />);
