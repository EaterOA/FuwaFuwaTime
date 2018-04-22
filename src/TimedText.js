import React, { PureComponent } from 'react';

class TimedText extends PureComponent {
  render() {
    const timed = (this.props.status != null ? "timed" : "");
    const status = (this.props.status === 0 ? "past" :
                    this.props.status === 1 ? "active" :
                    this.props.status === 2 ? "future" :
                    "");
    return (
      <span
        onClick={this.props.jump}
        className={"text " +
          " " + timed +
          " " + status +
          " " + (this.props.src)
        }
        style={{marginLeft: this.props.push}}
      >
        {this.props.text.replace(/ /g, '\u00a0')}
      </span>
    )
  }
}

export default TimedText;
