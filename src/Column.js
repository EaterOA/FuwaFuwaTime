import React, { Component } from 'react';
import Atom from './Atom.js';

class Column extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.songId !== nextProps.songId) {
      return true;
    }
    if (this.props.activeMap.size !== nextProps.activeMap.size) {
      return true;
    }
    for (let [key, value] of this.props.activeMap.entries()) {
      if (nextProps.activeMap.get(key) !== value) {
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
        if (m.text === " ") {
          return m.text;
        } else {
          return <span style={{marginLeft: m.push}} key={id+idx} className={"text " + m.src}>{m.text}</span>
        }
      } else if (m.type === "atom") {
        return (
          <Atom
            key={id+idx}
            jump={() => this.props.jumpTo(m.range[0])}
            style={{marginLeft: m.push}}
            src={m.src}
            text={m.text}
            type={m.type}
            active={this.props.activeMap.get(idx)}
          />
        );
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
