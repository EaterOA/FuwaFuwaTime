import React, { PureComponent } from 'react';
import IconButton from 'material-ui/IconButton';
import InfoIcon from 'material-ui/svg-icons/action/info';
import ClearIcon from 'material-ui/svg-icons/content/clear';

class AboutButton extends PureComponent {
  render() {
    return (
      <IconButton
        iconStyle={{color:'white'}}
        {...this.props}
      >
        {this.props.open ? (
          <ClearIcon/>
        ) : (
          <InfoIcon/>
        )}
      </IconButton>
    );
  }
};
AboutButton.muiName = 'IconButton';

export default AboutButton;
