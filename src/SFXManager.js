import pizzicato from 'pizzicato';

class SFXManager {
  constructor(path, volume=1.0) {
    this.sfx = new pizzicato.Sound({
      source: 'file',
      options: {
        path: path,
        volume: volume,
        attack: 0,
      },
    });
  }
  updateVolume(volume) {
    this.sfx.volume = volume;
  }
  play() {
    this.sfx.play();
  }
}

export default SFXManager;
