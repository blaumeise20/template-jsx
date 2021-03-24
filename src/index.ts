/**
 * Creates a new JSX element with the specified properties and children. Supports everything in the JSX syntax.
 *
 * Note: `className` will transpile to HTML `class`
 * @example
 * const element1 = <a></a>;
 * const element2 = <div className="element wrapper"></div>;
 * @param name The name of the element. (Like `div`, `a`, etc.)
 * @param props The properties/attributes assigned to the element.
 * @param children Children of the element.
 * @returns The created element.
 */
export function createElement(name: string, props: Props, ...children: Node[]): Element;
/**
 * Creates a new JSX fragment.
 *
 * A fragment is just an element without a name, but when inserted somewhere in the element tree, it disappears.
 * @example
 * const fragment =
 *     <>
 *         <div>Element 1</div>
 *         <div>Element 2</div>
 *     </>
 * const app =
 *     <div>
 *         some text
 *         {fragment}
 *         some more text
 *     </div>
 * // equivalent to
 * const app =
 *     <div>
 *         some text
 *         <div>Element 1</div>
 *         <div>Element 2</div>
 *         some more text
 *     </div>
 * @param children The elements in the fragment.
 * @returns The newly created fragment.
 */
export function createElement(name: Fragment, props: Props, ...children: Node[]): Element;
/**
 * Calls the generator function with the corresponding data and returns the generated element.
 * @example
 * const Block = ({ props, children }) => (
 *     <div class="block" {...props}>
 *         <div class="blockHeader">{props.title}</div>
 *         <div>{children}</div>
 *     </div> // or className
 * );
 * const myBlock = <Block title="A block">
 *     <a href="">Link</a>
 * </Block>;
 * @param generator Element generator function.
 * @param props The properties/attributes assigned to the element.
 * @param children Children passed to the element generator.
 * @returns The created element.
 */
export function createElement<T extends Props>(generator: ElementGenerator<T>, props: T, ...children: Node[]): Element;
/**
 * Implementation.
 */
export function createElement(nameOrGenerator: any, props: any, ...children: Node[]): any {
    if (typeof nameOrGenerator == "function") {
        return nameOrGenerator(props ?? {}, children);
    }
    else if (nameOrGenerator == Fragment) {
        return new Element(Fragment, {}, children);
    }
    else {
        return new Element(nameOrGenerator, props ?? {}, children);
    }
}

/**
 * Readonly data container for JSX elements.
 */
export class Element {
    public children: Node[];
    /**
     * Creates a new element data container.
     * @param name The name of the element. (Like `div`, `a`, etc.)
     * @param props The properties/attributes assigned to the element.
     * @param children Children of the element.
     */
    constructor(public name: string | Fragment | typeof HTML | typeof CASE | typeof DEFAULT | typeof HEAD, public props: Props, children: Node[]) {
        this.children = flatten(children);
    }
}

function flatten(children: Node[]) {
    const result: Node[] = [];
    children.forEach(c => {
        if (c instanceof Array) result.push(...flatten(c));
        else if (c instanceof Element && c.name == Fragment) result.push(...flatten(c.children));
        else result.push(c);
    });
    return result;
}

/**
 * Renders the JSX elements to a string. This function provides the core functionallity.
 * @param top The first (top) element that should be rendered.
 * @param options Options to use for rendering.
 * @param indentation The starting indentation level. Only used when options.indent is set to `true`.
 */
export function render(top: Element, options: RenderOptions = {}, indentation: number = 0) {
    options = {
        indent: false,
        indentString: "",
        indentSize: 4,
        useSelfCloseTags: true,
        ...options
    };
    return renderInternal(top, options, indentation);
}

/**
 * Options for the rendering.
 */
export interface RenderOptions {
    /**
     * This option specifies if the resulting code should be formated and indented. If it is set to `false`, the whole output will be in one line.
     */
    indent?: boolean;
    /**
     * Sets the amount of whitespaces used for indenting. Only used when `options.indent` is true.
     */
    indentString?: string;
    /**
     * If you don't want to use whitespaces, if you want to use tabs for example, you can set this to your indentation string. If both `options.indentString` and `options.indentSize` are set, this one (`options.indentString`) will be prefered.
     */
    indentSize?: number;
    /**
     * When you don't have children in an element, it will be outputed like `<div />`. If this is set to false, it will normally output both tags. If you even specify a list of strings, the self-closing will only be rendered for tags in that list. This is very useful when rendering web pages with `img` or `input` elements inside.
     */
    useSelfCloseTags?: boolean | string[];
}


