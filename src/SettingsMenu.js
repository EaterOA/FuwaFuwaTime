import React, { PureComponent } from 'react';

import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import SettingsIcon from 'material-ui/svg-icons/action/settings';
import BlockIcon from 'material-ui/svg-icons/content/block';
import DoneIcon from 'material-ui/svg-icons/action/done';

class SettingsMenu extends PureComponent {
  render() {
    return (
      <IconMenu
        touchTapCloseDelay={0}
        iconButtonElement={<IconButton><SettingsIcon /></IconButton>}
        iconStyle={{backgroundColor: 'transparent', color:'white'}}
        targetOrigin={{horizontal: 'right', vertical: 'top'}}
        anchorOrigin={{horizontal: 'right', vertical: 'top'}}
      >
          <MenuItem
            primaryText="Call SFX"
            rightIcon={
              this.props.callSFX ? <DoneIcon/> : <BlockIcon/>
            }
            onClick={() => {this.props.changeSetting('callSFX')}}
          />
      </IconMenu>
    );
  }
};
SettingsMenu.muiName = 'IconMenu';

export default SettingsMenu;
