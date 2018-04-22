import React, { PureComponent } from 'react';

class Atom extends PureComponent {
  render() {
    const status = (this.props.status === 0 ? "past" :
                    this.props.status === 1 ? "active" :
                    "");
    let transition = null;
    if (this.props.transition != null && status === "active") {
      transition = 'text-shadow ' + (this.props.transition / 1.5) + 's'
                 + ', color ' + (this.props.transition / 1.5)  + 's';
    }
    // if repeated, append "x N" to text
    const suffix = (this.props.repeated > 0 ? " x " + this.props.repeated : "");
    const suffixEle = (suffix !== "" ?
      (<span className="suffix">{suffix}</span>) :
      null);
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
          {suffixEle}
      </div>
    )
  }
}

export default Atom;
