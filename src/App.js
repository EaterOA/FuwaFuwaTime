import React, { Component } from 'react';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import AppBar from 'material-ui/AppBar';
import './App.css';

import AboutButton from './AboutButton.js';
import SettingsMenu from './SettingsMenu.js';
import SongMenu from './SongMenu.js';
import Column from './Column.js';
import SFXManager from './SFXManager.js';
import SettingsManager from './SettingsManager.js';
import AudioPlayer from './AudioPlayer.js';
import AboutDrawer from './AboutDrawer.js';

import base64 from 'base64-arraybuffer';
import pako from 'pako';
import { c } from './c.json';

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

    // binds - do it once in constructor so their refs never change
    this.tick = this.tick.bind(this);
    this.toggleAbout = this.toggleAbout.bind(this);
    this.nextFrame = this.nextFrame.bind(this);
    this.songClick = this.songClick.bind(this);
    this.loadSongFromHash = this.loadSongFromHash.bind(this);
    this.changeVolume = this.changeVolume.bind(this);
    this.changeSetting = this.changeSetting.bind(this);
    this.jumpTo = this.jumpTo.bind(this);
    this.keydown = this.keydown.bind(this);

    // non-rendered state
    this.player = null;
    this.callSFX = new SFXManager('sound/call.wav', 3);
    this.settingsManager = new SettingsManager();
    this.mappings = [];
    this.defaultVolume = this.settingsManager.settings.volume;

    // initial render state
    this.state = {
      aboutOpened: false,
      songName: "",
      songId: "",
      settings: this.settingsManager.settings,
      ogg: null,
      mp3: null,
      left: [],
      right: [],
      leftActiveList: [],
      rightActiveList: [],
    };
  }

  render() {
    return (<div>
      <AppBar
        title="FuwaFuwaTime"
        className="appbar"
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
      <div
        id="game"
        className="game"
        style={{ paddingTop: 64 }}
      >
        <AboutDrawer
          open={this.state.aboutOpened}
          toggle={this.toggleAbout}
        />
        <div
          id="callguide-area"
        >
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
            <Column id="left" songId={this.state.songId} jumpTo={this.jumpTo} mapping={this.state.left} activeList={this.state.leftActiveList}/>
            <Column id="right" songId={this.state.songId} jumpTo={this.jumpTo} mapping={this.state.right} activeList={this.state.rightActiveList}/>
          </div>
        </div>
      </div>
    </div>);
  }

  initialize(config) {
    // parse mappings
    this.mappings = config;
    this.mappings.sort((a,b) => a.name.localeCompare(b.name, 'en', {'sensitivity': 'base'}));

    // load
    this.loadSongFromHash();

    // events
    window.onhashchange = this.loadSongFromHash;
    window.requestAnimationFrame(this.nextFrame);
    document.onkeydown = this.keydown;

    // open about drawer
    if (this.settingsManager.settings.openAbout) {
      this.setState({
        aboutOpened: true,
      });
    }
  }

  componentDidMount() {
    let app = this;
    if (!c) {
      app.initialize([]);
    } else {
      const data = base64.decode(c)
      const typedArray = new Uint8Array(data);
      const inflated = pako.inflate(typedArray);
      const jsonStr = new TextDecoder("utf-8").decode(inflated);
      const config = JSON.parse(jsonStr);
      app.initialize(config);
    }
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
      leftActiveList: this.getActiveList(0, mapping.left),
      rightActiveList: this.getActiveList(0, mapping.right),
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
    const leftActiveList = this.getActiveList(time, this.state.left);
    const rightActiveList = this.getActiveList(time, this.state.right);

    if (this.settingsManager.settings.callSFX &&
        this.callActivated(leftActiveList, rightActiveList) &&
        this.player.playing()) {
      this.callSFX.play();
    }

    this.setState({
      leftActiveList: leftActiveList,
      rightActiveList: rightActiveList,
    });
  }

  getActiveList(time, mapping) {
    let activeList = [];
    mapping.forEach((m, idx) => {
      if (m.start != null) {
        const isActive = (m.start <= time && time < m.end);
        if (isActive) {
          activeList.push(idx);
        }
      }
    });
    return activeList;
  }

  callActivated(leftActiveList, rightActiveList) {
    const evaluateSide = (mapping, prevList, nextList) => {
      for (let key of nextList) {
        if (prevList.indexOf(key) === -1 &&
            mapping[key].src === 'calls') {
          return true;
        }
      }
      return false;
    };
    return evaluateSide(this.state.left,
                        this.state.leftActiveList,
                        leftActiveList) ||
           evaluateSide(this.state.right,
                        this.state.rightActiveList,
                        rightActiveList);
  }

  toggleAbout() {
    this.settingsManager.changeSetting('openAbout', !this.state.aboutOpened);
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

  keydown(e) {
    // space - toggle play
    if (e.keyCode === 32) {
      this.player.toggle();
      e.preventDefault();

    // left - rewind 2 seconds
    } else if (e.keyCode === 37) {
      const seek = Math.max(0, this.player.getCurrentTime() - 2);
      this.player.jumpTo(seek);
      e.preventDefault();

    // right - forward 2 seconds
    } else if (e.keyCode === 39) {
      const seek = Math.min(this.player.getDuration(), this.player.getCurrentTime() + 2);
      this.player.jumpTo(seek);
      e.preventDefault();

    } else if (e.keyCode === 96) {
      //console.log(this.player.getCurrentTime());this.callSFX.play();
    }
  }
}

export default App;
