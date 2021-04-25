[![NPM Downloads](https://img.shields.io/npm/dw/template-jsx)](https://npm-stat.com/charts.html?package=template-jsx) [![NPM Link](https://img.shields.io/badge/NPM-Template--JSX-red)](https://www.npmjs.com/package/template-jsx)

# JSX Templates

> **An intuitive way of creating templates and rendering them using the JSX syntax**

With this tool you can easily create templates and render them to a string. It uses the JSX syntax from React to make templates. It is the perfect tool for backends that serve HTML content.

## Installation

This is an npm package you can install in your project like this:

```
npm install --save template-jsx
```

This package is made for transpilers. So make sure to use either Babel or TypeScript. To correctly use the JSX functions, make sure to import the package in every file, like React:

```ts
import * as jsxt from "template-jsx";
```

When you use TypeScript, you will have to set the `jsx` flag to `react` in your tsconfig.json file. You also have to specify the factory functions:

```json
"jsx": "react",
"jsxFactory": "jsxt.createElement",
"jsxFragmentFactory": "jsxt.Fragment",
```

When using Babel, you will need a JSX transform plugin and you have to specify the JSX factory.

## Usage

When you have installed and configured it you are ready to go. Create some elements using JSX. Even element generator functions and fragments are supported. But try it yourself. To get the final output, you have to use the `jsxt.render` function. It will take the root element and return a string representation of the JSX elements:

```tsx
const app = <div>Other elements...</div>;
const rendered = jsxt.render(app);
```

For generator functions there is a special type:

```tsx
const Greeting: ElementGenerator<{ name: string }> = (props) => (
    <>Hello {props.name}!</>
);
```

As you can see in this example, you can use so called "fragments" to simply return text or connect multiple elements without a parent.

There are several options you can specify. The most important one is the "indent" option. It lets you set if the resulting code should be indented. It is false by default. Take a look at this:

```tsx
const app = <div>sub elements</div>;
jsxt.render(app, { indent: false });
/*
<div>sub elements</div>
*/
jsxt.render(app, { indent: true });
/*
<div>
    sub elements
</div>
*/
```

If you don't want the indent to be set to 4 spaces, you can change the amount with the `indentSize` option. If you don't even want to use spaces, if you prefer tabs for example, you can use `indentString`. Note: `indentString` will be used before `indentSize`.

When rendering HTML pages, there is a very helpful predefined component called `HtmlPage`. All attributes specified will be applied to the `html` tag in the output. The output also includes a `DOCTYPE` element. All children will be put into the `body` element:

```tsx
const app = <div>sub elements</div>;
jsxt.render(app, { indent: false });
/*
<div>sub elements</div>
*/
jsxt.render(app, { indent: true });
/*
<div>
    sub elements
</div>
*/
```

### Using it with express

When this library is not made for frontend, what else would you need it for than webservers? This package has great support for express. There is an extra function called `create`, which takes the options and creates a renderer function. It has the `HtmlPage` component built-in, so if you don't pass one, it will automatically generate one. This is the basic usage:

```tsx
const render = jsxt.create({
    indent: true,
    indentSize: 2,
});
app.get("/", (req, res) => {
    res.send(render(<Home />));
});
```

If you don't need any other action in the request handler, you can just use the `createHandler` method from `jsxt.create`. The component will get the request and response object to do something with it:

```tsx
const { createHandler } = jsxt.create({
    indent: true,
    indentSize: 2,
});
app.get("/", createHandler(Home));
```

Optionally you can set a specific status code as a second parameter. It defaults to 200. When spreading the pages up to different files it might be helpful to specify a `status` attribute on an `HtmlPage`. Note: the `createHandler` parameter is preferred.

```tsx
app.get("*", createHandler(NotFound, 404));
```

In this case the `NotFound` component can access the request object to output the incorrect path.

If you look at `options.useSelfCloseTags`, the `jsxt.create` function has the HTML self-closing tags already preset. Of course you can override it.

### Special features

Bored of writing crazy expressions for conditional elements? Then you can use the builtin `If` Component. It takes an expression and if that expression is true it outputs the elements.

```tsx
const MyApp: ElementGenerator = () => {
    return (
        <>
            <div id="header"></div>
            <div id="content"></div>
            <If cond={Math.random() > 0.98}>
                <div id="big">
                    <a href="https://www.youtube.com/watch?v=j8PxqgliIno">
                        Watch this video
                    </a>
                </div>
            </If>
        </>
    );
};
```

There is another feature called `Switch` that (you guessed it!) switches over different cases. The usage is really simple:

```tsx
const MyApp: ElementGenerator = () => {
    return (
        <Switch expr={Math.round(Math.random() * 10)}>
            <Case c={1}>Case 1</Case>
            <Case c={2}>Case 2</Case>
            <Case c={3}>
                Case 3<br />
                Lorem ipsum dolor
            </Case>
            <Case c={4}>
                Case 4 (You can put different things than just "Case x" in here
                :-) )
            </Case>
            <Case c={5}>
                <a href="https://www.youtube.com/watch?v=j8PxqgliIno">
                    Watch this video
                </a>
            </Case>
            <Default>No case was matched.</Default>
        </Switch>
    );
};
```

As you can see, there are `Case` elements nested in it. (Including a default case with `Default`)

### Full list of options

-   `options.indent: boolean` - This option specifies if the resulting code should be formatted and indented. If it is set to `false`, the whole output will be in one line.
-   `options.indentSize: number` - Sets the amount of whitespaces used for indenting. Only used when `options.indent` is true.
-   `options.indentString: string` - If you don't want to use whitespaces, if you want to use tabs for example, you can set this to your indentation string. If both `options.indentString` and `options.indentSize` are set, this one (`options.indentString`) will be preferred.
-   `options.useSelfCloseTags: boolean | string[]` - When you don't have children in an element, it will be outputted like `<div />`. If this is set to false, it will normally output both tags. If you even specify a list of strings, the self-closing will only be rendered for tags in that list. This is very useful when rendering web pages with `img` or `input` elements inside.

## Licence

This project is licensed under the MIT license. Read it [here](LICENSE).
