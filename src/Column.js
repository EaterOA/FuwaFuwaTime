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
    if (statusList.active.indexOf(idx) !== -1) {
      return 1;
    }
    if (mapping.alts &&
        mapping.alts.find((i) => statusList.active.indexOf(i) !== -1) != null) {
      return 1;
    }
    if (statusList.future.indexOf(idx) !== -1) {
      return 2;
    }
    if (mapping.alts &&
        mapping.alts.find((i) => statusList.future.indexOf(i) !== -1)) {
      return 2;
    }
    return 0;
  }
  render() {
    const id = this.props.songId;
    let children = this.props.mapping.map((m, idx) => {

      if (m.type === "newline") {
        return <br key={id+idx} />

      } else if (m.type === "text") {
        return <span style={{marginLeft: m.push}} key={id+idx} className={"text " + m.src}>{m.text.replace(/ /g, '\u00a0')}</span>

      } else if (m.type === "atom") {
        const status = this.computeAtomStatus(m, idx);
        return (
          <Atom
            key={id+idx}
            jump={() => this.props.jumpTo(m.start)}
            push={m.push}
            transition={m.transition}
            src={m.src}
            text={m.text}
            type={m.type}
            karaoke={this.props.karaoke}
            past={status === 0}
            active={status === 1}
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
