import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import './Game.css';
import './Colors.css';

import seriesThemes from './MuiThemes.js';
import AboutButton from './AboutButton.js';
import SettingsMenu from './SettingsMenu.js';
import SeriesMenu from './SeriesMenu.js';
import SongMenu from './SongMenu.js';
import Column from './Column.js';
import SFXManager from './SFXManager.js';
import SettingsManager from './SettingsManager.js';
import AudioPlayer from './AudioPlayer.js';
import AboutDrawer from './AboutDrawer.js';

import stream from './stream.json';

class Game extends Component {
  constructor(props) {
    super(props);

    // binds - do it once in constructor so their refs never change
    this.tick = this.tick.bind(this);
    this.toggleAbout = this.toggleAbout.bind(this);
    this.nextFrame = this.nextFrame.bind(this);
    this.songClick = this.songClick.bind(this);
    this.seriesClick = this.seriesClick.bind(this);
    this.loadSongFromHash = this.loadSongFromHash.bind(this);
    this.changeSeries = this.changeSeries.bind(this);
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
    this.initialSeries = this.settingsManager.settings.series;
    this.disablePlayerControls = 0;
    this.queuedSFX = false;

    // initial render state
    this.state = {
      mappings: {},
      series: this.settingsManager.settings.series,
      seriesConfig: null,
      aboutOpened: true,
      songName: "",
      songId: "",
      settings: this.settingsManager.settings,
      mp3: null,
      left: [],
      right: [],
      leftStatusList: this.getStatusList(0, []),
      rightStatusList: this.getStatusList(0, []),
      karaoke: false,
    };
    document
      .getElementById('theme-color-tag')
      .setAttribute("content", seriesThemes[this.initialSeries].palette.themeColor);
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
        this.state.series !== nextState.series ||
        this.state.songId !== nextState.songId ||
        this.state.settings !== nextState.settings ||
        this.statusListChanged(this.state.leftStatusList, nextState.leftStatusList) ||
        this.statusListChanged(this.state.rightStatusList, nextState.rightStatusList)) {
      return true;
    }
    return false;
  }

  render() {
    return (<MuiThemeProvider muiTheme={seriesThemes[this.state.series]}><div>
      <AppBar
        title={
          <div className='appbar-title-blob'>
            <span
              onClick={this.toggleAbout}
              className="title">
            FuwaFuwaTime
            </span>
          </div>
        }
        className={
          "appbar" +
          " " + this.state.series
        }
        style={{ position: "fixed" }}
        iconElementLeft={
          <div className="song-menu">
            <SongMenu
              onMenuBlur={this.onMenuBlur}
              onMenuFocus={this.onMenuFocus}
              songs={this.state.mappings}
              series={this.state.series}
              seriesConfig={this.state.seriesConfig}
              songClick={this.songClick}
            />
            <SeriesMenu
              series={this.state.series}
              seriesConfig={this.state.seriesConfig}
              onClick={this.seriesClick}
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
        className={
          "game"
          + " " + this.state.series
        }
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
              hideMarkers={!this.state.settings.markers}
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
              hideMarkers={!this.state.settings.markers}
            />
          </div>
        </div>
      </div>
    </div></MuiThemeProvider>);
  }

  initialize(config) {
    // parse mappings
    const mappings = config.songs;
    const seriesConfig = config.series;

    // events
    window.onhashchange = () => { this.loadSongFromHash(this.state.mappings, this.state.seriesConfig[this.state.series].default); };
    window.requestAnimationFrame(this.nextFrame);
    document.addEventListener('keydown', this.keydown);

    // load
    let series = seriesConfig[this.initialSeries];
    const loaded = this.loadSongFromHash(mappings, series.default);
    if (loaded) {
      this.setState({
        aboutOpened: false,
      });
    }

    // set state
    this.setState({
      mappings: mappings,
      seriesConfig: seriesConfig,
    });
  }
  componentDidMount() {
    this.initialize(stream);
  }

  loadSongFromHash(mappings, defaultSongID) {
    let songID = window.location.hash.slice(1).split('?')[0];

    // look for the song with that id
    let mapping = mappings[songID];

    if (mapping != null) {
      // load it if found
      this.loadSong(mapping);
      return true;

    } else {
      // otherwise, just load default song
      mapping = mappings[defaultSongID];
      console.assert(mapping != null, defaultSongID);
      this.loadSong(mapping);
      return false;
    }
  }

  loadSong(mapping) {
    document.title = 'FuwaFuwaTime - ' + mapping.name;
    if (this.state.series !== mapping.series) {
      this.changeSeries(mapping.series);
    }
    this.setState({
      songName: mapping.name,
      songId: mapping.id,
      mp3: mapping.mp3,
      left: mapping.left,
      right: mapping.right,
      leftStatusList: this.getStatusList(0, mapping.left),
      rightStatusList: this.getStatusList(0, mapping.right),
      karaoke: mapping.karaoke,
    });
  }

  nextFrame() {
    if (this.player != null && this.player.playing()) {
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
          mapping[key].marker !== true) {
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

  seriesClick(id) {
    window.location.hash = this.state.seriesConfig[id].default;
    this.loadSongFromHash(this.state.mappings); 
    this.changeSeries(id);
  }

  changeSeries(series) {
    this.setState({ series: series, });
    this.settingsManager.changeSetting('series', series);
    document
      .getElementById('theme-color-tag')
      .setAttribute("content", seriesThemes[series].palette.themeColor);
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
      this.jumpTo(seek);
      e.preventDefault();

    // right - forward 2 seconds
    } else if (e.keyCode === 39) {
      const seek = Math.min(this.player.getDuration(), this.player.getCurrentTime() + 2);
      this.jumpTo(seek);
      e.preventDefault();
    }
  }
}

export default Game;
