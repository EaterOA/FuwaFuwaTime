import React, { PureComponent } from 'react';

import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import DownloadIcon from 'material-ui/svg-icons/action/get-app';

class DownloadMenu extends PureComponent {
  render() {
    return (
      <IconMenu
        iconButtonElement={<IconButton><DownloadIcon /></IconButton>}
        iconStyle={{backgroundColor: 'transparent', color:'white'}}
        targetOrigin={{horizontal: 'right', vertical: 'top'}}
        anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
      >
          <MenuItem
            primaryText="Download PDF (A5)"
            onClick={() => {this.props.download('A5')}}
          />
      </IconMenu>
    );
  }
};
DownloadMenu.muiName = 'IconMenu';

export default DownloadMenu;
