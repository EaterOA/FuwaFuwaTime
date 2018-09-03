import React, { PureComponent } from 'react';
import IconButton from 'material-ui/IconButton';
import InfoIcon from 'material-ui/svg-icons/action/info';
import ClearIcon from 'material-ui/svg-icons/content/clear';

class AboutButton extends PureComponent {
  render() {
    return (
      <IconButton
        {...this.props}
      >
        {this.props.open ? (
          <ClearIcon color='white'/>
        ) : (
          <InfoIcon color='white'/>
        )}
      </IconButton>
    );
  }
};
AboutButton.muiName = 'IconButton';

export default AboutButton;
