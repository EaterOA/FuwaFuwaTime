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
  }
  componentDidUpdate() {
    this.audioEl.load();
  }
  getCurrentTime() {
    return this.audioEl.currentTime;
  }
  jumpTo(time) {
    this.audioEl.currentTime = time;
  }
}

export default AudioPlayer;
