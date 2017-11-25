import React, { PureComponent } from 'react';

class Atom extends PureComponent {
  render() {
    return (
      <div
        onClick={this.props.jump}
        className={"atom " + this.props.src + " " + (this.props.active ? "active" : "")}
        style={{
          marginLeft: this.props.push,
          transition: this.props.transition && this.props.active ? 'all ' + this.props.transition + 's ease 0s' : null
        }}
        >
          {this.props.text}
      </div>
    )
  }
}

export default Atom;
