class SettingsManager {
  constructor() {
    this.settings = {
      callSFX: true,
      volume: 0.5,
      openAbout: true,
      fadePast: true,
      highlightActive: true,
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

    let openAboutSetting = localStorage.openAbout;
    if (openAboutSetting != null) {
      this.settings.openAbout = openAboutSetting === 'true';
    }

    let fadePastSetting = localStorage.fadePast;
    if (fadePastSetting != null) {
      this.settings.fadePast = fadePastSetting === 'true';
    }

    let highlightActiveSetting = localStorage.highlightActive;
    if (highlightActiveSetting != null) {
      this.settings.highlightActive = highlightActiveSetting === 'true';
    }
  }

  changeSetting(key, value=null) {
    if (key === 'callSFX') {
      if (value == null) {
        this.settings.callSFX = !this.settings.callSFX;
      }
      localStorage.setItem('callSFX', this.settings.callSFX);

    } else if (key === 'volume') {
      this.settings.volume = value;
      localStorage.setItem('volume', this.settings.volume);

    } else if (key === 'openAbout') {
      this.settings.openAbout = value;
      localStorage.setItem('openAbout', this.settings.openAbout);

    } else if (key === 'fadePast') {
      if (value == null) {
        this.settings.fadePast = !this.settings.fadePast;
      }
      localStorage.setItem('fadePast', this.settings.fadePast);

    } else if (key === 'highlightActive') {
      if (value == null) {
        this.settings.highlightActive = !this.settings.highlightActive;
      }
      localStorage.setItem('highlightActive', this.settings.highlightActive);

    } else {
      console.assert(false, 'Unknown settings key ' + key);
      return;
    }
  }

}

export default SettingsManager;
