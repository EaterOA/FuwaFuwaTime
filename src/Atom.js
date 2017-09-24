import React, { PureComponent } from 'react';

class Atom extends PureComponent {
  render() {
    return (
      <div
        onClick={this.props.jump}
        className={"atom " + this.props.src + " " + (this.props.active ? "active" : "")}
        >
          {this.props.text}
      </div>
    )
  }
}

export default Atom;
