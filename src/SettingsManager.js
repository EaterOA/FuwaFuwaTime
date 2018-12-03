class SettingsManager {
  constructor() {
    this.settings = {
      callSFX: true,
      callSFXVolume: 0.8,
      muted: false,
      volume: 0.5,
      fadePast: true,
      highlightActive: true,
      karaoke: true,
      markers: true,
      series: 'llss',
      penlightSuggestion: true,
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

    let mutedSetting = localStorage.muted;
    if (mutedSetting != null) {
      this.settings.muted = mutedSetting === 'true';
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

    let markersSetting = localStorage.markers;
    if (markersSetting != null) {
      this.settings.markers = markersSetting === 'true';
    }

    let seriesSetting = localStorage.series;
    if (seriesSetting != null) {
      this.settings.series = seriesSetting;
    }

    let penlightSuggestionSetting = localStorage.penlightSuggestion;
    if (penlightSuggestionSetting != null) {
      this.settings.penlightSuggestion = penlightSuggestionSetting === 'true';
    }
  }

  changeSetting(key, value=null) {
    if (key === 'callSFX') {
      if (value == null) {
        value = !this.settings.callSFX;
      }
      this.settings.callSFX = value;
      localStorage.setItem('callSFX', this.settings.callSFX);

    } else if (key === 'callSFXVolume') {
      console.assert(0.0 <= value && value <= 1.0, 'Illegal callSFXVolume value: ' + value);
      this.settings.callSFXVolume = value;
      localStorage.setItem('callSFXVolume', this.settings.callSFXVolume);

    } else if (key === 'muted') {
      if (value == null) {
        value = !this.settings.muted;
      }
      this.settings.muted = value;
      localStorage.setItem('muted', this.settings.muted);

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

    } else if (key === 'markers') {
      if (value == null) {
        this.settings.markers = !this.settings.markers;
      }
      localStorage.setItem('markers', this.settings.markers);

    } else if (key === 'series') {
      this.settings.series = value;
      localStorage.setItem('series', this.settings.series);

    } else if (key === 'penlightSuggestion') {
      if (value == null) {
        this.settings.penlightSuggestion = !this.settings.penlightSuggestion;
      }
      localStorage.setItem('penlightSuggestion', this.settings.penlightSuggestion);

    } else {
      console.assert(false, 'Unknown settings key ' + key);
      return;
    }
  }

}

export default SettingsManager;
