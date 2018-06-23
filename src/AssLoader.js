import React, { Component } from 'react';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import RaisedButton from 'material-ui/RaisedButton';
import Snackbar from 'material-ui/Snackbar';
import AppBar from 'material-ui/AppBar';
import './App.css';
import './AssLoader.css';
import { assCompiler } from '../package.json';

import SettingsMenu from './SettingsMenu.js';
import Column from './Column.js';
import SFXManager from './SFXManager.js';
import SettingsManager from './SettingsManager.js';
import AudioPlayer from './AudioPlayer.js';

import base64 from 'base64-arraybuffer';
import pako from 'pako';

const muiTheme = getMuiTheme({
  "palette": {
    "primary1Color": "#64b5f6",
    "textColor": "rgba(0, 34, 68, 1.00)",
  }
});

class AssLoader extends Component {
  constructor(props) {
    super(props);

    // binds - do it once in constructor so their refs never change
    this.tick = this.tick.bind(this);
    this.nextFrame = this.nextFrame.bind(this);
    this.changeVolume = this.changeVolume.bind(this);
    this.changeSetting = this.changeSetting.bind(this);
    this.jumpTo = this.jumpTo.bind(this);
    this.keydown = this.keydown.bind(this);
    this.loadAss = this.loadAss.bind(this);
    this.requestMp3 = this.requestMp3.bind(this);
    this.handleErrorBarClose = this.handleErrorBarClose.bind(this);

    // non-rendered state
    this.player = null;
    this.settingsManager = new SettingsManager();
    this.callSFX = new SFXManager('sound/call.mp3', 3, this.settingsManager.settings.callSFXVolume);
    this.defaultVolume = this.settingsManager.settings.volume;
    this.defaultCallSFXVolume = this.settingsManager.settings.callSFXVolume;

    // initial render state
    this.state = {
      config: null,
      settings: this.settingsManager.settings,
      mp3: null,
      left: [],
      right: [],
      leftStatusList: this.getStatusList(0, []),
      rightStatusList: this.getStatusList(0, []),
      karaoke: false,
      errorBar: false,
      errorBarMessage: "",
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.errorBar !== nextState.errorBar ||
        this.state.mp3 !== nextState.mp3 ||
        this.state.config !== nextState.config ||
        this.state.settings !== nextState.settings ||
        this.statusListChanged(this.state.leftStatusList, nextState.leftStatusList) ||
        this.statusListChanged(this.state.rightStatusList, nextState.rightStatusList)) {
      return true;
    }
    return false;
  }

  render() {
    return (<MuiThemeProvider muiTheme={muiTheme}><div>
      <AppBar
        title={
          <span
            className="title">
          FuwaFuwaTime
          </span>
        }
        className="appbar"
        style={{ position: "fixed" }}
        iconElementRight={
          <div className="game-menu">
            <SettingsMenu
              {...this.state.settings}
              changeSetting={this.changeSetting}
            />
          </div>
        }
      />
      <div
        id="game"
        className="game"
      >
      <Snackbar
        open={this.state.errorBar}
        message={this.state.errorBarMessage}
        onRequestClose={this.handleErrorBarClose}
        bodyStyle={{
          backgroundColor: "#bc0035",
          height: "auto",
          lineHeight: "normal",
          padding: "24px 24px",
        }}
      />
        <div
          id="callguide-area"
        >
          <div className="assloader-button-area">
            <RaisedButton
              className="assloader-button"
              containerElement="label"
              label="Ass">
                <input
                  type="file"
                  style={{ display: 'none' }}
                  onChange={(e) => this.loadAss(e)}
                />
            </RaisedButton>
            <RaisedButton
              className="assloader-button"
              containerElement="label"
              label="MP3">
                <input
                  type="file"
                  style={{ display: 'none' }}
                  onChange={(e) => this.requestMp3(e)}
                />
            </RaisedButton>
          </div>
          <AudioPlayer
            elementId='player'
            ref={(element) => {this.player = element}}
            ogg={null}
            mp3={this.state.mp3}
            defaultVolume={this.defaultVolume}
            onVolumeChange={this.changeVolume}
            onTimeUpdate={this.tick}
          />
          <div id="callguide">
            <Column
              id="left"
              songId=""
              jumpTo={this.jumpTo}
              mapping={this.state.left}
              statusList={this.state.leftStatusList}
              karaoke={this.state.karaoke}
              fadePast={this.state.settings.fadePast}
              highlightActive={this.state.settings.highlightActive}
            />
            <Column
              id="right"
              songId=""
              jumpTo={this.jumpTo}
              mapping={this.state.right}
              statusList={this.state.rightStatusList}
              karaoke={this.state.karaoke}
              fadePast={this.state.settings.fadePast}
              highlightActive={this.state.settings.highlightActive}
            />
          </div>
        </div>
      </div>
    </div></MuiThemeProvider>);
  }

  initialize(config) {
    // set state
    this.setState({
      config: config,
      left: config.left,
      right: config.right,
      leftStatusList: this.getStatusList(0, config.left),
      rightStatusList: this.getStatusList(0, config.right),
      karaoke: config.karaoke,
    });
  }

  handleErrorBarClose() {
    this.setState({
      errorBar: false,
    });
  }

  componentDidMount() {
    // events
    window.requestAnimationFrame(this.nextFrame);
    document.addEventListener('keydown', this.keydown);
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
    const leftStatusList = this.getStatusList(time, this.state.left);
    const rightStatusList = this.getStatusList(time, this.state.right);

    // calls handling
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
    return false;
  }

  callActivated(mapping, prevStatusList, nextStatusList) {
    for (let key of nextStatusList.active) {
      if (prevStatusList.active.indexOf(key) === -1 &&
          (mapping[key].src === 'calls' ||
          mapping[key].src === 'instructions')) {
        return true;
      }
    }
    return false;
  }

  changeVolume(volume) {
    this.changeSetting('volume', volume);
  }

  changeSetting(key, value=null) {
    this.settingsManager.changeSetting(key, value);
    this.setState({
      settings: Object.assign({}, this.settingsManager.settings)
    });
    // non-rendered state
    this.callSFX.updateVolume(this.settingsManager.settings.callSFXVolume);
  }

  jumpTo(time) {
    // NB: adding small fraction to ensure proper activeness
    this.player.jumpTo(time + 0.001);
  }

  loadAss(e) {
    let reader = new FileReader();
    reader.onload = (e) => {
      let assText = e.target.result;
      fetch(assCompiler, {
        body: assText,
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST'
      })
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        if (json.error != null) {
          this.setState({
            errorBar: true,
            errorBarMessage: json.error
          });
          return;
        }
        const text = JSON.parse(json.data)
        const data = base64.decode(text)
        const typedArray = new Uint8Array(data);
        const inflated = pako.inflate(typedArray);
        const jsonStr = new TextDecoder("utf-8").decode(inflated);
        const config = JSON.parse(jsonStr);
        this.initialize(config[0]);
      });
    };
    reader.readAsText(e.target.files[0]);
  }

  requestMp3(e) {
    const url = URL.createObjectURL(e.target.files[0]);
    this.setState({
      mp3: url,
    });
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
    }
  }
}

export default AssLoader;
