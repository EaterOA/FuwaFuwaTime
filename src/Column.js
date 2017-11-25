import React, { Component } from 'react';
import Atom from './Atom.js';

class Column extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.songId !== nextProps.songId) {
      return true;
    }
    if (this.props.activeList.length !== nextProps.activeList.length) {
      return true;
    }
    let curList = this.props.activeList;
    let nextList = nextProps.activeList;
    for (let i = 0; i < curList.length; i++) {
      if (curList[i] !== nextList[i]) {
        return true;
      }
    }
    return false;
  }
  render() {
    const id = this.props.songId;
    let children = this.props.mapping.map((m, idx) => {

      if (m.type === "newline") {
        return <br key={id+idx} />

      } else if (m.type === "text") {
        return <span style={{marginLeft: m.push}} key={id+idx} className={"text " + m.src}>{m.text.replace(/ /g, '\u00a0')}</span>

      } else if (m.type === "atom") {
        return (
          <Atom
            key={id+idx}
            jump={() => this.props.jumpTo(m.range[0])}
            push={m.push}
            transition={m.transition}
            src={m.src}
            text={m.text}
            type={m.type}
            active={this.props.activeList.indexOf(idx) !== -1 ||
                    m.alts.filter((i) => this.props.activeList.indexOf(i) !== -1).length > 0}
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
