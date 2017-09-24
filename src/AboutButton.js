import React, { PureComponent } from 'react';
import IconButton from 'material-ui/IconButton';
import InfoIcon from 'material-ui/svg-icons/action/info';

class AboutButton extends PureComponent {
  render() {
    return (
      <IconButton
        iconStyle={{color:'white'}}
        {...this.props}
      >
        <InfoIcon/>
      </IconButton>
    );
  }
};
AboutButton.muiName = 'IconButton';

export default AboutButton;
