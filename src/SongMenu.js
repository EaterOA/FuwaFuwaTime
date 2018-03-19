import React, { Component } from 'react';

import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';
import TextField from 'material-ui/TextField';

class SongMenu extends Component {
  constructor(props, states) {
    super(props, states);
    this.state = {
      filterRegex: null,
      searchText: '',
    };
  }
  handleFilter = (e) => {
    const text = e.target.value;
    if (text === this.state.searchText) {
      return;
    }
    let regex = null;
    if (text) {
      let escapeRegExp = (str) => str.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");
      regex = new RegExp(escapeRegExp(text), "i");
    }
    this.setState({
      filterRegex: regex,
      searchText: text,
    });
  };
  render() {
    return (
      <IconMenu
        onKeyPress={()=>{}}
        onClick={()=>{}}
        touchTapCloseDelay={0}
        iconButtonElement={<IconButton><MenuIcon /></IconButton>}
        targetOrigin={{horizontal: 'left', vertical: 'top'}}
        anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
      >
        <MenuItem disabled>
          <TextField
            ref={(ref) => (this.searchTextField = ref)}
            autoFocus={!window.matchMedia("(max-width: 768px)").matches}
            hintText={'Filter'}
            onFocus={this.props.onMenuFocus}
            onBlur={this.props.onMenuBlur}
            onChange={this.handleFilter}
            value={this.state.searchText}
          />
        </MenuItem>
        <div>
          {
            this.props.songs
            .filter((song) => {
              if (song.hidden) {
                return false;
              }
              if (this.state.filterRegex != null) {
                if (!this.state.filterRegex.test(song.name)) {
                  return false;
                }
              }
              return true;
            })
            .map((song) => {
              return (
                <MenuItem
                  key={song.id}
                  primaryText={song.name}
                  onClick={() => this.props.songClick(song.id)}
                />
              );
            })
          }
        </div>
      </IconMenu>
    );
  }
};
SongMenu.muiName = 'IconMenu';

export default SongMenu;
