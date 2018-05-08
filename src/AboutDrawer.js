import React, { Component } from 'react';

import Drawer from 'material-ui/Drawer';
import {Tabs, Tab} from 'material-ui/Tabs';

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
        <Tabs>
          <Tab label="About"><div className="info-page">
            <h2>Welcome to <em>FuwaFuwaTime</em></h2>
            <p>FuwaFuwaTime is an interactive callguide for <strong>Love Live!</strong> songs. See <a href="https://www.reddit.com/r/LoveLive/comments/4ac21a/beginners_guide_to_basic_concert_callschant/">this</a> for an explanation for what calls are.</p>
            <p className="small">(No relationship to the popular song of the same name, other than the creator thought it was a clever pun but now regrets that this site is no longer Googleable)</p>
            <p>
            Note that in reality there is no definitive set of calls that everyone follows to the letter - this interactive callguide only presents one version for each song that hits most of the common calls. You and the other livers in the concert or live viewing may do something minorly or majorly different. Simply make sure not to be overly disruptive and avoid injuring others - everyone is there to have fun and to enjoy the show.</p>
            <h2>How to use</h2>
            <ol className="instructions-list">
              <li>To start, select a song from the menu on the top-left.</li>
              <li>Click the play button on the audio player, and follow the lyrics as they highlight
                <ul>
                  <li>Calls are colored in <span className="calls-style">red</span></li>
                  <li>Annotations/notes are colored in <span className="notes-style">purple</span></li>
                </ul>
              </li>
              <li>You can also click any line of the lyrics to jump the audio to that location</li>
              <li>Configure the call volume, highlight behavior, etc, from the cogwheel menu on the top-right</li>
              <li>Use keyboard controls to control the audio
                <ul>
                  <li><strong>Spacebar</strong> to toggle play/pause</li>
                  <li><strong>Right arrow</strong> to move forward by 2 secs</li>
                  <li><strong>Left arrow</strong> to move backward by 2 secs</li>
                </ul>
              </li>
            </ol>
            <h2>Contact</h2>
            <p>Direct all bug reports, questions, concerns, and complaints to <a href="https://www.reddit.com/user/gacha4life/"><strong>gacha4life</strong></a></p>
            <h2>Thanks</h2>
            <ul className="credits-list">
              <li><strong>arbshortcake</strong> for call timing</li>
              <li><strong>ramen</strong> for call research</li>
              <li><strong>Chezz</strong> for lyrics and call timing</li>
              <li><strong>Ippikiryu</strong> for lyrics QC</li>
              <li><strong>xIceArcher</strong> for lyrics QC</li>
              <li><strong>Cornsplosion</strong> for lyrics QC</li>
              <li><strong>Yunii</strong> for helping with call layout and QC</li>
              <li><strong>Eter</strong> for providing advice on call layout/style</li>
              <li><a href="https://onibe.moe"><strong>Team Onibe</strong></a> for designing the official unofficial Love Live! callguides</li>
            </ul>
          </div></Tab>

          <Tab label="Downloads"><div className="info-page">
            <h2>PDF callguides</h2>
            <p>The lyrics/calls defined in FuwaFuwaTime are used to generate these PDF callguides (A5 size):</p>
            <ul className='pdf-list'>
              <li><a href="pdf/hakodate_d2_a5.pdf">Hakodate Unit Carnival day 2 setlist</a></li>
              <li><a href="pdf/all_a5.pdf">All songs</a></li>
            </ul>
          </div></Tab>

          <Tab label="Changelog"><div className="info-page">
            <h2>Changelog</h2>
            <ul className="changelog-list">
              <li><strong>2018-05-07</strong>: Added Hakodate day 2 setlist PDF</li>
              <li><strong>2018-05-06</strong>: Added songs from Hakodate day 2 setlist</li>
              <li><strong>2017-10-20</strong>: First public release</li>
            </ul>
          </div></Tab>

        </Tabs>
      </Drawer>
    )
  }
}
AboutDrawer.muiName = 'Drawer';

export default AboutDrawer
