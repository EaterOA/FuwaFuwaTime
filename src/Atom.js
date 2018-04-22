import React, { PureComponent } from 'react';

class Atom extends PureComponent {
  render() {
    const status = (this.props.status === 0 ? "past" :
                    this.props.status === 1 ? "active" :
                    this.props.status === 2 ? "future" :
                    "");
    let transition = null;
    if (this.props.transition != null && status === "active") {
      transition = 'text-shadow ' + (this.props.transition / 1.5) + 's'
                 + ', color ' + (this.props.transition / 1.5)  + 's';
    }
    return (
      <div
        onClick={this.props.jump}
        className={"atom" +
          " " + status +
          " " + (this.props.src) +
          " " + (this.props.line ? "line" : "") +
          " " + (this.props.karaoke ? "karaoke" : "")
        }
        style={{
          marginLeft: this.props.push,
          transition: transition,
        }}
        >
          {this.props.text}
      </div>
    )
  }
}

export default Atom;
