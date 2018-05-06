import React, { PureComponent } from 'react';

import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';
import TextField from 'material-ui/TextField';

import UnsearchableMenuItem from './UnsearchableMenuItem';

class SongMenu extends PureComponent {
  constructor(props, states) {
    super(props, states);
    this.state = {
      filterText: ""
    };
    this.menuCloseDelay = 100;
  }
  static getFilteredList(songs, text) {
    let regex = null;
    if (text) {
      let escapeRegExp = (str) => str.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");
      regex = new RegExp(escapeRegExp(text), "i");
    }
    const newList = songs
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
  removeFilter = () => {
    window.setTimeout(() => {
      this.setState({
        filterText: "",
      });
    }, this.menuCloseDelay * 2);
  };
  handleFilter = (e) => {
    this.setState({
      filterText: e.target.value,
    });
  };
  render() {
    return (
      <IconMenu
        disableAutoFocus={true}
        iconButtonElement={<IconButton><MenuIcon /></IconButton>}
        targetOrigin={{horizontal: 'left', vertical: 'top'}}
        anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
        maxHeight={window.innerHeight * 0.8 - 50}
        onItemClick={this.removeFilter}
        clickCloseDelay={this.menuCloseDelay}
      >
        <UnsearchableMenuItem disabled>
          <TextField
            autoFocus={!window.matchMedia("(max-width: 768px)").matches}
            hintText={'Filter'}
            value={this.state.filterText}
            onFocus={this.props.onMenuFocus}
            onBlur={this.props.onMenuBlur}
            onChange={this.handleFilter}
          />
        </UnsearchableMenuItem>
        {
          SongMenu
            .getFilteredList(this.props.songs, this.state.filterText)
            .map((song) => {
              return (
                <UnsearchableMenuItem
                  key={song.id}
                  text={song.name}
                  onClick={() => this.props.songClick(song.id)}
                />
              );
            })
        }
      </IconMenu>
    );
  }
};
SongMenu.muiName = 'IconMenu';

export default SongMenu;
