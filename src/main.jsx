import React from "./react";
import ReactDOM from "./react-dom/client";

class Counter extends React.Component {
  state = {
    list: ['A', 'B', 'C', 'D', 'E', 'F']
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({
        list: ["A", 'C', 'E', 'D', 'G']
      })
    }, 1000)
  }

  render() {
    return <ul>
      {
        this.state.list.map(item => (
          <li key={item}>{item}</li>
        ))
      }
    </ul>
  }
}


let root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Counter />);
