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

describe('findInputByText', () => {
  it('retrieves an id linked input by label text', async () => {
    const res = await page.evaluate(() => {
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
      const input = findInputByText('text4');
      input.click();
      const res = [document.querySelector('#results').innerText];
      return res;
    });
    expect(res).toEqual(['text4Button clicked']);
  });

  it('retrieves a submit input by value', async () => {
    const res = await page.evaluate(() => {
      const input = findInputByText('text5');
      input.click();
      const res = [document.querySelector('#results').innerText];
      return res;
    });
    expect(res).toEqual(['text5Button clicked']);
  });

  it('retrieves a button input by value', async () => {
    const res = await page.evaluate(() => {
      const input = findInputByText('text6');
      input.click();
      const res = [document.querySelector('#results').innerText];
      return res;
    });
    expect(res).toEqual(['text6Button clicked']);
  });

  it('retrieves a link by text', async () => {
    const res = await page.evaluate(() => {
      const input = findInputByText('text7');
      input.click();
      const res = [document.querySelector('#results').innerText];
      return res;
    });
    expect(res).toEqual(['text7Link clicked']);
  });

  it('retrieves an input by placeholder', async () => {
    const res = await page.evaluate(() => {
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
      const input = findInputByText('QueryText');
      input.click();
      const res = [document.querySelector('#results').innerText];
      input.setValue('changed to text12');
      res.push(document.querySelector('#results').innerText);
      return res;
    });
    expect(res).toEqual(['text12Input clicked', 'text12Input: changed to text12']);
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
