/*
These tests are a bit silly, they don't read well. jsdom does not support `innerText`, so instead we use Puppeteer.

We try to retrieve each inputs and do a click on them, and change their value (if applicable).
The HTML page has some callbacks that will set the innerText of a div with the id "results".
After each click / value change, we get the results and check that they were affected by the proper input.

The function passed to page.evaluate is executed in the context of the browser: no "expect" is defined there,
this is why we return an array of strings to assert on.

There is probably a better way to test these, that is good enough for a tired Sunday with allergies...
*/

beforeAll(async () => {
  await page.goto(`file://${__dirname}/test_page.html`);
});

beforeEach(() => {

});

describe('findInputByText', () => {
  it('returns an object implementing click and setValue when nothing is found', async () => {
    const res = await page.evaluate(() => {
      setupPage(`
        <label for="inputId">text</label>
        <span>
          <input id="inputId"/>
        </span>
      `);
      const input = findInputByText('something impossible to find');
      input.click();
      const res = [document.querySelector('#results').innerText];
      input.setValue('something');
      res.push(document.querySelector('#results').innerText);
      return res;
    });
  });

  it('retrieves an id linked input by label text', async () => {
    const res = await page.evaluate(() => {
      setupPage(`
        <label for="text1Input">text1</label>
        <span>
          <input id="text1Input"/>
        </span>
      `);
      const input = findInputByText('text1');
      input.click();
      const res = [document.querySelector('#results').innerText];
      input.setValue('changed to text1');
      res.push(document.querySelector('#results').innerText);
      return res;
    });
    expect(res).toEqual(['text1Input clicked', 'text1Input: changed to text1']);
  });

  it('retrieves a nested linked input by label text', async () => {
    const res = await page.evaluate(() => {
      setupPage(`
        <label>
          noise text2 noise
          <span>
            <input id="text2Input" />
          </span>
        </label>
      `);
      const input = findInputByText('text2');
      input.click();
      const res = [document.querySelector('#results').innerText];
      input.setValue('changed to text2');
      res.push(document.querySelector('#results').innerText);
      return res;
    });
    expect(res).toEqual(['text2Input clicked', 'text2Input: changed to text2']);
  });

  it('retrieves the closest input by label text', async () => {
    const res = await page.evaluate(() => {
      setupPage(`
        <div>
          <label>noise text3 noise</label>
          <span>
            <input id="text3Input" />
          </span>
        </div>
      `);
      const input = findInputByText('text3');
      input.click();
      const res = [document.querySelector('#results').innerText];
      input.setValue('changed to text3');
      res.push(document.querySelector('#results').innerText);
      return res;
    });
    expect(res).toEqual(['text3Input clicked', 'text3Input: changed to text3']);
  });

  it('retrieves a button by text', async () => {
    const res = await page.evaluate(() => {
      setupPage(`
        <button id="text4Button">
          Let us nest the text
          <span>
            deep
            <div>
              noise text4 noise
            </div>
          </span>
        </button>
      `);
      const input = findInputByText('text4');
      input.click();
      const res = [document.querySelector('#results').innerText];
      return res;
    });
    expect(res).toEqual(['text4Button clicked']);
  });

  it('retrieves a submit input by value', async () => {
    const res = await page.evaluate(() => {
      setupPage(`<input type="submit" value="text5" id="text5Button" />`);
      const input = findInputByText('text5');
      input.click();
      const res = [document.querySelector('#results').innerText];
      return res;
    });
    expect(res).toEqual(['text5Button clicked']);
  });

  it('retrieves a button input by value', async () => {
    const res = await page.evaluate(() => {
      setupPage(`<input type="button" value="text6" id="text6Button" />`);
      const input = findInputByText('text6');
      input.click();
      const res = [document.querySelector('#results').innerText];
      return res;
    });
    expect(res).toEqual(['text6Button clicked']);
  });

  it('retrieves a link by text', async () => {
    const res = await page.evaluate(() => {
      setupPage(`
        <div id="links">
          <a id="text7Link" href="#">
            Some noise
            <span>
              noise text7 noise
            </span>
          </a>
        </div>
      `);
      const input = findInputByText('text7');
      input.click();
      const res = [document.querySelector('#results').innerText];
      return res;
    });
    expect(res).toEqual(['text7Link clicked']);
  });

  it('retrieves an input by placeholder', async () => {
    const res = await page.evaluate(() => {
      setupPage(`<input id="text8Input" placeholder="text8" />`);
      const input = findInputByText('text8');
      input.click();
      const res = [document.querySelector('#results').innerText];
      input.setValue('changed to text8');
      res.push(document.querySelector('#results').innerText);
      return res;
    });
    expect(res).toEqual(['text8Input clicked', 'text8Input: changed to text8']);
  });

  it('retrieves an input by name', async () => {
    const res = await page.evaluate(() => {
      setupPage(`<input id="text9Input" name="text9" />`);
      const input = findInputByText('text9');
      input.click();
      const res = [document.querySelector('#results').innerText];
      input.setValue('changed to text9');
      res.push(document.querySelector('#results').innerText);
      return res;
    });
    expect(res).toEqual(['text9Input clicked', 'text9Input: changed to text9']);
  });

  it('retrieves an input by id', async () => {
    const res = await page.evaluate(() => {
      setupPage(`<input id="text10Input" />`);
      const input = findInputByText('text10Input');
      input.click();
      const res = [document.querySelector('#results').innerText];
      input.setValue('changed to text10');
      res.push(document.querySelector('#results').innerText);
      return res;
    });
    expect(res).toEqual(['text10Input clicked', 'text10Input: changed to text10']);
  });

  it('retrieves an input by the closest text', async () => {
    const res = await page.evaluate(() => {
      setupPage(`
        <label for="text11Input">Here it is: QueryText that matches but is longer</label>
        <input id="text11Input"/>

        <label for="text12Input">QueryText</label>
        <input id="text12Input"/>

        <a id="text13Link" href="#">long QueryText</a>
      `);
      const input = findInputByText('QueryText');
      input.click();
      const res = [document.querySelector('#results').innerText];
      return res;
    });
    expect(res).toEqual(['text12Input clicked']);
  });

  it('prefers labels to buttons', async () => {
    const res = await page.evaluate(() => {
      setupPage(`
        <label for="text14Input">text14</label>
        <input id="text14Input"/>

        <button id="text14Button">text14</button>
      `);
      const input = findInputByText('text14');
      input.click();
      const res = [document.querySelector('#results').innerText];
      return res;
    });
    expect(res).toEqual(['text14Input clicked']);
  });

  it('prefers buttons to submit inputs', async () => {
    const res = await page.evaluate(() => {
      setupPage(`
        <button id="text15Button">text15</button>

        <input type="submit" value="text15" id="text15Input" />
      `);
      const input = findInputByText('text15');
      input.click();
      const res = [document.querySelector('#results').innerText];
      return res;
    });
    expect(res).toEqual(['text15Button clicked']);
  });

  it('prefers submit inputs to links', async () => {
    const res = await page.evaluate(() => {
      setupPage(`
        <input type="submit" value="text16" id="text16Input" />
        <a id="text16Link" href="#">text16</a>
      `);
      const input = findInputByText('text16');
      input.click();
      const res = [document.querySelector('#results').innerText];
      return res;
    });
    expect(res).toEqual(['text16Input clicked']);
  });

  it('prefers links to placeholders', async () => {
    const res = await page.evaluate(() => {
      setupPage(`
        <a id="text17Link" href="#">text17</a>
        <input id="text17Input" placeholder="text17"/>
      `);
      const input = findInputByText('text17');
      input.click();
      const res = [document.querySelector('#results').innerText];
      return res;
    });
    expect(res).toEqual(['text17Link clicked']);
  });

  it('prefers placeholders to names', async () => {
    const res = await page.evaluate(() => {
      setupPage(`
        <input id="text18InputPlaceholder" placeholder="text18"/>
        <input id="text18InputName" name="text18"/>
      `);
      const input = findInputByText('text18');
      input.click();
      const res = [document.querySelector('#results').innerText];
      return res;
    });
    expect(res).toEqual(['text18InputPlaceholder clicked']);
  });

  it('prefers names to ids', async () => {
    const res = await page.evaluate(() => {
      setupPage(`
        <input id="text19InputName" name="text19"/>
        <input id="text19"/>
      `);
      const input = findInputByText('text19');
      input.click();
      const res = [document.querySelector('#results').innerText];
      return res;
    });
    expect(res).toEqual(['text19InputName clicked']);
  });
});

describe('doOnPage', () => {
  describe('on a page that matches the given fragment', () => {
    it('performs the given action', async () => {
      const res = await page.evaluate(() => {
        result = 'initial';
        doOnPage('test_page', () => {
          result = 'changed';
        });
        return result;
      });
      expect(res).toEqual('changed');
    });
  });

  describe('on a page that does not match the given fragment', () => {
    it('does not perform the given action', async () => {
      const res = await page.evaluate(() => {
        result = 'initial';
        doOnPage('random_page', () => {
          result = 'changed';
        });
        return result;
      });
      expect(res).toEqual('initial');
    });
  });
});
