import React, { PureComponent } from 'react';
import Atom from './Atom.js';
import TimedText from './TimedText.js';

class Column extends PureComponent {
  static hasAltInList(alts, list) {
    if (alts == null) {
      return false;
    }
    return alts.find((i) => list.indexOf(i) !== -1) != null;
  }
  computeTimingStatus(mapping, idx) {
    const statusList = this.props.statusList;

    // element status
    //
    // default future
    let status = 2;
    // check if satisfies criteria for active
    if (statusList.active.indexOf(idx) !== -1 ||
        Column.hasAltInList(mapping.alts, statusList.active)) {
      status = 1;
    // check if satisfies criteria for past
    } else if (statusList.past.indexOf(idx) !== -1 &&
        !Column.hasAltInList(mapping.alts, statusList.future)) {
      status = 0;
    }

    // line status
    //
    // default future
    let lineStatus = 2;
    if (statusList.lineActive.indexOf(idx) !== -1 ||
        Column.hasAltInList(mapping.alts, statusList.lineActive)) {
      if (this.props.highlightActive) {
        lineStatus = 1;
      }
    } else if (statusList.linePast.indexOf(idx) !== -1 &&
        !Column.hasAltInList(mapping.alts, statusList.lineFuture)) {
      if (this.props.fadePast) {
        lineStatus = 0;
      }
    }

    return [status, lineStatus];
  }
  render() {
    const id = this.props.songId;
    let children = this.props.mapping.map((m, idx) => {

      if (m.type === "newline") {
        return <br key={id+idx} />

      } else if (m.type === "text") {
        return (
          <TimedText
            key={id+idx}
            src={m.src}
            text={m.text}
            push={m.push}
          />
        );

      } else if (m.type === "timed-text") {
        const [status, lineStatus] = this.computeTimingStatus(m, idx);
        return (
          <TimedText
            key={id+idx}
            jump={() => this.props.jumpTo(m.start)}
            src={m.src}
            status={status}
            lineStatus={lineStatus}
            text={m.text}
            push={m.push}
          />
        );

      } else if (m.type === "atom") {
        const [status, lineStatus] = this.computeTimingStatus(m, idx);
        return (
          <Atom
            key={id+idx}
            jump={() => this.props.jumpTo(m.start)}
            push={m.push}
            transition={m.kdur}
            src={m.src}
            text={m.text}
            type={m.type}
            karaoke={this.props.karaoke}
            status={status}
            lineStatus={lineStatus}
          />
        );

      } else if (m.type === 'repeat') {
        return null;
        // no-op

      } else {
        console.assert(false, "Unknown type " + m.type);
        return null;
      }
    });
    return (
      <div id={this.props.id} className="column">
        <div className="column-inner">
          { children }
        </div>
      </div>
    )
  }
}

export default Column;
