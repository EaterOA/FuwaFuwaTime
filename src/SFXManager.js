class SFXManager {
  constructor(path, numChannels=1, volume=1.0) {
    console.assert(numChannels > 0);
    this.currentChannel = 0;
    this.channels = [];
    for (let i = 0; i < numChannels; i++) {
      let audio = new Audio();
      audio.src = path;
      audio.volume = volume;
      audio.load();
      this.channels.push(audio);
    }
  }
  updateVolume(volume) {
    for (let channel of this.channels) {
      channel.volume = volume;
    }
  }
  play() {
    this.channels[this.currentChannel].currentTime = 0;
    this.channels[this.currentChannel].play();
    this.currentChannel++;
    if (this.currentChannel === this.channels.length) {
      this.currentChannel = 0;
    }
  }
}

export default SFXManager;
