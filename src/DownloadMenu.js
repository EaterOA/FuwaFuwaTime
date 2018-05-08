import React, { PureComponent } from 'react';

import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import DownloadIcon from 'material-ui/svg-icons/action/get-app';
import CircularProgress from 'material-ui/CircularProgress';

class DownloadMenu extends PureComponent {
  render() {
    return (
      <IconMenu
        iconButtonElement={
          <IconButton
            disabled={this.props.loading}
          >
            {this.props.loading ? (
              <CircularProgress
                color={"white"}
                size={24}
              />
            ) : (
              <DownloadIcon/>
            )}
          </IconButton>
        }
        iconStyle={{backgroundColor: 'transparent', color:'white'}}
        targetOrigin={{horizontal: 'right', vertical: 'top'}}
        anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
      >
          <MenuItem
            href="pdf/all_a5.pdf"
            primaryText="Download PDF (all songs)"
          />
          <MenuItem
            href="pdf/hakodate_d2_a5.pdf"
            primaryText="Download PDF (Hakodate day 2)"
          />
      </IconMenu>
    );
  }
};
DownloadMenu.muiName = 'IconMenu';

export default DownloadMenu;
