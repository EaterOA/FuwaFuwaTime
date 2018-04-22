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
      songs: SongMenu.getFilteredList(props.songs, "")
    };
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    return {
      songs: SongMenu.getFilteredList(nextProps.songs, "")
    };
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
  handleFilter = (e) => {
    this.setState({
      songs: SongMenu.getFilteredList(this.props.songs, e.target.value)
    });
  };
  render() {
    return (
      <IconMenu
        disableAutoFocus={true}
        iconButtonElement={<IconButton><MenuIcon /></IconButton>}
        targetOrigin={{horizontal: 'left', vertical: 'top'}}
        anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
      >
        <UnsearchableMenuItem disabled>
          <TextField
            autoFocus={!window.matchMedia("(max-width: 768px)").matches}
            hintText={'Filter'}
            onFocus={this.props.onMenuFocus}
            onBlur={this.props.onMenuBlur}
            onChange={this.handleFilter}
          />
        </UnsearchableMenuItem>
        {
          this.state.songs
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
