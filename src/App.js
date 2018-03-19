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
import stream from './stream.json';

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
    this.disablePlayerControls = 0;

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
      leftStatusList: [],
      rightStatusList: [],
      karaoke: false,
    };
  }
  onMenuFocus = () => {
    this.disablePlayerControls += 1;
  };
  onMenuBlur = () => {
    this.disablePlayerControls -= 1;
  };

  render() {
    return (<div>
      <AppBar
        title="FuwaFuwaTime"
        className="appbar"
        style={{ position: "fixed" }}
        iconElementLeft={
          <div className="song-menu">
            <SongMenu
              onMenuBlur={this.onMenuBlur}
              onMenuFocus={this.onMenuFocus}
              songs={this.mappings}
              songClick={this.songClick}
            />
          </div>
        }
        iconElementRight={
          <div className="game-menu">
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
            <Column
              id="left"
              songId={this.state.songId}
              jumpTo={this.jumpTo}
              mapping={this.state.left}
              statusList={this.state.leftStatusList}
              karaoke={this.state.karaoke}
            />
            <Column
              id="right"
              songId={this.state.songId}
              jumpTo={this.jumpTo}
              mapping={this.state.right}
              statusList={this.state.rightStatusList}
              karaoke={this.state.karaoke}
            />
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
    document.addEventListener('keydown', this.keydown);

    // open about drawer
    if (this.settingsManager.settings.openAbout) {
      this.setState({
        aboutOpened: true,
      });
    }
  }

  componentDidMount() {
    let app = this;
    if (!stream) {
      app.initialize([]);
    } else {
      const data = base64.decode(stream)
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
      leftStatusList: this.getStatusList(0, mapping.left),
      rightStatusList: this.getStatusList(0, mapping.right),
      karaoke: mapping.karaoke,
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
    const leftStatusList = this.getStatusList(time, this.state.left);
    const rightStatusList = this.getStatusList(time, this.state.right);

    if (this.settingsManager.settings.callSFX &&
        this.player.playing() &&
        (
          this.callActivated(this.state.left, this.state.leftStatusList, leftStatusList) || 
          this.callActivated(this.state.right, this.state.rightStatusList, rightStatusList)
        )) {
      this.callSFX.play();
    }

    this.setState({
      leftStatusList: leftStatusList,
      rightStatusList: rightStatusList,
    });
  }

  getStatusList(time, mapping) {
    let statusList = {
      past: [],
      active: [],
      future: [],
    };
    mapping.forEach((m, idx) => {
      if (m.start != null) {
        if (time < m.start) {
          statusList.future.push(idx);
        } else if (time < m.end) {
          statusList.active.push(idx);
        } else {
          statusList.past.push(idx);
        }
      }
    });
    return statusList;
  }

  callActivated(mapping, prevStatusList, nextStatusList) {
    for (let key of nextStatusList.active) {
      if (prevStatusList.active.indexOf(key) === -1 &&
          mapping[key].src === 'calls') {
        return true;
      }
    }
    return false;
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
    if (this.disablePlayerControls > 0) {
      return;
    }

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
    }
  }
}

export default App;
