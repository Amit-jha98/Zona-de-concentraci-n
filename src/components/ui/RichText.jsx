import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

export default function RichText({ children, className = "" }) {
  return <div className={`rich-text ${className}`}><Markdown
    remarkPlugins={[remarkGfm, remarkMath]}
    rehypePlugins={[[rehypeKatex, { strict: false, trust: false }]]}
    skipHtml
    disallowedElements={["img"]}
  >{String(children || "")}</Markdown></div>;
}
