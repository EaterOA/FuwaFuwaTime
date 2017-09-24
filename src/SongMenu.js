import React, { Component } from 'react';

import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';

class SongMenu extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return this.props.songs.length !== nextProps.songs.length;
  }
  render() {
    return (
      <IconMenu
        touchTapCloseDelay={0}
        iconButtonElement={<IconButton><MenuIcon /></IconButton>}
        targetOrigin={{horizontal: 'left', vertical: 'top'}}
        anchorOrigin={{horizontal: 'left', vertical: 'top'}}
      >
        {
          this.props.songs.map((song) => {
            return (
              <MenuItem
                key={song.id}
                primaryText={song.name}
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
