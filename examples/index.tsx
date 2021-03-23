import jsxt, { ElementGenerator, HtmlPage } from "..";

const Greeting: ElementGenerator<{ name: string }> = props => <>
    Hello {props.name}!
</>;


console.log("Standart elements:");
const element = <div class="app">
    <Greeting name="John Doe" />
</div>;
console.log(jsxt.render(element, {
    indent: false
}));

console.log();
console.log("HTML page:");
const page = <HtmlPage lang="en">
    Welcome to my website!
    <Greeting name="foo" />
</HtmlPage>;
console.log(jsxt.render(page, {
    indent: true
}));
