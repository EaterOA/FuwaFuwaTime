class SettingsManager {
  constructor() {
    this.settings = {
      callSFX: false,
    };
    this.changeSetting = this.changeSetting.bind(this);
  }

  loadSettings() {
    let callSFXSetting = localStorage.callSFX;
    if (callSFXSetting != null) {
      this.settings.callSFX = callSFXSetting === 'true';
    }
  }

  changeSetting(key, value=null) {
    if (key === 'callSFX') {
      this.settings.callSFX = !this.settings.callSFX;
      localStorage.setItem('callSFX', this.settings.callSFX);

    } else {
      console.assert('unknown settings key ' + key);
    }
  }

}

export default SettingsManager;
