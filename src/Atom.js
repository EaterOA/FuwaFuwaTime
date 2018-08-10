import React, { PureComponent } from 'react';

class Atom extends PureComponent {
  static darkenColor(hexCode, factor) {
    var r = Math.floor(parseInt(hexCode.substr(0, 2), 16) * factor);
    var g = Math.floor(parseInt(hexCode.substr(2, 2), 16) * factor);
    var b = Math.floor(parseInt(hexCode.substr(4, 2), 16) * factor);
    return ("00" + r.toString(16)).substr(-2) +
           ("00" + g.toString(16)).substr(-2) +
           ("00" + b.toString(16)).substr(-2);
  }
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
    let color = null;
    if (this.props.color != null &&
        (!this.props.karaoke || lineStatus !== "line-active" || 
          (status !== "active" && status !== "past"))) {
      color = '#' + this.props.color;
    }
    let textShadow = null;
    if (this.props.shadowColor != null && lineStatus === 'line-active') {
      if (this.props.karaoke && status === 'active') {
        textShadow = '0px 0px 6px #' + Atom.darkenColor(this.props.color, 0.7) + ',' +
                     '0px 0px 4px #' + Atom.darkenColor(this.props.color, 0.7);
      } else if (this.props.karaoke && status === 'past') {
        textShadow = '0px 0px 3px #' + Atom.darkenColor(this.props.color, 0.5) + ',' +
                     '0px 0px 3px #' + Atom.darkenColor(this.props.color, 0.5);
      } else if (!this.props.karaoke) {
        textShadow = '0px 0px 6px #' + this.props.shadowColor;
      }
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
