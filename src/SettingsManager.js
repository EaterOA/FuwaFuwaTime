class SettingsManager {
  constructor() {
    this.settings = {
      callSFX: true,
      callSFXVolume: 0.8,
      volume: 0.5,
      fadePast: true,
      highlightActive: true,
      karaoke: true,
    };
    this.loadSettings();
    this.changeSetting = this.changeSetting.bind(this);
  }

  loadSettings() {
    let callSFXSetting = localStorage.callSFX;
    if (callSFXSetting != null) {
      this.settings.callSFX = callSFXSetting === 'true';
    }

    let callSFXVolumeSetting = localStorage.callSFXVolume;
    if (callSFXVolumeSetting != null) {
      let f = parseFloat(callSFXVolumeSetting);
      if (!isNaN(f)) {
        if (f > 1.0) {
          f = 1.0;
        } else if (f < 0.0) {
          f = 0.0;
        }
        this.settings.callSFXVolume = f;
      }
    }

    let volumeSetting = localStorage.volume;
    if (volumeSetting != null) {
      this.settings.volume = parseFloat(volumeSetting);
    }

    let fadePastSetting = localStorage.fadePast;
    if (fadePastSetting != null) {
      this.settings.fadePast = fadePastSetting === 'true';
    }

    let highlightActiveSetting = localStorage.highlightActive;
    if (highlightActiveSetting != null) {
      this.settings.highlightActive = highlightActiveSetting === 'true';
    }

    let karaokeSetting = localStorage.karaoke;
    if (karaokeSetting != null) {
      this.settings.karaoke = karaokeSetting === 'true';
    }
  }

  changeSetting(key, value=null) {
    if (key === 'callSFX') {
      if (value == null) {
        this.settings.callSFX = !this.settings.callSFX;
      }
      localStorage.setItem('callSFX', this.settings.callSFX);

    } else if (key === 'callSFXVolume') {
      console.assert(0.0 <= value && value <= 1.0, 'Illegal callSFXVolume value: ' + value);
      this.settings.callSFXVolume = value;
      localStorage.setItem('callSFXVolume', this.settings.callSFXVolume);

    } else if (key === 'volume') {
      this.settings.volume = value;
      localStorage.setItem('volume', this.settings.volume);

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

    } else if (key === 'karaoke') {
      if (value == null) {
        this.settings.karaoke = !this.settings.karaoke;
      }
      localStorage.setItem('karaoke', this.settings.karaoke);

    } else {
      console.assert(false, 'Unknown settings key ' + key);
      return;
    }
  }

}

export default SettingsManager;
