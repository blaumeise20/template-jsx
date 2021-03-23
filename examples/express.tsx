import express = require("express");
import jsxt, { ElementGenerator, HtmlPage } from "..";

const app = express();
const render = jsxt.create({
    indent: true,
    useSelfCloseTags: false,
});


const Home: ElementGenerator = () => (
    <>
        <h1>Welcome to my page!</h1>
        <p>This is a demo page.</p>
        <a href="/somesite">Go to another page</a>
    </>
);
const SubPage: ElementGenerator = () => (
    <>
        This is another page.
    </>
)

const NotFound: ElementGenerator<{ req: express.Request }> = ({ req }) => (
    <HtmlPage status={404}>
        Error: The page <code>{req.url}</code> does not exist.
    </HtmlPage>
)

// example with render function
app.get("/", (req, res) => {
    res.status(200).send(render(<Home />));
});
app.get("/somesite", (req, res) => {
    res.status(200).send(render(<SubPage />));
});

// example with createHandler function
app.get("*", render.createHandler(NotFound));


app.listen(1234);
