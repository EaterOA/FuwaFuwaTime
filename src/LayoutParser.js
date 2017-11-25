class LayoutParser {
  constructor() {
    this.parseMapping = this.parseMapping.bind(this);
  }

  parseMapping(song) {
    let mapping = Object.assign({}, song);
    delete mapping.layout;
    delete mapping.lyrics;
    delete mapping.calls;
    mapping.left = [];
    mapping.right = [];
    if (song.layout == null || song.layout.length === 0) {
      return mapping;
    }

    // lex
    const layout = song.layout.join('\n');
    const tokenStrings = layout.match(/\n|\[|\]|{|}|[^[\]{}\n]+/g);
    const tokens = tokenStrings.map((str) => {
      if (str === '{') return {type: "opening_brace"};
      if (str === '}') return {type: "closing_brace"};
      if (str === '[') return {type: "opening_bracket"};
      if (str === ']') return {type: "closing_bracket"};
      if (str === '\n') return {type: "newline"};
      return {type: "text", str: str};
    });

    // stateful parse
    let stream = mapping.left;
    let callMode = false;
    let together = false;
    let repeatCount = 0;
    let repeatFrom = null;
    let push = null;
    let timings = { calls: song.calls, lyrics: song.lyrics };
    let refs = { calls: 0, lyrics: 0 };
    for (let i = 0; i < tokens.length;) {
      if (tokens[i].type === "text") {
        stream.push({type:"text", text: tokens[i].str, src: (callMode ? 'calls' : 'lyrics'), push:push});
        push = null;
        i += 1;

      } else if (tokens[i].type === "newline") {
        stream.push({type:"newline"});
        i += 1;

      } else if (tokens[i].type === "opening_bracket") {
        if (!(i+2 < tokens.length &&
            tokens[i+1].type === "text" &&
            tokens[i+2].type === "closing_bracket")) {
          console.warn("syntax error in layout, i=" + i);
          break;
        }
        const func = tokens[i+1].str.split(',');
        if (func[0] === "call") {
          callMode = true;
          if (func.length > 1) {
            repeatFrom = stream.length;
            repeatCount = parseInt(func[1], 10);
          }
        } else if (func[0] === "end-call") {
          callMode = false;
          if (repeatCount > 0) {
            let repeatTo = stream.length;
            for (let i = 0; i < repeatCount-1; i++) {
              for (let j = repeatFrom; j < repeatTo; j++) {
                if (stream[j].type === 'atom') {
                  stream[j].alts.push(stream.length);
                  stream.push({
                    type: 'repeat',
                    range: timings['calls'][refs['calls']],
                    src: 'calls',
                  });
                  refs['calls']++;
                }
              }
            }
            stream.push({type:"text", text: ' x ' + repeatCount, src: 'calls'});
            repeatCount = 0;
          }
        } else if (func[0] === "next-col") {
          stream = mapping.right;
        } else if (func[0] === "push") {
          push = func[1];
        } else if (func[0] === "together") {
          together = true;
        }
        i += 3;

      } else if (tokens[i].type === "opening_brace") {
        if (!(i+2 < tokens.length &&
            tokens[i+1].type === "text" &&
            tokens[i+2].type === "closing_brace")) {
        console.log(tokens[i+2].type);
          console.warn("syntax error in layout, i=" + i);
          break;
        }
        const text = tokens[i+1].str;
        i += 3;
        const src = callMode ? 'calls' : 'lyrics';
        if (refs[src] >= timings[src].length) {
          console.warn('lyrics ref ' + refs[src] + ' for src "' + src + '" higher than number of timings');
          break;
        }
        stream.push({
          type: 'atom',
          src: (together ? 'calls' : src),
          text: text,
          range: timings[src][refs[src]],
          push: push,
          alts: [],
        });
        push = null;
        together = false;
        refs[src] += 1;
      } else {
        console.warn("syntax error in layout, i=" + i);
        break;
      }
    }
    return mapping;
  }
}

export default LayoutParser;
