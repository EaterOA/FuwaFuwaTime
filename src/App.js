import React, { Component } from 'react';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import AppBar from 'material-ui/AppBar';
import './App.css';
import 'whatwg-fetch';

import AboutButton from './AboutButton.js';
import SettingsMenu from './SettingsMenu.js';
import SongMenu from './SongMenu.js';
import Column from './Column.js';
import SFXManager from './SFXManager.js';
import SettingsManager from './SettingsManager.js';
import LayoutParser from './LayoutParser.js';
import AudioPlayer from './AudioPlayer.js';
import AboutDrawer from './AboutDrawer.js';

const muiTheme = getMuiTheme({
  "palette": {
    "primary1Color": "#64b5f6",
    "textColor": "rgba(0, 34, 68, 1.00)",
  }
});

class App extends Component {
  render() {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
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
    this.toggleAbout = this.toggleAbout.bind(this);
    this.nextFrame = this.nextFrame.bind(this);
    this.songClick = this.songClick.bind(this);
    this.loadSongFromHash = this.loadSongFromHash.bind(this);
    this.changeVolume = this.changeVolume.bind(this);
    this.changeSetting = this.changeSetting.bind(this);
    this.jumpTo = this.jumpTo.bind(this);
    this.callSFX = new SFXManager('call.wav', 3);
    this.settingsManager = new SettingsManager();
    this.layoutParser = new LayoutParser();
    this.defaultVolume = this.settingsManager.settings.volume;
    this.mappings = [];
    this.state = {
      aboutOpened: false,
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
    return (<div>
      <AppBar
        title="FuwaFuwaTime"
        style={{ position: "fixed" }}
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
            <AboutButton
              onClick={this.toggleAbout}
            />
          </div>
        }
      />
      <div id="game" className="game" style={{ paddingTop: 64 }}>
        <AboutDrawer
          open={this.state.aboutOpened}
          toggle={this.toggleAbout}
        />
        <div id="song-name">{this.state.songName}</div>
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
    </div>);
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
    // parse mappings
    this.mappings = config.map(this.layoutParser.parseMapping);
    this.mappings.sort((a,b) => a.name.localeCompare(b.name, 'en', {'sensitivity': 'base'}));

    // load
    this.loadSongFromHash();

    // events
    window.onhashchange = this.loadSongFromHash;
    window.requestAnimationFrame(this.nextFrame);

    // open about drawer
    this.setState({
      aboutOpened: true,
    });
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
    document.title = 'FuwaFuwaTime - ' + mapping.name;
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

  toggleAbout() {
    this.setState({
      aboutOpened : !this.state.aboutOpened
    });
  }

  songClick(id) {
    window.location.hash = id;
    this.loadSongFromHash();
    this.setState({
      aboutOpened: false,
    });
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
}

export default App;
