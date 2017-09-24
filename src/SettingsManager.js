class SettingsManager {
  constructor() {
    this.settings = {
      callSFX: false,
      volume: 0.5,
    };
    this.loadSettings();
    this.changeSetting = this.changeSetting.bind(this);
  }

  loadSettings() {
    let callSFXSetting = localStorage.callSFX;
    if (callSFXSetting != null) {
      this.settings.callSFX = callSFXSetting === 'true';
    }

    let volumeSetting = localStorage.volume;
    if (volumeSetting != null) {
      this.settings.volume = parseFloat(volumeSetting);
    }
  }

  changeSetting(key, value=null) {
    if (key === 'callSFX') {
      this.settings.callSFX = !this.settings.callSFX;
      localStorage.setItem('callSFX', this.settings.callSFX);

    } else if (key === 'volume') {
      this.settings.volume = value;
      localStorage.setItem('volume', this.settings.volume);

    } else {
      console.assert(false, 'Unknown settings key ' + key);
    }
  }

}

export default SettingsManager;
