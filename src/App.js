import React, { PureComponent, Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';
import DoneIcon from 'material-ui/svg-icons/action/done';
import BlockIcon from 'material-ui/svg-icons/content/block';
import InfoIcon from 'material-ui/svg-icons/action/info';
import SettingsIcon from 'material-ui/svg-icons/action/settings';
import MenuItem from 'material-ui/MenuItem';
import './App.css';
import 'whatwg-fetch';
import SFXManager from './SFXManager.js';
import SettingsManager from './SettingsManager.js';
import AudioPlayer from './AudioPlayer.js';

class Atom extends PureComponent {
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

class AboutButton extends PureComponent {
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

class SettingsMenu extends PureComponent {
  render() {
    return (
      <IconMenu
        touchTapCloseDelay={0}
        iconButtonElement={<IconButton><SettingsIcon /></IconButton>}
        targetOrigin={{horizontal: 'right', vertical: 'top'}}
        anchorOrigin={{horizontal: 'right', vertical: 'top'}}
      >
          <MenuItem
            primaryText="Call SFX"
            rightIcon={
              this.props.callSFX ? <DoneIcon/> : <BlockIcon/>
            }
            onClick={() => {this.props.changeSetting('callSFX')}}
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
        touchTapCloseDelay={0}
        iconButtonElement={<IconButton><MenuIcon /></IconButton>}
        targetOrigin={{horizontal: 'left', vertical: 'top'}}
        anchorOrigin={{horizontal: 'left', vertical: 'top'}}
      >
        {
          this.props.songs.map((song) => {
            return (
              <MenuItem
                key={song.id}
                primaryText={song.name}
                onClick={() => this.props.songClick(song.id)}
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
    this.nextFrame = this.nextFrame.bind(this);
    this.songClick = this.songClick.bind(this);
    this.loadSongFromHash = this.loadSongFromHash.bind(this);
    this.changeVolume = this.changeVolume.bind(this);
    this.changeSetting = this.changeSetting.bind(this);
    this.jumpTo = this.jumpTo.bind(this);
    this.callSFX = new SFXManager('call.wav', 3);
    this.settingsManager = new SettingsManager();
    this.settingsManager.loadSettings();
    this.defaultVolume = this.settingsManager.settings.volume;
    this.mappings = [];
    this.state = {
      songName: "",
      songId: "",
      settings: this.settingsManager.settings,
      ogg: null,
      mp3: null,
      left: [],
      right: [],
      leftActiveMap: new Map(),
      rightActiveMap: new Map(),
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
            songClick={this.songClick}
          />
        }
        iconElementRight={
          <div>
            <SettingsMenu
              {...this.state.settings}
              changeSetting={this.changeSetting}
            />
            <AboutButton />
          </div>
        }
      />
        <div id="songName">{this.state.songName}</div>
        <AudioPlayer
          ref={(element) => {this.player = element}}
          ogg={this.state.ogg}
          mp3={this.state.mp3}
          defaultVolume={this.defaultVolume}
          onVolumeChange={this.changeVolume}
          onTimeUpdate={this.tick}
        />
        <div id="callguide">
          <Column id="left" songId={this.state.songId} jumpTo={this.jumpTo} mapping={this.state.left} activeMap={this.state.leftActiveMap}/>
          <Column id="right" songId={this.state.songId} jumpTo={this.jumpTo} mapping={this.state.right} activeMap={this.state.rightActiveMap}/>
        </div>
      </div>
    );
  }
  changeVolume(volume) {
    this.changeSetting('volume', volume);
  }
  changeSetting(key, value=null) {
    this.settingsManager.changeSetting(key, value);
    this.setState({
      settings: this.settingsManager.settings,
    });
  }
  jumpTo(time) {
    this.player.jumpTo(time);
  }
  componentDidMount() {
    fetch('./config.json')
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        this.initialize(json);
      })
      .catch((ex) => {
        console.warn('Unable to load config', ex);
      });
  }
  initialize(config) {
    // transform mappings
    this.mappings = config.map(this.parseMapping);
    this.mappings.sort((a,b) => a.name.localeCompare(b.name, 'en', {'sensitivity': 'base'}));

    // load
    this.loadSongFromHash();

    // events
    window.onhashchange = this.loadSongFromHash;
    window.requestAnimationFrame(this.nextFrame);
  }
  songClick(id) {
    window.location.hash = id;
    this.loadSongFromHash();
  }
  loadSongFromHash() {
    let songID = window.location.hash.slice(1).split('?')[0];

    // look for the song with that id
    let mapping = this.mappings.find((element) => element.id === songID);

    if (mapping != null) {
      // load it if found
      this.loadSong(mapping);

    } else if (this.mappings.length > 0) {
      // otherwise, just load first song
      this.loadSong(this.mappings[0]);
    }
  }
  loadSong(mapping) {
    this.setState({
      songName: mapping.name,
      songId: mapping.id,
      ogg: mapping.ogg,
      mp3: mapping.mp3,
      left: mapping.left,
      right: mapping.right,
      leftActiveMap: this.getActiveMap(0, mapping.left),
      rightActiveMap: this.getActiveMap(0, mapping.right),
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
  nextFrame() {
    if (this.player.playing()) {
      const time = this.player.getCurrentTime();
      this.tick(time);
    }
    window.requestAnimationFrame(this.nextFrame);
  }
  tick(time) {
    const leftActiveMap = this.getActiveMap(time, this.state.left);
    const rightActiveMap = this.getActiveMap(time, this.state.right);

    if (this.settingsManager.settings.callSFX &&
        this.callActivated(leftActiveMap, rightActiveMap) &&
        this.player.playing()) {
      this.callSFX.play();
    }

    this.setState({
      leftActiveMap: leftActiveMap,
      rightActiveMap: rightActiveMap,
    });
  }
  getActiveMap(time, mapping) {
    let activeMap = new Map();
    mapping.forEach((m, idx) => {
      if (m.range != null) {
        const isActive = (m.range[0] <= time && time < m.range[1]);
        activeMap.set(idx, isActive);
      }
    });
    return activeMap;
  }
  callActivated(leftActiveMap, rightActiveMap) {
    const evaluateSide = (mapping, prevMap, nextMap) => {
      for (let [key, value] of nextMap) {
        if (value === true &&
            prevMap.get(key) === false &&
            mapping[key].src === 'calls') {
          return true;
        }
      }
      return false;
    };
    return evaluateSide(this.state.left,
                        this.state.leftActiveMap,
                        leftActiveMap) ||
           evaluateSide(this.state.right,
                        this.state.rightActiveMap,
                        rightActiveMap);
  }
}


export default App;
