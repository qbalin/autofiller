# autofiller

Simple utility designed to easily create autofiller bookmarklets. 

## Use case and example

When going to read the newspaper online, I often find that the site disconnected me. I have to click on "Connection", wait for the popup to show up, fill my username and password, and then click "login". It's easy, but tedious and I'm lazy. 

Instead, I'd like to press a single bookmark button, on any site, and it will fulfill these tasks for me. The API should be as simple as:

```javascript
doOnPage('myFavortiteNewspaper.fr', async () => {
  findInputByText('Connection').click();
  wait(1000);
  findInputByText('username').setValue('my username');
  findInputByText('password').setValue('secret');
  findInputByText('login').click();
});
```

^ Let's call this the driver code. 

## How to use this?

1. Open a text file, type

```javascript
javascript:(() => {...})()
```

2. Replace the `...` by the content of `autofill.js` and your driver code. Copy all the text.

3. In you favorite browser, create a new bookmark. Instead of a URL, paste the text.

4. Go on the website you intend to drive, and click the bookmarklet.

## API details

Hopefully, `findInputByText` can find what you want. It will look for an input that have at least a part of the query text:
- by label text
- by innerText (buttons, links: the text can be nested)
- by placeholder (exact text, no partial match)
- by name (exact)
- by id (exact)

If you want more granularity, consider extending `findInputByText` to keep the API simple, or use the building blocks of `findInputByText` directly.

These are ordered by preference: hopefully we should not need to look at `name` and `id`, but the Web is hard, so these are useful escape hatches. Content in `iframe`s is currently not handled, and won't be found.

`doOnPage` accepts a regex: `window.location.href.match(urlFragment)`.

`wait` takes a wait time in ms.

If an input is not found, something that quacks like an input (responds to `setValue` and `click`) but does nothing will be returned. This is convenient when the url does not change, but the page content does (true single page app).
