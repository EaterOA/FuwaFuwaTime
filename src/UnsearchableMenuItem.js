import React, { Component } from 'react';
import MenuItem from 'material-ui/MenuItem';

class UnsearchableMenuItem extends Component {
  render() {
    return (
      <MenuItem
        primaryText={this.props.text}
        {...this.props}
      />
    );
  }
};
UnsearchableMenuItem.muiName = 'MenuItem';

export default UnsearchableMenuItem;
