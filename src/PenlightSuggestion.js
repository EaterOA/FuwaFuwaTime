import React, { PureComponent } from 'react';

class PenlightSuggestion extends PureComponent {
  render() {
    if (this.props.suggestion == null ||
        this.props.suggestion.length === 0 ||
        this.props.enable !== true) {
      return null;
    }
    const elements = this.props.suggestion.map((character, idx) => {
      return (
        <span
          key={idx}
          className={"color-" + character.toLowerCase()}
        >
          {'\u00A0' + character}
        </span>
      );
    });
    return (
      <div id="penlight-suggestion">
        <em>Penlight color: </em>
        { elements }
      </div>
    );
  }
}

export default PenlightSuggestion;
