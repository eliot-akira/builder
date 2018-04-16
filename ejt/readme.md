## EJT

This is a server-side compiler for simple JavaScript-based HTML templating.

## Commands

All commands are placed between opening `<%` and closing `%>` tags.

#### Include

When the first word after the opening tag is *include*, the specified file is included into the compiled output. The path is relative to the template's current folder. The default file extension is `html` and can be omitted.

Include *partial.html* inside another HTML file

```html
<% include partial %>
```

Markdown files are rendered and included.

```html
<% include welcome.md %>
```

JSON files are parsed as an object.

```js
<% const pages = include('site.json') %>
```

Here's a twist. If the first word is not one of the reserved commands, everything between the tags is evaluated as JavaScript. In that case, `include` is a function that returns the file content.

#### Extend

*index.html*

```html
<% extend layout %>

<% block header %>
  ..Header content..
<% end %>

..Main content..
```

*layout.html*

```html
<header>
  <% content header %>
</header>
<main>
  <% content %>
</main>
```

Compiled result

```html
<header>
  ..Header content..
</header>
<main>
  ..Main content..
</main>
```

#### Variables

Escaped: `<%= foo %>`

Unescaped: `<%- bar %>`

#### Code

Escape code block and wrap in `<pre><code>`

```html
<% code %>
<h1>Code example</h1>
<% end %>
```

Optionally add attributes: `<% code class="language-markup" %>`

## Inline JS

The compiler runs on Node.js, so there are [some ES6 features](https://nodejs.org/en/docs/es6/) supported.

```js
<% const pages = include('site.json') %>

<ul>
  <% for (let path in pages) { %>
    <li>
      <a href="/<%- path %>"><%- pages[path] %></a>
    </li>
  <% } %>
</ul>
```

#### Output

The variable `Output` is a buffer holding the compiled HTML up to that point. It can be used to add content.

```js
['item1', 'item2'].forEach((product) => {
  Output += include(`products/${product}`)
})
```

#### Local

The variable `Local` is passed to every template. It has one default property `Local.file`, which is the current template path. `Local` can be used to pass data and functions you want available in other templates.


## Use


Command line

```bash
$ ejt source [destination]
```

Compiler (server-side only)

```js
var EJT = require('ejt')
var renderer = new EJT( options )

var result = renderer.compile( src )
```

Gulp

```js
var ejt = require('ejt/gulp')

gulp.task('html', function() {
  return gulp.src( srcPath )
    .pipe( ejt() )
    .pipe(gulp.dest( destPath ))
})
```

TODO: Express

```js
var ejt = require('ejt/express');

app.use( ejt );
```

## Credit

This is based on a fork of [ECT](https://github.com/baryshev/ect), with on-going refactoring and changes:

- Plain JavaScript
- Default file extension; relative path; filename without quotes
- Include markdown, etc. via extensions
- New command: code

I believe the original concept came from [John Resig's micro-templating](http://ejohn.org/blog/javascript-micro-templating/).
