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
    this.onVolumeChange = this.onVolumeChange.bind(this);
    this.changeSetting = this.changeSetting.bind(this);
    this.jumpTo = this.jumpTo.bind(this);
    this.keydown = this.keydown.bind(this);
    this.onPlayerPlay = this.onPlayerPlay.bind(this);
    this.onPlayerPause = this.onPlayerPause.bind(this);
    this.onPlayerSeeked = this.onPlayerSeeked.bind(this);

    // non-rendered state
    this.player = null;
    this.settingsManager = new SettingsManager();
    this.callSFX = new SFXManager('sound/call.wav', this.settingsManager.settings.callSFXVolume);
    this.defaultVolume = this.settingsManager.settings.volume;
    this.defaultMuted = this.settingsManager.settings.muted;
    this.disablePlayerControls = 0;
    this.queuedSFX = false;

    // initial render state
    this.state = {
      mappings: [],
      lives: [],
      subunits: [],
      aboutOpened: true,
      songName: "",
      songId: "",
      settings: this.settingsManager.settings,
      ogg: null,
      mp3: null,
      left: [],
      right: [],
      leftStatusList: this.getStatusList(0, []),
      rightStatusList: this.getStatusList(0, []),
      karaoke: false,
    };
  }
  onMenuFocus = () => {
    this.disablePlayerControls += 1;
  };
  onMenuBlur = () => {
    this.disablePlayerControls -= 1;
  };

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.mappings !== nextState.mappings ||
        this.state.aboutOpened !== nextState.aboutOpened ||
        this.state.songId !== nextState.songId ||
        this.state.settings !== nextState.settings ||
        this.statusListChanged(this.state.leftStatusList, nextState.leftStatusList) ||
        this.statusListChanged(this.state.rightStatusList, nextState.rightStatusList)) {
      return true;
    }
    return false;
  }

  render() {
    return (<div>
      <AppBar
        title={
          <span
            onClick={this.toggleAbout}
            className="title">
          FuwaFuwaTime
          </span>
        }
        className="appbar"
        style={{ position: "fixed" }}
        iconElementLeft={
          <div className="song-menu">
            <SongMenu
              onMenuBlur={this.onMenuBlur}
              onMenuFocus={this.onMenuFocus}
              songs={this.state.mappings}
              lives={this.state.lives}
              subunits={this.state.subunits}
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
              open={this.state.aboutOpened}
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
          mappings={this.state.mappings}
        />
        <div
          id="callguide-area"
        >
          <div id="song-name">{this.state.songName}</div>
          <AudioPlayer
            elementId='player'
            ref={(element) => {this.player = element}}
            ogg={this.state.ogg}
            mp3={this.state.mp3}
            defaultVolume={this.defaultVolume}
            defaultMuted={this.defaultMuted}
            onVolumeChange={this.onVolumeChange}
            onTimeUpdate={this.tick}
            onPlay={this.onPlayerPlay}
            onPause={this.onPlayerPause}
            onSeeked={this.onPlayerSeeked}
          />
          <div id="callguide">
            <Column
              id="left"
              songId={this.state.songId}
              jumpTo={this.jumpTo}
              mapping={this.state.left}
              statusList={this.state.leftStatusList}
              karaoke={this.state.karaoke && this.state.settings.karaoke}
              fadePast={this.state.settings.fadePast}
              highlightActive={this.state.settings.highlightActive}
            />
            <Column
              id="right"
              songId={this.state.songId}
              jumpTo={this.jumpTo}
              mapping={this.state.right}
              statusList={this.state.rightStatusList}
              karaoke={this.state.karaoke && this.state.settings.karaoke}
              fadePast={this.state.settings.fadePast}
              highlightActive={this.state.settings.highlightActive}
            />
          </div>
        </div>
      </div>
    </div>);
  }

  initialize(config) {
    // parse mappings
    const mappings = config.songs

    // events
    window.onhashchange = () => { this.loadSongFromHash(this.state.mappings); };
    window.requestAnimationFrame(this.nextFrame);
    document.addEventListener('keydown', this.keydown);

    // load
    this.loadSongFromHash(mappings);

    // set state
    this.setState({
      mappings: mappings,
      subunits: config.subunits,
      lives: config.lives,
    });
  }
  componentDidMount() {
    if (!stream) {
      this.initialize([]);
    } else {
      const data = base64.decode(stream)
      const typedArray = new Uint8Array(data);
      const inflated = pako.inflate(typedArray);
      const jsonStr = new TextDecoder("utf-8").decode(inflated);
      const config = JSON.parse(jsonStr);
      this.initialize(config);
    }
  }

  loadSongFromHash(mappings) {
    let songID = window.location.hash.slice(1).split('?')[0];

    // look for the song with that id
    let mapping = mappings.find((element) => element.id === songID);

    if (mapping != null) {
      // load it if found
      this.loadSong(mapping);

    } else if (mappings.length > 0) {
      // otherwise, just load first song
      this.loadSong(mappings[0]);
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

  nextCall(time, mapping) {
    let next= null;
    for (let m of mapping) {
      if (m.src !== 'calls' && m.src !== 'instructions') {
        continue;
      }
      if (m.start >= time &&
          (next == null || m.start < next)) {
        next = m.start;
      }
    }
    return next;
  }

  tick(time) {
    if (this.queuedSFX) {
      this.callSFX.play();
      this.queuedSFX = false;
    }
    const leftStatusList = this.getStatusList(time, this.state.left);
    const rightStatusList = this.getStatusList(time, this.state.right);

    // calls handling
    if (this.settingsManager.settings.callSFX &&
        this.player.playing() &&
        (
          this.callActivated(this.state.left, this.state.leftStatusList, leftStatusList) || 
          this.callActivated(this.state.right, this.state.rightStatusList, rightStatusList)
        )) {
      this.queuedSFX = true;
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
      linePast: [],
      lineActive: [],
      lineFuture: [],
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

        const lineStart = (m.line_start != null ? m.line_start : m.start);
        const lineEnd = (m.line_end != null ? m.line_end : m.end);
        if (time < lineStart) {
          statusList.lineFuture.push(idx);
        } else if (time < lineEnd) {
          statusList.lineActive.push(idx);
        } else {
          statusList.linePast.push(idx);
        }
      }
    });
    return statusList;
  }

  statusListChanged(prevStatusList, nextStatusList) {
    if (prevStatusList.past.length !== nextStatusList.past.length) {
      return true;
    }
    if (prevStatusList.future.length !== nextStatusList.future.length) {
      return true;
    }
    if (prevStatusList.linePast.length !== nextStatusList.linePast.length) {
      return true;
    }
    if (prevStatusList.lineFuture.length !== nextStatusList.lineFuture.length) {
      return true;
    }
    return false;
  }

  callActivated(mapping, prevStatusList, nextStatusList) {
    for (let key of nextStatusList.active) {
      if (prevStatusList.active.indexOf(key) === -1 &&
          (mapping[key].src === 'calls' ||
          mapping[key].src === 'instructions') &&
          mapping[key].nosfx !== true) {
        return true;
      }
    }
    return false;
  }

  onPlayerPlay() {
  }

  onPlayerPause() {
  }

  onPlayerSeeked(time) {
  }

  toggleAbout() {
    this.setState({
      aboutOpened : !this.state.aboutOpened
    });
  }

  songClick(id) {
    window.location.hash = id;
    this.loadSongFromHash(this.state.mappings);
    this.setState({
      aboutOpened: false,
    });
  }

  onVolumeChange(volume, muted) {
    this.settingsManager.changeSetting('volume', volume);
    this.settingsManager.changeSetting('muted', muted);
    this.setState({
      settings: Object.assign({}, this.settingsManager.settings)
    });
  }

  changeSetting(key, value=null) {
    this.settingsManager.changeSetting(key, value);
    this.setState({
      settings: Object.assign({}, this.settingsManager.settings)
    });

    // non-rendered state
    if (key === 'callSFXVolume') {
      this.callSFX.updateVolume(this.settingsManager.settings.callSFXVolume);
    } else if (key === 'volume') {
      this.player.changeVolume(this.settingsManager.settings.volume);
    } else if (key === 'muted') {
      this.player.setMuted(this.settingsManager.settings.muted);
    }
  }

  jumpTo(time) {
    // NB: adding small fraction to ensure proper activeness
    this.player.jumpTo(time + 0.001);
  }

  keydown(e) {
    if (this.disablePlayerControls > 0) {
      return;
    }

    // disable audio player controls if about drawer is open
    if (this.state.aboutOpened) {
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
