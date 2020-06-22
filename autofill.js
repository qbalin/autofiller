const wait = waitTime => new Promise(resolve => setTimeout(resolve, waitTime));

const findElementByText = (text, elementType) => {
  /* XPath does not do RegExp, so find all the matching elements and return the one with the closest number of characters */

  /* 1. For elementType == 'label', find a label, and look if its text, or the text of any of its descendants contains the text 
  i :  <label>labelText</label>
  ii:  <label><span>labelText</span></label>
  */
  const results = document.evaluate(
    `//${elementType}[descendant-or-self::text()[contains(., "${text}")]]`,
    document,
    null,
    XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
    null,
  );

  /* 2. Find the best candidate for a given text. Consider the text "Filing Status" and the matched labels:
  i:  <label>Filing Status</label>
  ii: <label>Filing Status for California</label>
  Both are matches, but we'll prefer to return i over ii, so we check the length of the innerText and compare it with the text.
  */
  const possibleNodes = [];
  for (let i = 0; i < results.snapshotLength; i++) {
    possibleNodes.push(results.snapshotItem(i));
  }
  debugger;
  return possibleNodes.reduce((memo, value) => {
    console.log(memo);
    return Math.abs(memo.innerText.length - text.length) <=
      Math.abs(value.innerText.length - text.length)
      ? memo
      : value;
  }, possibleNodes[0]);
};

const findInputForLabel = labelNode => {
  if (!labelNode) {
    return null;
  }

  /* We found a label, great. Now let's find the associated input, there are 2 official methods: https://www.w3schools.com/tags/tag_label.asp
  i:   <label for='inputWithThisId'>labelText</label><input id='inputWithThisId'/>
  ii:  <label>labelText <input/></label>

  Unfortunately, we can see this non standard (and probably HTML-broken) way:
  iii: <div><label>labelText</label><input></div>
  In that case, the label has no id nor does it enclose the input. We will look for the closest input sibling then.
  */

  let input;
  /*  i  */
  if (labelNode.getAttribute('for')) {
    input = document.querySelector(`#${CSS.escape(labelNode.getAttribute('for'))}`);
    if (input) {
      return input;
    }
  }

  /*  ii  */
  input = document.evaluate('.//input', labelNode, null, XPathResult.ANY_UNORDERED_NODE_TYPE, null)
    .singleNodeValue;

  if (input) {
    return input;
  }

  /*  iii  */
  input = document.evaluate('..//input', labelNode, null, XPathResult.ANY_UNORDERED_NODE_TYPE, null)
    .singleNodeValue;

  if (input) {
    return input;
  }

  return null;
};

const wrapInputOrNull = (inputOrNull, text) => {
  if (inputOrNull) {
    const input = inputOrNull;
    input.setValue = value => {
      input.focus();
      const prototype = Object.getPrototypeOf(input);
      const setter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
      setter.call(input, value);
      /* Setting the value is not enough, the event must be triggered after */
      const inputEvt = new Event('input', { bubbles: true });
      input.dispatchEvent(inputEvt);

      const changeEvt = new Event('change', { bubbles: true });
      input.dispatchEvent(changeEvt);
    };

    return input;
  } else {
    return {
      click: () => console.log('click called on input not found. Query text:', text),
      setValue: () => console.log('setValue called on input not found. Query text:', text),
    };
  }
};

const matchedText = (elt, text) => {
  switch (elt.tagName) {
    case 'LABEL':
    case 'BUTTON':
    case 'A':
      return elt.innerText;
    default:
      return text;
  }
};

const findInputByText = text => {
  /* In order of preference */
  const candidatesAndMatchedText = [
    findElementByText(text, 'label'),

    findElementByText(text, 'button'),
    document.querySelector(`input[type="submit"][value="${CSS.escape(text)}"]`),
    document.querySelector(`input[type="button"][value="${CSS.escape(text)}"]`),

    findElementByText(text, 'a'),

    document.querySelector(`input[placeholder="${CSS.escape(text)}"]`),
    document.querySelector(`input[name=${CSS.escape(text)}]`),
    document.querySelector(`#${CSS.escape(text)}`),
  ]
    .filter(c => c)
    .map(element => ({ element, matchedText: matchedText(element, text) }));

  const { element } = candidatesAndMatchedText.reduce(
    (memo, value) =>
      Math.abs(memo.matchedText.length - text.length) <=
      Math.abs(value.matchedText.length - text.length)
        ? memo
        : value,
    candidatesAndMatchedText[0],
  );

  const input = element.tagName === 'LABEL' ? findInputForLabel(element) : element;

  return wrapInputOrNull(input);
};

const firstValidOption = selectElt => {
  const options = Array.from(selectElt.options);
  return options.find(opt => opt.value && !/select/i.exec(opt.value));
};

const doOnPage = (urlFragment, action) => {
  if (window.location.href.match(urlFragment)) {
    action();
  }
};