function renderInternal(node: Node, options: RenderOptions, indentation: number): string {
    if (typeof node == "string") {
        return createIndent(options, indentation) + node;
    }
    else if (node instanceof Array) {
        return node.map(n => renderInternal(n, options, indentation)).join(options.indent ? "\n" : "");
    }
    else if (node.name == Fragment) {
        return node.children.map(n => renderInternal(n, options, indentation)).join(options.indent ? "\n" : "");
    }
    else if (node.name == HTML) {
        const indentString = createIndent(options, indentation);
        const children = [...node.children];

        let index = children.findIndex(n => n instanceof Element && n.name == HEAD);
        let head: Node[];
        if (index == -1) head = [];
        else {
            head = (children[index] as Element).children;
            children.splice(index, 1);
        }

        let result = `${indentString}<!DOCTYPE html>${options.indent ? "\n" : ""}`;

        result += `${indentString}<html>${options.indent ? "\n" : ""}`;

        result += `${indentString}<head>${options.indent ? "\n" : ""}`;
        result += renderInternal(head, options, indentation + 1) + (options.indent && head.length > 0 ? "\n" : "");
        result += `${indentString}</head>${options.indent ? "\n" : ""}`;

        result += `${indentString}<body>${options.indent ? "\n" : ""}`;
        result += children.map(n => renderInternal(n, options, indentation + 1)).join(options.indent ? "\n" : "");
        if (children.length > 0 && options.indent) result += "\n";
        result += `${indentString}</body>${options.indent ? "\n" : ""}`;

        result += `${indentString}</html>`;
        return result;
    }
    else {
        const selfClose = node.children.length == 0 && (options.useSelfCloseTags == true || (options.useSelfCloseTags instanceof Array && options.useSelfCloseTags.includes(node.name as string)));

        if (node.props.className && !node.props.class) node.props.class = node.props.className;
        const attrs = createAttrs(node.props);

        const indentString = createIndent(options, indentation);
        let result = `${indentString}<${node.name as string}${attrs}${selfClose ? " /" : ""}>`;

        if (!selfClose) {
            if (node.children.length > 0 && options.indent) result += "\n";
            result += node.children.map(n => renderInternal(n, options, indentation + 1)).join(options.indent ? "\n" : "");
            if (node.children.length > 0 && options.indent) result += `\n${indentString}`;
            result += `</${node.name as string}>`;
        }

        return result;
    }
}

function createIndent(options: RenderOptions, indentation: number): string {
    if (!options.indent) return "";
    if (options.indentString != "") return options.indentString.repeat(indentation);
    if (options.indentSize != 0) return " ".repeat(indentation * options.indentSize);
    return "";
}

function createAttrs(props: Props) {
    const attrKeys = Object.keys(props);
    const attrs = [];
    attrKeys.forEach(k => {
        attrs.push(` ${k}="${props[k]}"`);
    });
    return attrs.join("");
}


export function create(options: RenderOptions = {}): ExpressRenderer {
    if (options.useSelfCloseTags == null) options.useSelfCloseTags = [
        "area",
        "base",
        "br",
        "col",
        "embed",
        "hr",
        "img",
        "input",
        "link",
        "input",
        "link",
        "meta",
        "param",
        "source",
        "track",
        "wbr"
    ];
    let renderer: ExpressRenderer = Object.assign(
        function (top: Element) {
            if (top.name != HTML) top = new Element(HTML, {}, [top]);
            return render(top, options);
        },
        {
            createHandler(component: ElementGenerator<{ req, res }>, status?: number) {
                return (req, res) => {
                    let element = createElement(component, { req, res });
                    if (element.name != HTML) element = new Element(HTML, {}, [element]);

                    let actualStatus;
                    if (status != null) {
                        actualStatus = status;
                    }
                    else if (typeof element.props.status == "number") {
                        actualStatus = element.props.status;
                    }
                    else {
                        actualStatus = 200;
                    }
                    res.status(actualStatus).send(renderer(element));
                };
            }
        }
    );
    return renderer;
}


/**
 * Symbol indicating that the element is a fragment.
 */
export const Fragment = Symbol("Fragment");

/**
 * Element for an HTML page (including DOCTYPE, head and body).
 */
export const HtmlPage: ElementGenerator<{ [key: string]: any, status?: number }> = (props, children) => {
    return new Element(HTML, props, children);
}
const HTML = Symbol("HTML");

/**
 * Helper component for conditional elements.
 */
export const If: ElementGenerator<{ cond: boolean }> = ({ cond }, children) => {
    if (cond) return new Element(Fragment, {}, children);
    else return new Element(Fragment, {}, []);
}
/**
 * Helper component for multiple case szenarios.
 */
export const Switch: ElementGenerator<{ expr: any }> = ({ expr }, children) => {
    const found = children.find(c => c instanceof Element && c.name == CASE && c.props.c == expr) as Element;
    if (found) return new Element(Fragment, {}, found.children);

    const def = children.find(c => c instanceof Element && c.name == DEFAULT) as Element;
    if (def) return new Element(Fragment, {}, def.children);

    return new Element(Fragment, {}, []);
};
export const Case: ElementGenerator<{ c: any }> = ({ c }, children) => {
    return new Element(CASE, { c }, children);
}
export const Default: ElementGenerator<{}> = (_, children) => {
    return new Element(DEFAULT, {}, children);
}
const CASE = Symbol("Case");
const DEFAULT = Symbol("Default");

export const Head: ElementGenerator = (props, children) => {
    return new Element(HEAD, props, children);
}
const HEAD = Symbol("Head");

/**
 * Element attributes/properties type.
 */
export type Props = { [key: string]: any };
 /**
  * Type for an element fragment.
  */
export type Fragment = typeof Fragment;
 /**
  * Node (JSX element like text, elements, and arrays) type.
  */
export type Node = Element | string | Node[];
 /**
  * Function for generating elements.
  */
export type ElementGenerator<T extends Props = {}> = (props: T, children: Node[]) => Element;
/**
 * Return type for the `jsxt.create` function.
 */
export interface ExpressRenderer {
    (top: Element): string;
    createHandler(component: ElementGenerator<{ req, res }>, status?: number): (req, res) => void;
}

export default {
    createElement,
    Element,
    render,
    Fragment,
    HtmlPage,
    create,
}
