import React, { PureComponent } from 'react';

class Atom extends PureComponent {
  static darkenColor(hexCode, factor) {
    const r = Math.floor(parseInt(hexCode.substr(0, 2), 16) * factor);
    const g = Math.floor(parseInt(hexCode.substr(2, 2), 16) * factor);
    const b = Math.floor(parseInt(hexCode.substr(4, 2), 16) * factor);
    return ("00" + r.toString(16)).substr(-2) +
           ("00" + g.toString(16)).substr(-2) +
           ("00" + b.toString(16)).substr(-2);
  }
  static lightenColor(hexCode, factor) {
    const r = Math.floor(255 - (255 - parseInt(hexCode.substr(0, 2), 16)) * factor);
    const g = Math.floor(255 - (255 - parseInt(hexCode.substr(2, 2), 16)) * factor);
    const b = Math.floor(255 - (255 - parseInt(hexCode.substr(4, 2), 16)) * factor);
    return ("00" + r.toString(16)).substr(-2) +
           ("00" + g.toString(16)).substr(-2) +
           ("00" + b.toString(16)).substr(-2);
  }
  render() {
    // status
    // whether this atom is past, active, future
    const status = (this.props.status === 0 ? "past" :
                    this.props.status === 1 ? "active" :
                    this.props.status === 2 ? "future" :
                    "");

    // lineStatus
    // whether the line this atom is in is past, active, or future. only
    // different from status if the song has kfx timings
    const lineStatus = (this.props.lineStatus === 0 ? "line-past" :
                        this.props.lineStatus === 1 ? "line-active" :
                        this.props.lineStatus === 2 ? "line-future" :
                        "");

    // transition
    // applied when the atom has kfx timings, causing the kActive highlight to
    // depend on the duration of the syllable
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
          " " + (this.props.karaoke ? "karaoke" : "") +
          " " + (this.props.color ? "color-" + this.props.color : "")
        }
        style={{
          marginLeft: this.props.push,
          transition: transition,
          userSelect: (this.props.selectable ? null : 'none'),
          display: (this.props.hidden ? 'none' : null),
        }}
        >
          {this.props.text}
      </div>
    )
  }
}

export default Atom;
