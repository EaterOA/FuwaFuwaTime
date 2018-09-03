import React, { PureComponent } from 'react';

import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';

class SeriesMenu extends PureComponent {
  render() {
    let menuIcon = null;
    let menuItems = [];
    if (this.props.seriesConfig != null) {
      menuIcon = (
        <img src={this.props.seriesConfig[this.props.series].icon} alt={this.props.series}/>
      );

      for (const series of Object.values(this.props.seriesConfig)) {
        menuItems.push(
          <MenuItem
            key={series.id}
            onClick={() => {
              this.props.onClick(series.id);
            }}
            value={series.id}
            primaryText={
              <img
                style={{width: '240px'}}
                src={series.logo}
                alt={series.name}
              />
            }
          />
        );
      }
    }
      
    return (
      <IconMenu
        iconButtonElement={
          <IconButton
            style={{
              height: null,
              width: null,
            }}
            iconStyle={{
              width: '40px'
            }}
          >
            {menuIcon}
          </IconButton>
        }
        style={{
          height: null,
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
        anchorOrigin={{"horizontal":"left","vertical":"bottom"}}
        targetOrigin={{"horizontal":"left","vertical":"top"}}
      >
        {menuItems}
      </IconMenu>
    );
  }
};
SeriesMenu.muiName = 'IconMenu';

export default SeriesMenu;
