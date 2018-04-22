import React, { Component } from 'react';
import Atom from './Atom.js';

class Column extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.songId !== nextProps.songId) {
      return true;
    }
    if (this.props.statusList.past.length !== nextProps.statusList.past.length) {
      return true;
    }
    if (this.props.statusList.future.length !== nextProps.statusList.future.length) {
      return true;
    }
    return false;
  }
  computeAtomStatus(mapping, idx) {
    const statusList = this.props.statusList;

    let status = 0;
    if (statusList.active.indexOf(idx) !== -1) {
      status = 1;
    } else if (mapping.alts &&
        mapping.alts.find((i) => statusList.active.indexOf(i) !== -1) != null) {
      status = 1;
    } else if (statusList.future.indexOf(idx) !== -1) {
      status = 2;
    } else if (mapping.alts &&
        mapping.alts.find((i) => statusList.future.indexOf(i) !== -1)) {
      status = 2;
    }

    let lineActive = false;
    if (statusList.lineActive.indexOf(idx) !== -1) {
      lineActive = true;
    }

    return [status, lineActive];
  }
  render() {
    const id = this.props.songId;
    let children = this.props.mapping.map((m, idx) => {

      if (m.type === "newline") {
        return <br key={id+idx} />

      } else if (m.type === "text") {
        return <span style={{marginLeft: m.push}} key={id+idx} className={"text " + m.src}>{m.text.replace(/ /g, '\u00a0')}</span>

      } else if (m.type === "atom") {
        const [status, lineActive] = this.computeAtomStatus(m, idx);
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
            line={lineActive}
            repeated={m.alts ? m.alts.length : 0}
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
