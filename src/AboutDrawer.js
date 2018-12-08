import React, { Component } from 'react';

import Drawer from 'material-ui/Drawer';
import {Tabs, Tab} from 'material-ui/Tabs';

import changelog from './changelog.json';

class AboutDrawer extends Component {
  createTextAndSongLinkElements = (text) => {
    let splits = [{ text: text }];
    for (let mapping of Object.values(this.props.mappings)) {
      let nextSplit = []
      for (let split of splits) {
        if (!split.text) {
          nextSplit.push(split);
          continue;
        }
        let songSplit = split.text.split(mapping.name);
        for (let i = 0; i < songSplit.length; i++) {
          nextSplit.push({ text: songSplit[i] });
          if (i+1 < songSplit.length) {
            nextSplit.push({ name: mapping.name, id: mapping.id, series: mapping.series });
          }
        }
      }
      splits = nextSplit;
    }
    let elements = [];
    for (let i = 0; i < splits.length; i++) {
      const split = splits[i];
      if (split.text) {
        elements.push(
          <span
            key={i}
            dangerouslySetInnerHTML={{__html: split.text}}
          />
        );
      } else {
        elements.push(
          <a
            key={i}
            className={
              "changelog-song-name" +
              " " + split.series
            }
            href={'#' + split.id}
            onClick={() => this.props.toggle()}
          >
            {split.name}
          </a>
        );
      }
    }
    return elements;
  };
  render() {
    let changelogElements = [];
    for (let i = 0; i < changelog.length; i++) {
      const change = changelog[i];
      let elements = this.createTextAndSongLinkElements(change.change);
      changelogElements.push(
        <li key={i} >
          <span className="changelog-date">{change.date}: </span>
          <span className="changelog-text">{elements}</span>
        </li>
      );
    }
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
            <p>FuwaFuwaTime is an interactive callguide mostly for <strong>Love Live!</strong> songs. See <a href="https://www.reddit.com/r/LoveLive/comments/4ac21a/beginners_guide_to_basic_concert_callschant/">this</a> for an explanation for what calls are.</p>
            <p>There may be calls for songs of other series (e.g. BanG Dream), but those will likely remain fairly limited.</p>
            <p>Note that in practice there is no definitive set of calls that everyone follows to the letter - this interactive callguide only presents one version for each song that hits most of the common calls. You and the other livers in the concert or live viewing may do something minorly or majorly different. Simply make sure not to be overly disruptive and avoid injuring others - everyone is there to have fun and to enjoy the show.</p>
            <h2>How to use</h2>
            <ol className="instructions-list">
              <li>To start, select a song from the menu on the top-left. Clicking on the icon next to the menu allows you to switch song lists to a different series.</li>
              <li>Click the play button on the audio player, and follow the lyrics as they highlight
                <ul>
                  <li>Calls are colored in <span className="calls-style">red</span></li>
                  <li>Non-call instructions are colored in <span className="instructions-style">purple</span></li>
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
            <h2>Known issues</h2>
            <p>On desktop, switching to a different tab may cause SFX to become delayed</p>
            <p>On mobile, SFX may not play or may play with a ~150ms delay</p>
            <p><em>Missing songs (30)</em>: Aqours HEROES, Todokanai Hoshi da to Shitemo, Humming Friend, Yume de Yozora o Terashitai, Pops Heart de Odorun damon, Sora mo Kokoro mo Hareru kara, Guilty Eyes Fever, Sky Journey, Landing Action Yeah!!, summer songs x 4, Kimi no Hitomi o Meguru Bouken, "MY LIST" to you, solo songs x 9, Sakura Bye Bye, Sotsugyou Desu ne, Guilty!? Farewell Party, Hajimari Road, Yosoku Fukanou Driving, Marine Border Parasol</p>
            <h2>Contact</h2>
            <p>Direct all bug reports, questions, concerns, and complaints to <a href="https://www.reddit.com/user/gacha4life/"><strong>gacha4life</strong></a></p>
            <p>You can also submit anonymous feedback through <a href="https://goo.gl/forms/lytAFNDustx5ZswF2">this survey</a></p>
            <h2>Thanks</h2>
            <ul className="credits-list">
              <li><strong>arbshortcake</strong> for call timing and QC</li>
              <li><strong>xIceArcher</strong> for karaoke timing, lyrics QC</li>
              <li><strong>ramen</strong> for call research</li>
              <li><strong>Chezz</strong> for lyrics, call timing, and BanG Dream calls</li>
              <li><strong>Ippikiryu</strong> for lyrics QC</li>
              <li><strong>Cornsplosion</strong> for lyrics QC</li>
              <li><strong>Yunii</strong> for call layout advice and QC</li>
              <li><strong>Eter</strong> for call layout/style advice</li>
              <li><strong>mr_dr_dj</strong> for song list advice and live info</li>
              <li><a href="https://onibe.moe"><strong>Team Onibe</strong></a> for designing the official unofficial Love Live! callguides</li>
              <li><a href="https://lovelive.ganbaru.by/"><strong>Love Live! Events Site</strong></a> for reference live info</li>
              <li><a href="http://bandori.wikia.com/wiki"><strong>BanG Dream! Wikia</strong></a> for romaji lyrics</li>
              <li><a href="http://bangdream.seesaa.net/"><strong>Bandori! Poppin' Call!</strong></a> for reference BanG Dream callguides</li>
            </ul>
          </div></Tab>

          <Tab label="Downloads"><div className="info-page">
            <h2>PDF callguides</h2>
            <p>The lyrics/calls defined in FuwaFuwaTime are used to generate these PDF callguides (A5 size):</p>
            <ul className='pdf-list'>
              <li><a href="pdf/4th_live_a5.pdf">Aqours 4th Love Live</a></li>
              <li><a href="pdf/3rd_live_a5.pdf">Aqours 3rd Love Live tour main setlist</a></li>
              <li><a href="pdf/hakodate_d2_a5.pdf">Hakodate Unit Carnival day 2 setlist</a></li>
              <li><a href="pdf/all_a5.pdf">All songs</a></li>
            </ul>
          </div></Tab>

          <Tab label="Changelog"><div className="info-page">
            <h2>Changelog</h2>
            <ul className="changelog-list">
              { changelogElements }
            </ul>
          </div></Tab>

        </Tabs>
      </Drawer>
    )
  }
}
AboutDrawer.muiName = 'Drawer';

export default AboutDrawer
