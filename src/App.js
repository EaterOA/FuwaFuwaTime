import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';
import InfoIcon from 'material-ui/svg-icons/action/info';
import SettingsIcon from 'material-ui/svg-icons/action/settings';
import MenuItem from 'material-ui/MenuItem';
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
        className={"atom " + this.props.src + " " + (this.props.active ? "active" : "")}
        >
          {this.props.text}
      </div>
    )
  }
}

class Column extends Component {
  render() {
    const id = this.props.songId;
    let children = this.props.mapping.map((m, idx) => {
      if (m.type === "newline") {
        return <br key={id+idx} />
      } else if (m.type === "text") {
        if (m.text === " ") {
          return m.text;
        } else {
          return <span key={id+idx} className={"text " + m.src}>{m.text}</span>
        }
      } else if (m.type === "atom") {
        return (
          <Atom
            jump={() => this.props.jumpTo(m.range[0])}
            key={id+idx}
            src={m.src}
            text={m.text}
            type={m.type}
            active={m.active}
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

class AboutButton extends Component {
  render() {
    return (
      <IconButton
        {...this.props}
      >
        <InfoIcon/>
      </IconButton>
    );
  }
};
AboutButton.muiName = 'IconButton';

class SettingsMenu extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return this.props.enabledCallSFX !== nextProps.enabledCallSFX;
  }
  render() {
    return (
      <IconMenu
        iconButtonElement={<IconButton><SettingsIcon /></IconButton>}
        targetOrigin={{horizontal: 'right', vertical: 'top'}}
        anchorOrigin={{horizontal: 'right', vertical: 'top'}}
      >
          <MenuItem
            primaryText="Call SFX"
            checked={this.props.enabledCallSFX}
          />
      </IconMenu>
    );
  }
};
SettingsMenu.muiName = 'IconMenu';

class SongMenu extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return this.props.songs.length !== nextProps.songs.length;
  }
  render() {
    return (
      <IconMenu
        iconButtonElement={<IconButton><MenuIcon /></IconButton>}
        targetOrigin={{horizontal: 'right', vertical: 'top'}}
        anchorOrigin={{horizontal: 'right', vertical: 'top'}}
      >
        {
          this.props.songs.map((song) => {
            return (
              <MenuItem
                key={song.id}
                primaryText={song.name}
                onClick={() => this.props.loadSong(song.id)}
              />
            );
          })
        }
      </IconMenu>
    );
  }
};
SongMenu.muiName = 'IconMenu';

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
      songName: "",
      songId: "",
      left: [],
      right: [],
    };
  }
  render() {
    return (
      <div id="game">
      <AppBar
        title="Interactive Callguide"
        iconElementLeft={
          <SongMenu
            songs={this.mappings}
            loadSong={this.loadSong}
          />
        }
        iconElementRight={
          <div>
            <SettingsMenu />
            <AboutButton />
          </div>
        }
      />
        <div id="songName">{this.state.songName}</div>
        <audio
          id="player"
          ref={(element) => {this.player = element;}}
          controls
        />
        <div id="callguide">
          <Column id="left" songId={this.state.songId} jumpTo={this.jumpTo} mapping={this.state.left}/>
          <Column id="right" songId={this.state.songId} jumpTo={this.jumpTo} mapping={this.state.right}/>
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
        if (this.mappings.length > 0) {
          this.loadSong(this.mappings[0].id);
        }
      })
      .catch((ex) => {
        console.warn('Unable to load config', ex);
      });
    window.requestAnimationFrame(this.tick);
  }
  loadSong(id) {
    let mapping = this.mappings.find((element) => element.id === id);
    console.assert(mapping != null);
    this.player.src = mapping.ogg;
    this.setState({
      songName: mapping.name,
      songId: mapping.id,
      left: mapping.left,
      right: mapping.right,
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
        stream.push({type:"text", text: tokens[i].str, src: (callMode ? 'calls' : 'lyrics'), push:push});
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
          type: 'atom',
          src: (together ? 'calls' : src),
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
