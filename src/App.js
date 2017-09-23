import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import './App.css';
import 'whatwg-fetch';

class Atom extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return this.props.active !== nextProps.active;
  }
  render() {
    return (
      <div
        onClick={this.props.jump}
        className={"atom " + this.props.type + " " + (this.props.active ? "active" : "")}
        >
          {this.props.text}
      </div>
    )
  }
}

class Column extends Component {
  render() {
    let children = this.props.mapping.map((m, idx) => {
      if (m.type === "newline") {
        return <br key={idx} />
      } else if (m.type === "text") {
        return m.text;
      } else {
        return (
          <Atom
            jump={() => this.props.jumpTo(m.range[0])}
            key={idx}
            text={m.text}
            type={m.type}
            active={m.active}
          />
        );
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

class App extends Component {
  render() {
    return (
      <MuiThemeProvider>
        <Game/>
      </MuiThemeProvider>
    );
  }
}

class Game extends Component {
  constructor(props) {
    super(props);
    this.player = null;
    this.tick = this.tick.bind(this);
    this.loadSong = this.loadSong.bind(this);
    this.jumpTo = this.jumpTo.bind(this);
    this.mappings = [];
    this.state = {
      left: [],
      right: [],
    };
  }
  render() {
    return (
      <div id="game">
        <audio
          id="player"
          ref={(element) => {this.player = element;}}
          controls
        />
        <div id="callguide">
          <Column id="left" jumpTo={this.jumpTo} mapping={this.state.left}/>
          <Column id="right" jumpTo={this.jumpTo} mapping={this.state.right}/>
        </div>
      </div>
    );
  }
  jumpTo(time) {
    this.player.currentTime = time;
  }
  componentDidMount() {
    this.player.volume = 0.1;
    fetch('./config.json')
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        this.mappings = json.map(this.parseMapping);
        this.loadSong(0);
      })
      .catch((ex) => {
        console.warn('Unable to load config', ex);
      });
    window.requestAnimationFrame(this.tick);
  }
  loadSong(idx) {
    console.assert(idx < this.mappings.length);
    this.player.src = this.mappings[idx].ogg;
    this.setState({
      song: idx,
      left: this.mappings[idx].left,
      right: this.mappings[idx].right,
    });
  }
  parseMapping(song) {
    let mapping = Object.assign({}, song);
    delete mapping.layout;
    delete mapping.lyrics;
    delete mapping.calls;
    mapping.left = [];
    mapping.right = [];

    // lex
    const layout = song.layout.join('\n');
    const tokenStrings = layout.match(/\n|\[|\]|{|}|[^[\]{}\n]+/g);
    const tokens = tokenStrings.map((str) => {
      if (str === '{') return {type: "opening_brace"};
      if (str === '}') return {type: "closing_brace"};
      if (str === '[') return {type: "opening_bracket"};
      if (str === ']') return {type: "closing_bracket"};
      if (str === '\n') return {type: "newline"};
      return {type: "text", str: str};
    });

    // context-aware parse
    let stream = mapping.left;
    let callMode = false;
    let together = false;
    let push = null;
    let timings = { calls: song.calls, lyrics: song.lyrics };
    let refs = { calls: 0, lyrics: 0 };
    for (let i = 0; i < tokens.length;) {
      if (tokens[i].type === "text") {
        stream.push({type:"text", text: tokens[i].str, push:push});
        push = null;
        i += 1;
      } else if (tokens[i].type === "newline") {
        stream.push({type:"newline"});
        i += 1;
      } else if (tokens[i].type === "opening_bracket") {
        if (!(i+2 < tokens.length &&
            tokens[i+1].type === "text" &&
            tokens[i+2].type === "closing_bracket")) {
          console.warn("syntax error in layout, i=" + i);
          break;
        }
        const func = tokens[i+1].str.split(',');
        if (func[0] === "call") {
          callMode = true;
        } else if (func[0] === "end-call") {
          callMode = false;
        } else if (func[0] === "next-col") {
          stream = mapping.right;
        } else if (func[0] === "push") {
          push = func[1];
        } else if (func[0] === "together") {
          together = true;
        }
        i += 3;
      } else if (tokens[i].type === "opening_brace") {
        if (!(i+2 < tokens.length &&
            tokens[i+1].type === "text" &&
            tokens[i+2].type === "closing_brace")) {
        console.log(tokens[i+2].type);
          console.warn("syntax error in layout, i=" + i);
          break;
        }
        const text = tokens[i+1].str;
        i += 3;
        const src = callMode ? 'calls' : 'lyrics';
        if (refs[src] >= timings[src].length) {
          console.warn('lyrics ref ' + refs[src] + ' for src "' + src + '" higher than number of timings');
          break;
        }
        stream.push({
          type: together ? 'calls' : src,
          text: text,
          range: timings[src][refs[src]],
          push: push,
        });
        push = null;
        together = false;
        refs[src] += 1;
      } else {
        console.warn("syntax error in layout, i=" + i);
        break;
      }
    }
    return mapping;
  }
  tick() {
    let now = this.player.currentTime;

    const left = this.state.left
    const right = this.state.right;
    if (left.length > 0 || right.length > 0) {
      this.updateActive(now, left);
      this.updateActive(now, right);
      this.setState({ left: left, right: right });
    }
    window.requestAnimationFrame(this.tick);
  }
  updateActive(time, mapping) {
    for (let m of mapping) {
      if (m.range != null) {
        m.active = (m.range[0] <= time && time < m.range[1]);
      }
    }
  }
}


export default App;
