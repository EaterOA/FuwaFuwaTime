import React, { PureComponent } from 'react';

class AudioPlayer extends PureComponent {
  constructor() {
    super();
    this.audioEl = null;
  }
  render() {
    return (
      <audio
        id={this.props.elementId}
        controls
        ref={(element) => { this.audioEl = element; }}
      >
        { this.props.mp3 ? <source src={this.props.mp3} type='audio/mp3'/> : null }
      </audio>
    );
  }
  componentDidMount() {
    this.audioEl.volume = this.props.defaultVolume;
    this.audioEl.addEventListener('canplay', () => {
      //console.log("Loaded: ", this.props.mp3);
    });
    this.audioEl.addEventListener('volumechange', () => {
      if (this.props.onVolumeChange) {
        this.props.onVolumeChange(this.audioEl.volume);
      }
    });
    this.audioEl.addEventListener('play', () => {
      if (this.props.onPlay) {
        this.props.onPlay();
      }
    });
    this.audioEl.addEventListener('pause', () => {
      if (this.props.onPause) {
        this.props.onPause();
      }
    });
    this.audioEl.addEventListener('seeking', (e) => {
      if (this.props.onSeeked) {
        this.props.onSeeked(this.audioEl.currentTime);
      }
    });
    this.audioEl.addEventListener('timeupdate', () => {
      if (this.props.onTimeUpdate) {
        this.props.onTimeUpdate(this.audioEl.currentTime);
      }
    });
    this.audioEl.controlsList = 'nodownload';
  }
  componentDidUpdate() {
    this.audioEl.load();
  }
  getCurrentTime() {
    return this.audioEl.currentTime;
  }
  getDuration() {
    return this.audioEl.duration;
  }
  jumpTo(time) {
    this.audioEl.currentTime = time;
  }
  playing() {
    return !this.audioEl.paused && !this.audioEl.ended && this.audioEl.currentTime > 0;
  }
  toggle() {
    if (this.playing()) {
      this.audioEl.pause();
    } else {
      this.audioEl.play();
    }
  }
  play() {
    this.audioEl.play();
  }
  pause() {
    this.audioEl.pause();
  }
  changeVolume(volume) {
    this.audioEl.volume = volume;
  }
  setMuted(muted) {
    this.audioEl.muted = muted;
  }
}

export default AudioPlayer;
