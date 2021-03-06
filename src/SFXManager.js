import pizzicato from 'pizzicato';

class SFXManager {
  constructor(path, volume=1.0, channels=2) {
    this.idx = 0;
    this.channels = [];
    for (let i = 0; i < channels; i++) {
      let sfxEle = new pizzicato.Sound({
        source: 'file',
        options: {
          path: path,
          volume: volume,
          attack: 0,
        },
      });
      this.channels.push(sfxEle);
    }
  }
  updateVolume(volume) {
    for (let channel of this.channels) {
      channel.volume = volume;
    }
  }
  play() {
    this.channels[this.idx].play();
    this.idx = (this.idx+1) % this.channels.length;
  }
}

export default SFXManager;
