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

    // kPast/kActive
    // whether this atom should apply karaoke past/active effect. relevant for
    // atoms that have a custom color property that cannot use the base color
    // classes
    const kPast = (this.props.karaoke && lineStatus == "line-active" && status === "past");
    const kActive = (this.props.karaoke && lineStatus == "line-active" && status === "active");


    // transition
    // applied when the atom has kfx timings, causing the kActive highlight to
    // depend on the duration of the syllable
    let transition = null;
    if (this.props.transition != null && status === "active") {
      transition = 'text-shadow ' + (this.props.transition / 1.5) + 's'
                 + ', color ' + (this.props.transition / 1.5)  + 's';
    }

    // color
    // applied when the atom has defined a custom color. this color must be
    // lifted on kActive or kPast, which applies a white color
    let color = null;
    if (this.props.color != null && !kPast && !kActive) {
      color = '#' + this.props.color;
    }

    // text shadow
    // applied when the atom has defined a custom color. this text shadow is a
    // function of the text color to emphasize it without making it hard to
    // read. how the shadow works will depend on kPast and kActive
    let textShadow = null;
    if (this.props.color != null && lineStatus === "line-active") {
      if (kActive) {
        textShadow = '0px 0px 6px #' + Atom.darkenColor(this.props.color, 0.5) + ',' +
                     '0px 0px 4px #' + Atom.darkenColor(this.props.color, 0.7);
      } else if (kPast) {
        textShadow = '0px 0px 4px #' + this.props.color + ',' +
                     '0px 0px 4px #' + this.props.color;
      } else if (!this.props.karaoke) {
        textShadow = '0px 0px 3px #' + Atom.lightenColor(this.props.color, 0.6) + ',' +
                     '0px 0px 9px #' + Atom.lightenColor(this.props.color, 0.3);
      }
    }
    return (
      <div
        onClick={this.props.jump}
        className={"atom" +
          " " + status +
          " " + lineStatus +
          " " + (this.props.src) +
          " " + (this.props.karaoke ? "karaoke" : "") +
          " " + (color != null ? "custom-colored" : "")
        }
        style={{
          marginLeft: this.props.push,
          transition: transition,
          color: color,
          textShadow: textShadow,
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
