import React, { PureComponent } from 'react';
import MobileDetect from 'mobile-detect';

import Atom from './Atom.js';

class Column extends PureComponent {
  constructor(props) {
    super(props);
    const md = new MobileDetect(window.navigator.userAgent);
    this.isMobile = md.mobile();
  }
  static hasAltInList(alts, list) {
    if (alts == null) {
      return undefined;
    }
    return alts.find((i) => list.indexOf(i) !== -1);
  }
  computeTimingStatus(mapping, idx) {
    const statusList = this.props.statusList;

    // element status
    //
    // default past
    let status = 0;
    // check if satisfies criteria for active
    if (statusList.active.indexOf(idx) !== -1 ||
        Column.hasAltInList(mapping.alts, statusList.active)) {
      status = 1;
    // check if satisfies criteria for future
    } else if (statusList.future.indexOf(idx) !== -1) {
      status = 2;
    } else {
      const futurealt = Column.hasAltInList(mapping.alts, statusList.future);
      if (futurealt && futurealt === Column.hasAltInList(mapping.alts, statusList.lineActive)) {
        status = 2;
      }
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
        return <span key={id+idx} className="text">{m.text}</span>

      } else if (m.type === "atom") {
        const [status, lineStatus] = this.computeTimingStatus(m, idx);
        return (
          <Atom
            key={id+idx}
            jump={
                  m.end - m.start > 0 ?
                  () => this.props.jumpTo(m.start) :
                  null}
            selectable={!this.isMobile}
            push={m.push}
            transition={m.kdur}
            src={m.src}
            text={m.text}
            type={m.type}
            color={m.color}
            shadowColor={m.shadow_color}
            karaoke={this.props.karaoke}
            status={status}
            lineStatus={lineStatus}
            hidden={this.props.hideMarkers && m.marker === true}
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
