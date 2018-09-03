import React, { PureComponent } from 'react';

import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';
import TextField from 'material-ui/TextField';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';

import UnsearchableMenuItem from './UnsearchableMenuItem';

class SongMenu extends PureComponent {
  constructor(props, states) {
    super(props, states);
    this.state = {
      filterText: "",
      bin: "subunits",
      lastOpened: "",
    };
  }
  static getFilteredList(songs, text) {
    let regex = null;
    if (text) {
      let escapeRegExp = (str) => str.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");
      regex = new RegExp(escapeRegExp(text), "i");
    }
    const newList = Object.values(songs)
      .filter((song) => {
        if (song.hidden) {
          return false;
        }
        if (regex != null && !regex.test(song.name)) {
          return false;
        }
        return true;
      })
    return newList;
  }
  handleFilter = (e) => {
    this.setState({
      filterText: e.target.value,
      lastOpened: "",
    });
  };
  handleBinning = (e) => {
    this.setState({
      bin: e.target.value,
      lastOpened: "",
    });
  };
  makeMenuItem = (id, name) => {
    const smallScreen = window.matchMedia("(max-width: 768px)").matches;
    return (
      <UnsearchableMenuItem
        key={id}
        text={name}
        style={ !smallScreen ? {} : {
          width: null,
          lineHeight: '32px',
          maxHeight: '32px',
          minHeight: '32px',
          fontSize: '14px',
        }}
        onClick={() => {
          this.props.songClick(id);
          this.setState({
            lastOpened: "",
          });
          window.setTimeout(() => {
            this.setState({
              filterText: "",
            });
          }, this.menuCloseDelay * 2);
        }}
      />
    );
  };
  makeBinItem = (id, name, elements) => {
    const smallScreen = window.matchMedia("(max-width: 768px)").matches;
    return (
      <UnsearchableMenuItem
        key={id}
        text={name}
        menuItems={elements}
        rightIcon={<ArrowDropRight />}
        anchorOrigin={{"horizontal":"right","vertical":(smallScreen?"bottom":"top")}}
        targetOrigin={{"horizontal":"left","vertical":"top"}}
        nestedMenuStyle={{
          position: "relative",
          maxWidth: (smallScreen ? "288px" : null),
        }}
        onClick={() => {
          this.setState({
            lastOpened: id,
          });
        }}
        open={this.state.lastOpened === id}
      />
    );
  };
  makeBins = (binConfig, idMap) => {
    let binElements = [];
    for (const group of binConfig) {
      const songElements = group.songs
        .filter((a) => idMap.get(a) != null)
        .sort((a,b) => idMap.get(a).localeCompare(idMap.get(b), 'en', {'sensitivity': 'base'}))
        .map((id) => this.makeMenuItem(id, idMap.get(id)))
      if (songElements.length > 0) {
        binElements.push(
          this.makeBinItem(group.id, group.name, songElements)
        );
      }
    }
    return binElements;
  };
  render() {
    const smallScreen = window.matchMedia("(max-width: 768px)").matches;

    const songs = SongMenu.getFilteredList(this.props.songs, this.state.filterText)
    let idMap = new Map();
    for (const song of songs) {
      idMap.set(song.id, song.name);
    }
    let menuElements = []
    if (this.props.seriesConfig != null) {
      const seriesConfig = this.props.seriesConfig[this.props.series];
      if (this.state.bin === "subunits") {
        menuElements = this.makeBins(seriesConfig.subunits, idMap);
      } else if (this.state.bin === "lives") {
        menuElements = this.makeBins(seriesConfig.lives, idMap);
      } else {
        menuElements = seriesConfig.songs
          .filter((id) => idMap.has(id))
          .map((id) => this.props.songs[id])
          .sort((a,b) => a.name.localeCompare(b.name, 'en', {'sensitivity': 'base'}))
          .map((song) => this.makeMenuItem(song.id, song.name));
      }
    }

    return (
      <IconMenu
        disableAutoFocus={true}
        iconButtonElement={<IconButton><MenuIcon color='white'/></IconButton>}
        targetOrigin={{horizontal: 'left', vertical: 'top'}}
        anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
        maxHeight={window.innerHeight * 0.8 - 50}
        clickCloseDelay={this.menuCloseDelay}
      >
        <UnsearchableMenuItem disabled>
          <TextField
            autoFocus={!smallScreen}
            hintText={'Find'}
            value={this.state.filterText}
            onFocus={this.props.onMenuFocus}
            onBlur={this.props.onMenuBlur}
            onChange={this.handleFilter}
          />
        </UnsearchableMenuItem>
        <UnsearchableMenuItem disabled>
          <RadioButtonGroup
            name="binning"
            valueSelected={this.state.bin}
            onChange={this.handleBinning}
          >
            <RadioButton
              value="subunits"
              label="By subunits"
            />
            <RadioButton
              value="lives"
              label="By lives"
            />
            <RadioButton
              value="all"
              label="All"
            />
          </RadioButtonGroup>
        </UnsearchableMenuItem>
        {
          menuElements
        }
      </IconMenu>
    );
  }
};
SongMenu.muiName = 'IconMenu';

export default SongMenu;
