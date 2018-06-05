import React, { PureComponent } from 'react';

class Atom extends PureComponent {
  render() {
    const status = (this.props.status === 0 ? "past" :
                    this.props.status === 1 ? "active" :
                    this.props.status === 2 ? "future" :
                    "");
    const lineStatus = (this.props.lineStatus === 0 ? "line-past" :
                        this.props.lineStatus === 1 ? "line-active" :
                        this.props.lineStatus === 2 ? "line-future" :
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
          " " + lineStatus +
          " " + (this.props.src) +
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
