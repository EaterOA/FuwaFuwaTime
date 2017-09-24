import React, { PureComponent } from 'react';

class AudioPlayer extends PureComponent {
  constructor() {
    super();
    this.audioEl = null;
  }
  render() {
    return (
      <audio
        id='player'
        controls
        ref={(element) => { this.audioEl = element; }}
      >
        { this.props.ogg ? <source src={this.props.ogg} type='audio/ogg'/> : null }
        { this.props.mp3 ? <source src={this.props.mp3} type='audio/mp3'/> : null }
      </audio>
    );
  }
  componentDidMount() {
    this.audioEl.volume = this.props.defaultVolume;
    this.audioEl.addEventListener('volumechange', () => {
      this.props.onVolumeChange(this.audioEl.volume);
    });
    this.audioEl.addEventListener('timeupdate', () => {
      this.props.onTimeUpdate(this.audioEl.currentTime);
    });
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
}

export default AudioPlayer;
