import jsxt, { Head, HtmlPage } from "..";

console.log("Example with head tag:");
const element = <HtmlPage>
    <Head>
        <title>This is a test page</title>
    </Head>
    <div>
        Some content
    </div>
</HtmlPage>;
console.log(element);
console.log(jsxt.render(element, {
    indent: true
}));
