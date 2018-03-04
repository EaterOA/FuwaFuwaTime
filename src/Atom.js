import React, { PureComponent } from 'react';

class Atom extends PureComponent {
  render() {
    return (
      <div
        onClick={this.props.jump}
        className={"atom" +
          " " + (this.props.src) +
          " " + (this.props.active ? "active" : "") +
          " " + (this.props.past ? "past" : "") +
          " " + (this.props.karaoke ? "karaoke" : "")}
        style={{
          marginLeft: this.props.push,
          transition: this.props.transition && this.props.active ? 'text-shadow ' + (this.props.transition / 1.5) + 's, color ' + (this.props.transition) + 's' : null
        }}
        >
          {this.props.text}
      </div>
    )
  }
}

export default Atom;
