import React, { Component } from 'react';

import Drawer from 'material-ui/Drawer';
import IconButton from 'material-ui/IconButton';
import ClearIcon from 'material-ui/svg-icons/content/clear';

class AboutDrawer extends Component {
  render() {
    return (
      <Drawer
        open={this.props.open}
        onRequestChange={this.props.toggle}
        // i love hardcoding magic numbers
        containerStyle={{height: 'calc(100% - 64px)', top: 64}}
        width='100%'
        containerClassName='about-drawer'
        disableSwipeToOpen={true}
        openSecondary={true}
      >
        <IconButton
          style={{float:'right'}}
          onClick={this.props.toggle}
        >
          <ClearIcon/>
        </IconButton>
        <h2>About</h2>
        <p><strong>FuwaFuwaTime</strong>* is an interactive callguide for Love Live! songs. See <a href="https://www.reddit.com/r/LoveLive/comments/4ac21a/beginners_guide_to_basic_concert_callschant/">this</a> for an explanation for what calls are.</p>
        <p className="small">(*No relationship to the popular song of the same name, other than the creator thought it was a clever pun but now regrets that this app is no longer Googleable)</p>
        <p>
        Note that in reality there is no definitive set of calls that everyone follows to the letter - this interactive callguide only presents one version for each song that hits most of the common calls. You and the other livers in the concert or live viewing may do something minorly or majorly different.</p>
        <p className="small">(As long as you don't yakkai)</p>
        <h2>Contact</h2>
        <p>Direct all bug reports, questions, concerns, and complaints to <a href="https://www.reddit.com/user/gacha4life/"><strong>gacha4life</strong></a></p>
        <h2>Thanks</h2>
        <ul>
          <li><a href="https://onibe.moe"><strong>Team Onibe</strong></a> for designing the official unofficial Love Live! callguides</li>
          <li><strong>Yunii</strong> for helping with call layout and pointing out timing errors</li>
          <li><strong>Eter</strong> for providing advice on call layout/style</li>
        </ul>
      </Drawer>
    )
  }
}
AboutDrawer.muiName = 'Drawer';

export default AboutDrawer
