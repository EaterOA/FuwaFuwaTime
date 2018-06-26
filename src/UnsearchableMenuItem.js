import React, { Component } from 'react';
import SongMenuItem from './SongMenuItem';

class UnsearchableMenuItem extends Component {
  render() {
    return (
      <SongMenuItem
        primaryText={this.props.text}
        {...this.props}
      />
    );
  }
};
UnsearchableMenuItem.muiName = 'MenuItem';

export default UnsearchableMenuItem;
