import jsxt, { ElementGenerator, HtmlPage, If, Switch, Case, Default } from "..";

const IfApp: ElementGenerator = () => {
    return (
        <>
            <div id="header"></div>
            <div id="content">Chance is fifty/fifty here for example</div>
            <If cond={Math.random() > 0.5}>
                <div id="big">
                    <a href="https://www.youtube.com/watch?v=j8PxqgliIno">Watch this video</a>
                </div>
            </If>
        </>
    );
}
const SwitchApp: ElementGenerator = () => {
    return (
        <Switch expr={Math.round(Math.random() * 10)}>
            <Case c={1}>
                Case 1
            </Case>
            <Case c={2}>
                Case 2
            </Case>
            <Case c={3}>
                Case 3<br />
                Lorem ipsum dolor
            </Case>
            <Case c={4}>
                Case 4 (You can put different things than just "Case x" in here :-) )
            </Case>
            <Case c={5}>
                <a href="https://www.youtube.com/watch?v=j8PxqgliIno">Watch this video</a>
            </Case>
            <Default>
                No case was matched.
            </Default>
        </Switch>
    );
}



console.log("If:");
console.log(jsxt.render(<IfApp />, {
    indent: false
}));

console.log();
console.log("Switch:");
console.log(jsxt.render(<SwitchApp />, {
    indent: true
}));
