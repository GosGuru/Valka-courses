var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// plugins/visual-editor/vite-plugin-react-inline-editor.js
var vite_plugin_react_inline_editor_exports = {};
__export(vite_plugin_react_inline_editor_exports, {
  default: () => inlineEditPlugin
});
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "file:///C:/Users/Maxim/OneDrive/Documentos/Valka-course/Valka-courses/Valka-courses/node_modules/.pnpm/@babel+parser@7.28.3/node_modules/@babel/parser/lib/index.js";
import traverseBabel from "file:///C:/Users/Maxim/OneDrive/Documentos/Valka-course/Valka-courses/Valka-courses/node_modules/.pnpm/@babel+traverse@7.28.3/node_modules/@babel/traverse/lib/index.js";
import generate from "file:///C:/Users/Maxim/OneDrive/Documentos/Valka-course/Valka-courses/Valka-courses/node_modules/.pnpm/@babel+generator@7.28.3/node_modules/@babel/generator/lib/index.js";
import * as t from "file:///C:/Users/Maxim/OneDrive/Documentos/Valka-course/Valka-courses/Valka-courses/node_modules/.pnpm/@babel+types@7.28.2/node_modules/@babel/types/lib/index.js";
import fs from "fs";
function parseEditId(editId) {
  const parts = editId.split(":");
  if (parts.length < 3) {
    return null;
  }
  const column = parseInt(parts.at(-1), 10);
  const line = parseInt(parts.at(-2), 10);
  const filePath = parts.slice(0, -2).join(":");
  if (!filePath || isNaN(line) || isNaN(column)) {
    return null;
  }
  return { filePath, line, column };
}
function checkTagNameEditable(openingElementNode, editableTagsList) {
  if (!openingElementNode || !openingElementNode.name)
    return false;
  const nameNode = openingElementNode.name;
  if (nameNode.type === "JSXIdentifier" && editableTagsList.includes(nameNode.name)) {
    return true;
  }
  if (nameNode.type === "JSXMemberExpression" && nameNode.property && nameNode.property.type === "JSXIdentifier" && editableTagsList.includes(nameNode.property.name)) {
    return true;
  }
  return false;
}
function validateImageSrc(openingNode) {
  if (!openingNode || !openingNode.name || openingNode.name.name !== "img") {
    return { isValid: true, reason: null };
  }
  const hasPropsSpread = openingNode.attributes.some(
    (attr) => t.isJSXSpreadAttribute(attr) && attr.argument && t.isIdentifier(attr.argument) && attr.argument.name === "props"
  );
  if (hasPropsSpread) {
    return { isValid: false, reason: "props-spread" };
  }
  const srcAttr = openingNode.attributes.find(
    (attr) => t.isJSXAttribute(attr) && attr.name && attr.name.name === "src"
  );
  if (!srcAttr) {
    return { isValid: false, reason: "missing-src" };
  }
  if (!t.isStringLiteral(srcAttr.value)) {
    return { isValid: false, reason: "dynamic-src" };
  }
  if (!srcAttr.value.value || srcAttr.value.value.trim() === "") {
    return { isValid: false, reason: "empty-src" };
  }
  return { isValid: true, reason: null };
}
function inlineEditPlugin() {
  return {
    name: "vite-inline-edit-plugin",
    enforce: "pre",
    transform(code, id) {
      if (!/\.(jsx|tsx)$/.test(id) || !id.startsWith(VITE_PROJECT_ROOT) || id.includes("node_modules")) {
        return null;
      }
      const relativeFilePath = path.relative(VITE_PROJECT_ROOT, id);
      const webRelativeFilePath = relativeFilePath.split(path.sep).join("/");
      try {
        const babelAst = parse(code, {
          sourceType: "module",
          plugins: ["jsx", "typescript"],
          errorRecovery: true
        });
        let attributesAdded = 0;
        traverseBabel.default(babelAst, {
          enter(path3) {
            if (path3.isJSXOpeningElement()) {
              const openingNode = path3.node;
              const elementNode = path3.parentPath.node;
              if (!openingNode.loc) {
                return;
              }
              const alreadyHasId = openingNode.attributes.some(
                (attr) => t.isJSXAttribute(attr) && attr.name.name === "data-edit-id"
              );
              if (alreadyHasId) {
                return;
              }
              const isCurrentElementEditable = checkTagNameEditable(openingNode, EDITABLE_HTML_TAGS);
              if (!isCurrentElementEditable) {
                return;
              }
              const imageValidation = validateImageSrc(openingNode);
              if (!imageValidation.isValid) {
                const disabledAttribute = t.jsxAttribute(
                  t.jsxIdentifier("data-edit-disabled"),
                  t.stringLiteral("true")
                );
                openingNode.attributes.push(disabledAttribute);
                attributesAdded++;
                return;
              }
              let shouldBeDisabledDueToChildren = false;
              if (t.isJSXElement(elementNode) && elementNode.children) {
                const hasPropsSpread = openingNode.attributes.some(
                  (attr) => t.isJSXSpreadAttribute(attr) && attr.argument && t.isIdentifier(attr.argument) && attr.argument.name === "props"
                );
                const hasDynamicChild = elementNode.children.some(
                  (child) => t.isJSXExpressionContainer(child)
                );
                if (hasDynamicChild || hasPropsSpread) {
                  shouldBeDisabledDueToChildren = true;
                }
              }
              if (!shouldBeDisabledDueToChildren && t.isJSXElement(elementNode) && elementNode.children) {
                const hasEditableJsxChild = elementNode.children.some((child) => {
                  if (t.isJSXElement(child)) {
                    return checkTagNameEditable(child.openingElement, EDITABLE_HTML_TAGS);
                  }
                  return false;
                });
                if (hasEditableJsxChild) {
                  shouldBeDisabledDueToChildren = true;
                }
              }
              if (shouldBeDisabledDueToChildren) {
                const disabledAttribute = t.jsxAttribute(
                  t.jsxIdentifier("data-edit-disabled"),
                  t.stringLiteral("true")
                );
                openingNode.attributes.push(disabledAttribute);
                attributesAdded++;
                return;
              }
              if (t.isJSXElement(elementNode) && elementNode.children && elementNode.children.length > 0) {
                let hasNonEditableJsxChild = false;
                for (const child of elementNode.children) {
                  if (t.isJSXElement(child)) {
                    if (!checkTagNameEditable(child.openingElement, EDITABLE_HTML_TAGS)) {
                      hasNonEditableJsxChild = true;
                      break;
                    }
                  }
                }
                if (hasNonEditableJsxChild) {
                  const disabledAttribute = t.jsxAttribute(
                    t.jsxIdentifier("data-edit-disabled"),
                    t.stringLiteral("true")
                  );
                  openingNode.attributes.push(disabledAttribute);
                  attributesAdded++;
                  return;
                }
              }
              let currentAncestorCandidatePath = path3.parentPath.parentPath;
              while (currentAncestorCandidatePath) {
                const ancestorJsxElementPath = currentAncestorCandidatePath.isJSXElement() ? currentAncestorCandidatePath : currentAncestorCandidatePath.findParent((p) => p.isJSXElement());
                if (!ancestorJsxElementPath) {
                  break;
                }
                if (checkTagNameEditable(ancestorJsxElementPath.node.openingElement, EDITABLE_HTML_TAGS)) {
                  return;
                }
                currentAncestorCandidatePath = ancestorJsxElementPath.parentPath;
              }
              const line = openingNode.loc.start.line;
              const column = openingNode.loc.start.column + 1;
              const editId = `${webRelativeFilePath}:${line}:${column}`;
              const idAttribute = t.jsxAttribute(
                t.jsxIdentifier("data-edit-id"),
                t.stringLiteral(editId)
              );
              openingNode.attributes.push(idAttribute);
              attributesAdded++;
            }
          }
        });
        if (attributesAdded > 0) {
          const generateFunction = generate.default || generate;
          const output = generateFunction(babelAst, {
            sourceMaps: true,
            sourceFileName: webRelativeFilePath
          }, code);
          return { code: output.code, map: output.map };
        }
        return null;
      } catch (error) {
        console.error(`[vite][visual-editor] Error transforming ${id}:`, error);
        return null;
      }
    },
    // Updates source code based on the changes received from the client
    configureServer(server) {
      server.middlewares.use("/api/apply-edit", async (req, res, next) => {
        if (req.method !== "POST")
          return next();
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", async () => {
          var _a;
          let absoluteFilePath = "";
          try {
            const { editId, newFullText } = JSON.parse(body);
            if (!editId || typeof newFullText === "undefined") {
              res.writeHead(400, { "Content-Type": "application/json" });
              return res.end(JSON.stringify({ error: "Missing editId or newFullText" }));
            }
            const parsedId = parseEditId(editId);
            if (!parsedId) {
              res.writeHead(400, { "Content-Type": "application/json" });
              return res.end(JSON.stringify({ error: "Invalid editId format (filePath:line:column)" }));
            }
            const { filePath, line, column } = parsedId;
            absoluteFilePath = path.resolve(VITE_PROJECT_ROOT, filePath);
            if (filePath.includes("..") || !absoluteFilePath.startsWith(VITE_PROJECT_ROOT) || absoluteFilePath.includes("node_modules")) {
              res.writeHead(400, { "Content-Type": "application/json" });
              return res.end(JSON.stringify({ error: "Invalid path" }));
            }
            const originalContent = fs.readFileSync(absoluteFilePath, "utf-8");
            const babelAst = parse(originalContent, {
              sourceType: "module",
              plugins: ["jsx", "typescript"],
              errorRecovery: true
            });
            let targetNodePath = null;
            const visitor = {
              JSXOpeningElement(path3) {
                const node = path3.node;
                if (node.loc && node.loc.start.line === line && node.loc.start.column + 1 === column) {
                  targetNodePath = path3;
                  path3.stop();
                }
              }
            };
            traverseBabel.default(babelAst, visitor);
            if (!targetNodePath) {
              res.writeHead(404, { "Content-Type": "application/json" });
              return res.end(JSON.stringify({ error: "Target node not found by line/column", editId }));
            }
            const generateFunction = generate.default || generate;
            const targetOpeningElement = targetNodePath.node;
            const parentElementNode = (_a = targetNodePath.parentPath) == null ? void 0 : _a.node;
            const isImageElement = targetOpeningElement.name && targetOpeningElement.name.name === "img";
            let beforeCode = "";
            let afterCode = "";
            let modified = false;
            if (isImageElement) {
              const beforeOutput = generateFunction(targetOpeningElement, {});
              beforeCode = beforeOutput.code;
              const srcAttr = targetOpeningElement.attributes.find(
                (attr) => t.isJSXAttribute(attr) && attr.name && attr.name.name === "src"
              );
              if (srcAttr && t.isStringLiteral(srcAttr.value)) {
                srcAttr.value = t.stringLiteral(newFullText);
                modified = true;
                const afterOutput = generateFunction(targetOpeningElement, {});
                afterCode = afterOutput.code;
              }
            } else {
              if (parentElementNode && t.isJSXElement(parentElementNode)) {
                const beforeOutput = generateFunction(parentElementNode, {});
                beforeCode = beforeOutput.code;
                parentElementNode.children = [];
                if (newFullText && newFullText.trim() !== "") {
                  const newTextNode = t.jsxText(newFullText);
                  parentElementNode.children.push(newTextNode);
                }
                modified = true;
                const afterOutput = generateFunction(parentElementNode, {});
                afterCode = afterOutput.code;
              }
            }
            if (!modified) {
              res.writeHead(409, { "Content-Type": "application/json" });
              return res.end(JSON.stringify({ error: "Could not apply changes to AST." }));
            }
            const output = generateFunction(babelAst, {});
            const newContent = output.code;
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({
              success: true,
              newFileContent: newContent,
              beforeCode,
              afterCode
            }));
          } catch (error) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Internal server error during edit application." }));
          }
        });
      });
    }
  };
}
var __vite_injected_original_import_meta_url, __filename, __dirname2, VITE_PROJECT_ROOT, EDITABLE_HTML_TAGS;
var init_vite_plugin_react_inline_editor = __esm({
  "plugins/visual-editor/vite-plugin-react-inline-editor.js"() {
    __vite_injected_original_import_meta_url = "file:///C:/Users/Maxim/OneDrive/Documentos/Valka-course/Valka-courses/Valka-courses/plugins/visual-editor/vite-plugin-react-inline-editor.js";
    __filename = fileURLToPath(__vite_injected_original_import_meta_url);
    __dirname2 = path.dirname(__filename);
    VITE_PROJECT_ROOT = path.resolve(__dirname2, "../..");
    EDITABLE_HTML_TAGS = ["a", "Button", "button", "p", "span", "h1", "h2", "h3", "h4", "h5", "h6", "label", "Label", "img"];
  }
});

// plugins/visual-editor/visual-editor-config.js
var EDIT_MODE_STYLES;
var init_visual_editor_config = __esm({
  "plugins/visual-editor/visual-editor-config.js"() {
    EDIT_MODE_STYLES = `
  #root[data-edit-mode-enabled="true"] [data-edit-id] {
    cursor: pointer; 
    outline: 1px dashed #357DF9; 
    outline-offset: 2px;
    min-height: 1em;
  }
  #root[data-edit-mode-enabled="true"] {
    cursor: pointer;
  }
  #root[data-edit-mode-enabled="true"] [data-edit-id]:hover {
    background-color: #357DF933;
    outline-color: #357DF9; 
  }

  @keyframes fadeInTooltip {
    from {
      opacity: 0;
      transform: translateY(5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  #inline-editor-disabled-tooltip {
    display: none; 
    opacity: 0; 
    position: absolute;
    background-color: #1D1E20;
    color: white;
    padding: 4px 8px;
    border-radius: 8px;
    z-index: 10001;
    font-size: 14px;
    border: 1px solid #3B3D4A;
    max-width: 184px;
    text-align: center;
  }

  #inline-editor-disabled-tooltip.tooltip-active {
    display: block;
    animation: fadeInTooltip 0.2s ease-out forwards;
  }
`;
  }
});

// plugins/visual-editor/vite-plugin-edit-mode.js
var vite_plugin_edit_mode_exports = {};
__export(vite_plugin_edit_mode_exports, {
  default: () => inlineEditDevPlugin
});
import { readFileSync } from "fs";
import { resolve } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
function inlineEditDevPlugin() {
  return {
    name: "vite:inline-edit-dev",
    apply: "serve",
    transformIndexHtml() {
      const scriptPath = resolve(__dirname3, "edit-mode-script.js");
      const scriptContent = readFileSync(scriptPath, "utf-8");
      return [
        {
          tag: "script",
          attrs: { type: "module" },
          children: scriptContent,
          injectTo: "body"
        },
        {
          tag: "style",
          children: EDIT_MODE_STYLES,
          injectTo: "head"
        }
      ];
    }
  };
}
var __vite_injected_original_import_meta_url2, __filename2, __dirname3;
var init_vite_plugin_edit_mode = __esm({
  "plugins/visual-editor/vite-plugin-edit-mode.js"() {
    init_visual_editor_config();
    __vite_injected_original_import_meta_url2 = "file:///C:/Users/Maxim/OneDrive/Documentos/Valka-course/Valka-courses/Valka-courses/plugins/visual-editor/vite-plugin-edit-mode.js";
    __filename2 = fileURLToPath2(__vite_injected_original_import_meta_url2);
    __dirname3 = resolve(__filename2, "..");
  }
});

// vite.config.js
import path2 from "node:path";
import react from "file:///C:/Users/Maxim/OneDrive/Documentos/Valka-course/Valka-courses/Valka-courses/node_modules/.pnpm/@vitejs+plugin-react@4.7.0__82c2f3d015faf2318d6faa67ce475999/node_modules/@vitejs/plugin-react/dist/index.js";
import { createLogger, defineConfig } from "file:///C:/Users/Maxim/OneDrive/Documentos/Valka-course/Valka-courses/Valka-courses/node_modules/.pnpm/vite@4.5.14_@types+node@20.19.11_terser@5.43.1/node_modules/vite/dist/node/index.js";
var __vite_injected_original_dirname = "C:\\Users\\Maxim\\OneDrive\\Documentos\\Valka-course\\Valka-courses\\Valka-courses";
var isDev = process.env.NODE_ENV !== "production";
var inlineEditPlugin2;
var editModeDevPlugin;
if (isDev) {
  inlineEditPlugin2 = (await Promise.resolve().then(() => (init_vite_plugin_react_inline_editor(), vite_plugin_react_inline_editor_exports))).default;
  editModeDevPlugin = (await Promise.resolve().then(() => (init_vite_plugin_edit_mode(), vite_plugin_edit_mode_exports))).default;
}
var configHorizonsViteErrorHandler = `
const observer = new MutationObserver((mutations) => {
	for (const mutation of mutations) {
		for (const addedNode of mutation.addedNodes) {
			if (
				addedNode.nodeType === Node.ELEMENT_NODE &&
				(
					addedNode.tagName?.toLowerCase() === 'vite-error-overlay' ||
					addedNode.classList?.contains('backdrop')
				)
			) {
				handleViteOverlay(addedNode);
			}
		}
	}
});

observer.observe(document.documentElement, {
	childList: true,
	subtree: true
});

function handleViteOverlay(node) {
	if (!node.shadowRoot) {
		return;
	}

	const backdrop = node.shadowRoot.querySelector('.backdrop');

	if (backdrop) {
		const overlayHtml = backdrop.outerHTML;
		const parser = new DOMParser();
		const doc = parser.parseFromString(overlayHtml, 'text/html');
		const messageBodyElement = doc.querySelector('.message-body');
		const fileElement = doc.querySelector('.file');
		const messageText = messageBodyElement ? messageBodyElement.textContent.trim() : '';
		const fileText = fileElement ? fileElement.textContent.trim() : '';
		const error = messageText + (fileText ? ' File:' + fileText : '');

		window.parent.postMessage({
			type: 'horizons-vite-error',
			error,
		}, '*');
	}
}
`;
var configHorizonsRuntimeErrorHandler = `
window.onerror = (message, source, lineno, colno, errorObj) => {
	const errorDetails = errorObj ? JSON.stringify({
		name: errorObj.name,
		message: errorObj.message,
		stack: errorObj.stack,
		source,
		lineno,
		colno,
	}) : null;

	window.parent.postMessage({
		type: 'horizons-runtime-error',
		message,
		error: errorDetails
	}, '*');
};
`;
var configHorizonsConsoleErrroHandler = `
const originalConsoleError = console.error;
console.error = function(...args) {
	originalConsoleError.apply(console, args);

	let errorString = '';

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg instanceof Error) {
			errorString = arg.stack || \`\${arg.name}: \${arg.message}\`;
			break;
		}
	}

	if (!errorString) {
		errorString = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
	}

	window.parent.postMessage({
		type: 'horizons-console-error',
		error: errorString
	}, '*');
};
`;
var configWindowFetchMonkeyPatch = `
const originalFetch = window.fetch;

window.fetch = function(...args) {
	const url = args[0] instanceof Request ? args[0].url : args[0];

	// Skip WebSocket URLs
	if (url.startsWith('ws:') || url.startsWith('wss:')) {
		return originalFetch.apply(this, args);
	}

	return originalFetch.apply(this, args)
		.then(async response => {
			const contentType = response.headers.get('Content-Type') || '';

			// Exclude HTML document responses
			const isDocumentResponse =
				contentType.includes('text/html') ||
				contentType.includes('application/xhtml+xml');

			if (!response.ok && !isDocumentResponse) {
					const responseClone = response.clone();
					const errorFromRes = await responseClone.text();
					const requestUrl = response.url;
					console.error(\`Fetch error from \${requestUrl}: \${errorFromRes}\`);
			}

			return response;
		})
		.catch(error => {
			if (!url.match(/.html?$/i)) {
				console.error(error);
			}

			throw error;
		});
};
`;
var addTransformIndexHtml = {
  name: "add-transform-index-html",
  transformIndexHtml(html) {
    return {
      html,
      tags: [
        {
          tag: "script",
          attrs: { type: "module" },
          children: configHorizonsRuntimeErrorHandler,
          injectTo: "head"
        },
        {
          tag: "script",
          attrs: { type: "module" },
          children: configHorizonsViteErrorHandler,
          injectTo: "head"
        },
        {
          tag: "script",
          attrs: { type: "module" },
          children: configHorizonsConsoleErrroHandler,
          injectTo: "head"
        },
        {
          tag: "script",
          attrs: { type: "module" },
          children: configWindowFetchMonkeyPatch,
          injectTo: "head"
        }
      ]
    };
  }
};
console.warn = () => {
};
var logger = createLogger();
var loggerError = logger.error;
logger.error = (msg, options) => {
  var _a;
  if ((_a = options == null ? void 0 : options.error) == null ? void 0 : _a.toString().includes("CssSyntaxError: [postcss]")) {
    return;
  }
  loggerError(msg, options);
};
var vite_config_default = defineConfig({
  customLogger: logger,
  plugins: [
    ...isDev ? [inlineEditPlugin2(), editModeDevPlugin()] : [],
    react(),
    addTransformIndexHtml
  ],
  server: {
    cors: true,
    // Removido COEP credentialless porque puede bloquear iframes (YouTube, Vimeo) en desarrollo.
    headers: {},
    allowedHosts: true
  },
  resolve: {
    extensions: [".jsx", ".js", ".tsx", ".ts", ".json"],
    alias: {
      "@": path2.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    rollupOptions: {
      external: [
        "@babel/parser",
        "@babel/traverse",
        "@babel/generator",
        "@babel/types"
      ]
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsicGx1Z2lucy92aXN1YWwtZWRpdG9yL3ZpdGUtcGx1Z2luLXJlYWN0LWlubGluZS1lZGl0b3IuanMiLCAicGx1Z2lucy92aXN1YWwtZWRpdG9yL3Zpc3VhbC1lZGl0b3ItY29uZmlnLmpzIiwgInBsdWdpbnMvdmlzdWFsLWVkaXRvci92aXRlLXBsdWdpbi1lZGl0LW1vZGUuanMiLCAidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxNYXhpbVxcXFxPbmVEcml2ZVxcXFxEb2N1bWVudG9zXFxcXFZhbGthLWNvdXJzZVxcXFxWYWxrYS1jb3Vyc2VzXFxcXFZhbGthLWNvdXJzZXNcXFxccGx1Z2luc1xcXFx2aXN1YWwtZWRpdG9yXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxNYXhpbVxcXFxPbmVEcml2ZVxcXFxEb2N1bWVudG9zXFxcXFZhbGthLWNvdXJzZVxcXFxWYWxrYS1jb3Vyc2VzXFxcXFZhbGthLWNvdXJzZXNcXFxccGx1Z2luc1xcXFx2aXN1YWwtZWRpdG9yXFxcXHZpdGUtcGx1Z2luLXJlYWN0LWlubGluZS1lZGl0b3IuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL01heGltL09uZURyaXZlL0RvY3VtZW50b3MvVmFsa2EtY291cnNlL1ZhbGthLWNvdXJzZXMvVmFsa2EtY291cnNlcy9wbHVnaW5zL3Zpc3VhbC1lZGl0b3Ivdml0ZS1wbHVnaW4tcmVhY3QtaW5saW5lLWVkaXRvci5qc1wiO2ltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAndXJsJztcclxuaW1wb3J0IHsgcGFyc2UgfSBmcm9tICdAYmFiZWwvcGFyc2VyJztcclxuaW1wb3J0IHRyYXZlcnNlQmFiZWwgZnJvbSAnQGJhYmVsL3RyYXZlcnNlJztcclxuaW1wb3J0IGdlbmVyYXRlIGZyb20gJ0BiYWJlbC9nZW5lcmF0b3InO1xyXG5pbXBvcnQgKiBhcyB0IGZyb20gJ0BiYWJlbC90eXBlcyc7XHJcbmltcG9ydCBmcyBmcm9tICdmcyc7XHJcblxyXG5jb25zdCBfX2ZpbGVuYW1lID0gZmlsZVVSTFRvUGF0aChpbXBvcnQubWV0YS51cmwpO1xyXG5jb25zdCBfX2Rpcm5hbWUgPSBwYXRoLmRpcm5hbWUoX19maWxlbmFtZSk7XHJcbmNvbnN0IFZJVEVfUFJPSkVDVF9ST09UID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uJyk7XHJcbmNvbnN0IEVESVRBQkxFX0hUTUxfVEFHUyA9IFtcImFcIiwgXCJCdXR0b25cIiwgXCJidXR0b25cIiwgXCJwXCIsIFwic3BhblwiLCBcImgxXCIsIFwiaDJcIiwgXCJoM1wiLCBcImg0XCIsIFwiaDVcIiwgXCJoNlwiLCBcImxhYmVsXCIsIFwiTGFiZWxcIiwgXCJpbWdcIl07XHJcblxyXG5mdW5jdGlvbiBwYXJzZUVkaXRJZChlZGl0SWQpIHtcclxuICBjb25zdCBwYXJ0cyA9IGVkaXRJZC5zcGxpdCgnOicpO1xyXG5cclxuICBpZiAocGFydHMubGVuZ3RoIDwgMykge1xyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG5cclxuICBjb25zdCBjb2x1bW4gPSBwYXJzZUludChwYXJ0cy5hdCgtMSksIDEwKTtcclxuICBjb25zdCBsaW5lID0gcGFyc2VJbnQocGFydHMuYXQoLTIpLCAxMCk7XHJcbiAgY29uc3QgZmlsZVBhdGggPSBwYXJ0cy5zbGljZSgwLCAtMikuam9pbignOicpO1xyXG5cclxuICBpZiAoIWZpbGVQYXRoIHx8IGlzTmFOKGxpbmUpIHx8IGlzTmFOKGNvbHVtbikpIHtcclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHsgZmlsZVBhdGgsIGxpbmUsIGNvbHVtbiB9O1xyXG59XHJcblxyXG5mdW5jdGlvbiBjaGVja1RhZ05hbWVFZGl0YWJsZShvcGVuaW5nRWxlbWVudE5vZGUsIGVkaXRhYmxlVGFnc0xpc3QpIHtcclxuICAgIGlmICghb3BlbmluZ0VsZW1lbnROb2RlIHx8ICFvcGVuaW5nRWxlbWVudE5vZGUubmFtZSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgY29uc3QgbmFtZU5vZGUgPSBvcGVuaW5nRWxlbWVudE5vZGUubmFtZTtcclxuXHJcbiAgICAvLyBDaGVjayAxOiBEaXJlY3QgbmFtZSAoZm9yIDxwPiwgPEJ1dHRvbj4pXHJcbiAgICBpZiAobmFtZU5vZGUudHlwZSA9PT0gJ0pTWElkZW50aWZpZXInICYmIGVkaXRhYmxlVGFnc0xpc3QuaW5jbHVkZXMobmFtZU5vZGUubmFtZSkpIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDaGVjayAyOiBQcm9wZXJ0eSBuYW1lIG9mIGEgbWVtYmVyIGV4cHJlc3Npb24gKGZvciA8bW90aW9uLmgxPiwgY2hlY2sgaWYgXCJoMVwiIGlzIGluIGVkaXRhYmxlVGFnc0xpc3QpXHJcbiAgICBpZiAobmFtZU5vZGUudHlwZSA9PT0gJ0pTWE1lbWJlckV4cHJlc3Npb24nICYmIG5hbWVOb2RlLnByb3BlcnR5ICYmIG5hbWVOb2RlLnByb3BlcnR5LnR5cGUgPT09ICdKU1hJZGVudGlmaWVyJyAmJiBlZGl0YWJsZVRhZ3NMaXN0LmluY2x1ZGVzKG5hbWVOb2RlLnByb3BlcnR5Lm5hbWUpKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG59XHJcblxyXG5mdW5jdGlvbiB2YWxpZGF0ZUltYWdlU3JjKG9wZW5pbmdOb2RlKSB7XHJcbiAgICBpZiAoIW9wZW5pbmdOb2RlIHx8ICFvcGVuaW5nTm9kZS5uYW1lIHx8IG9wZW5pbmdOb2RlLm5hbWUubmFtZSAhPT0gJ2ltZycpIHtcclxuICAgICAgICByZXR1cm4geyBpc1ZhbGlkOiB0cnVlLCByZWFzb246IG51bGwgfTsgLy8gTm90IGFuIGltYWdlLCBza2lwIHZhbGlkYXRpb25cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBoYXNQcm9wc1NwcmVhZCA9IG9wZW5pbmdOb2RlLmF0dHJpYnV0ZXMuc29tZShhdHRyID0+XHJcbiAgICAgICAgdC5pc0pTWFNwcmVhZEF0dHJpYnV0ZShhdHRyKSAmJlxyXG4gICAgICAgIGF0dHIuYXJndW1lbnQgJiZcclxuICAgICAgICB0LmlzSWRlbnRpZmllcihhdHRyLmFyZ3VtZW50KSAmJlxyXG4gICAgICAgIGF0dHIuYXJndW1lbnQubmFtZSA9PT0gJ3Byb3BzJ1xyXG4gICAgKTtcclxuXHJcbiAgICBpZiAoaGFzUHJvcHNTcHJlYWQpIHtcclxuICAgICAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgcmVhc29uOiAncHJvcHMtc3ByZWFkJyB9O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHNyY0F0dHIgPSBvcGVuaW5nTm9kZS5hdHRyaWJ1dGVzLmZpbmQoYXR0ciA9PlxyXG4gICAgICAgIHQuaXNKU1hBdHRyaWJ1dGUoYXR0cikgJiZcclxuICAgICAgICBhdHRyLm5hbWUgJiZcclxuICAgICAgICBhdHRyLm5hbWUubmFtZSA9PT0gJ3NyYydcclxuICAgICk7XHJcblxyXG4gICAgaWYgKCFzcmNBdHRyKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIHJlYXNvbjogJ21pc3Npbmctc3JjJyB9O1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghdC5pc1N0cmluZ0xpdGVyYWwoc3JjQXR0ci52YWx1ZSkpIHtcclxuICAgICAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgcmVhc29uOiAnZHluYW1pYy1zcmMnIH07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFzcmNBdHRyLnZhbHVlLnZhbHVlIHx8IHNyY0F0dHIudmFsdWUudmFsdWUudHJpbSgpID09PSAnJykge1xyXG4gICAgICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCByZWFzb246ICdlbXB0eS1zcmMnIH07XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHsgaXNWYWxpZDogdHJ1ZSwgcmVhc29uOiBudWxsIH07XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGlubGluZUVkaXRQbHVnaW4oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIG5hbWU6ICd2aXRlLWlubGluZS1lZGl0LXBsdWdpbicsXHJcbiAgICBlbmZvcmNlOiAncHJlJyxcclxuXHJcbiAgICB0cmFuc2Zvcm0oY29kZSwgaWQpIHtcclxuICAgICAgaWYgKCEvXFwuKGpzeHx0c3gpJC8udGVzdChpZCkgfHwgIWlkLnN0YXJ0c1dpdGgoVklURV9QUk9KRUNUX1JPT1QpIHx8IGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMnKSkge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCByZWxhdGl2ZUZpbGVQYXRoID0gcGF0aC5yZWxhdGl2ZShWSVRFX1BST0pFQ1RfUk9PVCwgaWQpO1xyXG4gICAgICBjb25zdCB3ZWJSZWxhdGl2ZUZpbGVQYXRoID0gcmVsYXRpdmVGaWxlUGF0aC5zcGxpdChwYXRoLnNlcCkuam9pbignLycpO1xyXG5cclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBiYWJlbEFzdCA9IHBhcnNlKGNvZGUsIHtcclxuICAgICAgICAgIHNvdXJjZVR5cGU6ICdtb2R1bGUnLFxyXG4gICAgICAgICAgcGx1Z2luczogWydqc3gnLCAndHlwZXNjcmlwdCddLFxyXG4gICAgICAgICAgZXJyb3JSZWNvdmVyeTogdHJ1ZVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBsZXQgYXR0cmlidXRlc0FkZGVkID0gMDtcclxuXHJcbiAgICAgICAgdHJhdmVyc2VCYWJlbC5kZWZhdWx0KGJhYmVsQXN0LCB7XHJcbiAgICAgICAgICBlbnRlcihwYXRoKSB7XHJcbiAgICAgICAgICAgIGlmIChwYXRoLmlzSlNYT3BlbmluZ0VsZW1lbnQoKSkge1xyXG4gICAgICAgICAgICAgIGNvbnN0IG9wZW5pbmdOb2RlID0gcGF0aC5ub2RlO1xyXG4gICAgICAgICAgICAgIGNvbnN0IGVsZW1lbnROb2RlID0gcGF0aC5wYXJlbnRQYXRoLm5vZGU7IC8vIFRoZSBKU1hFbGVtZW50IGl0c2VsZlxyXG5cclxuICAgICAgICAgICAgICBpZiAoIW9wZW5pbmdOb2RlLmxvYykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgY29uc3QgYWxyZWFkeUhhc0lkID0gb3BlbmluZ05vZGUuYXR0cmlidXRlcy5zb21lKFxyXG4gICAgICAgICAgICAgICAgKGF0dHIpID0+IHQuaXNKU1hBdHRyaWJ1dGUoYXR0cikgJiYgYXR0ci5uYW1lLm5hbWUgPT09ICdkYXRhLWVkaXQtaWQnXHJcbiAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgaWYgKGFscmVhZHlIYXNJZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgLy8gQ29uZGl0aW9uIDE6IElzIHRoZSBjdXJyZW50IGVsZW1lbnQgdGFnIHR5cGUgZWRpdGFibGU/XHJcbiAgICAgICAgICAgICAgY29uc3QgaXNDdXJyZW50RWxlbWVudEVkaXRhYmxlID0gY2hlY2tUYWdOYW1lRWRpdGFibGUob3BlbmluZ05vZGUsIEVESVRBQkxFX0hUTUxfVEFHUyk7XHJcbiAgICAgICAgICAgICAgaWYgKCFpc0N1cnJlbnRFbGVtZW50RWRpdGFibGUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIGNvbnN0IGltYWdlVmFsaWRhdGlvbiA9IHZhbGlkYXRlSW1hZ2VTcmMob3BlbmluZ05vZGUpO1xyXG4gICAgICAgICAgICAgIGlmICghaW1hZ2VWYWxpZGF0aW9uLmlzVmFsaWQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGRpc2FibGVkQXR0cmlidXRlID0gdC5qc3hBdHRyaWJ1dGUoXHJcbiAgICAgICAgICAgICAgICAgIHQuanN4SWRlbnRpZmllcignZGF0YS1lZGl0LWRpc2FibGVkJyksXHJcbiAgICAgICAgICAgICAgICAgIHQuc3RyaW5nTGl0ZXJhbCgndHJ1ZScpXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgb3BlbmluZ05vZGUuYXR0cmlidXRlcy5wdXNoKGRpc2FibGVkQXR0cmlidXRlKTtcclxuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXNBZGRlZCsrO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgbGV0IHNob3VsZEJlRGlzYWJsZWREdWVUb0NoaWxkcmVuID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAgIC8vIENvbmRpdGlvbiAyOiBEb2VzIHRoZSBlbGVtZW50IGhhdmUgZHluYW1pYyBvciBlZGl0YWJsZSBjaGlsZHJlblxyXG4gICAgICAgICAgICAgIGlmICh0LmlzSlNYRWxlbWVudChlbGVtZW50Tm9kZSkgJiYgZWxlbWVudE5vZGUuY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIGVsZW1lbnQgaGFzIHsuLi5wcm9wc30gc3ByZWFkIGF0dHJpYnV0ZSAtIGRpc2FibGUgZWRpdGluZyBpZiBpdCBkb2VzXHJcbiAgICAgICAgICAgICAgICBjb25zdCBoYXNQcm9wc1NwcmVhZCA9IG9wZW5pbmdOb2RlLmF0dHJpYnV0ZXMuc29tZShhdHRyID0+IHQuaXNKU1hTcHJlYWRBdHRyaWJ1dGUoYXR0cilcclxuICAgICAgICAgICAgICAgICYmIGF0dHIuYXJndW1lbnRcclxuICAgICAgICAgICAgICAgICYmIHQuaXNJZGVudGlmaWVyKGF0dHIuYXJndW1lbnQpXHJcbiAgICAgICAgICAgICAgICAmJiBhdHRyLmFyZ3VtZW50Lm5hbWUgPT09ICdwcm9wcydcclxuICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgaGFzRHluYW1pY0NoaWxkID0gZWxlbWVudE5vZGUuY2hpbGRyZW4uc29tZShjaGlsZCA9PlxyXG4gICAgICAgICAgICAgICAgICB0LmlzSlNYRXhwcmVzc2lvbkNvbnRhaW5lcihjaGlsZClcclxuICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGhhc0R5bmFtaWNDaGlsZCB8fCBoYXNQcm9wc1NwcmVhZCkge1xyXG4gICAgICAgICAgICAgICAgICBzaG91bGRCZURpc2FibGVkRHVlVG9DaGlsZHJlbiA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICBpZiAoIXNob3VsZEJlRGlzYWJsZWREdWVUb0NoaWxkcmVuICYmIHQuaXNKU1hFbGVtZW50KGVsZW1lbnROb2RlKSAmJiBlbGVtZW50Tm9kZS5jaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaGFzRWRpdGFibGVKc3hDaGlsZCA9IGVsZW1lbnROb2RlLmNoaWxkcmVuLnNvbWUoY2hpbGQgPT4ge1xyXG4gICAgICAgICAgICAgICAgICBpZiAodC5pc0pTWEVsZW1lbnQoY2hpbGQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNoZWNrVGFnTmFtZUVkaXRhYmxlKGNoaWxkLm9wZW5pbmdFbGVtZW50LCBFRElUQUJMRV9IVE1MX1RBR1MpO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoaGFzRWRpdGFibGVKc3hDaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgICBzaG91bGRCZURpc2FibGVkRHVlVG9DaGlsZHJlbiA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICBpZiAoc2hvdWxkQmVEaXNhYmxlZER1ZVRvQ2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGRpc2FibGVkQXR0cmlidXRlID0gdC5qc3hBdHRyaWJ1dGUoXHJcbiAgICAgICAgICAgICAgICAgIHQuanN4SWRlbnRpZmllcignZGF0YS1lZGl0LWRpc2FibGVkJyksXHJcbiAgICAgICAgICAgICAgICAgIHQuc3RyaW5nTGl0ZXJhbCgndHJ1ZScpXHJcbiAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgIG9wZW5pbmdOb2RlLmF0dHJpYnV0ZXMucHVzaChkaXNhYmxlZEF0dHJpYnV0ZSk7XHJcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzQWRkZWQrKztcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIC8vIENvbmRpdGlvbiAzOiBQYXJlbnQgaXMgbm9uLWVkaXRhYmxlIGlmIEFUIExFQVNUIE9ORSBjaGlsZCBKU1hFbGVtZW50IGlzIGEgbm9uLWVkaXRhYmxlIHR5cGUuXHJcbiAgICAgICAgICAgICAgaWYgKHQuaXNKU1hFbGVtZW50KGVsZW1lbnROb2RlKSAmJiBlbGVtZW50Tm9kZS5jaGlsZHJlbiAmJiBlbGVtZW50Tm9kZS5jaGlsZHJlbi5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgIGxldCBoYXNOb25FZGl0YWJsZUpzeENoaWxkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgY2hpbGQgb2YgZWxlbWVudE5vZGUuY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgIGlmICh0LmlzSlNYRWxlbWVudChjaGlsZCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWNoZWNrVGFnTmFtZUVkaXRhYmxlKGNoaWxkLm9wZW5pbmdFbGVtZW50LCBFRElUQUJMRV9IVE1MX1RBR1MpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc05vbkVkaXRhYmxlSnN4Q2hpbGQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgaWYgKGhhc05vbkVkaXRhYmxlSnN4Q2hpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRpc2FibGVkQXR0cmlidXRlID0gdC5qc3hBdHRyaWJ1dGUoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHQuanN4SWRlbnRpZmllcignZGF0YS1lZGl0LWRpc2FibGVkJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHQuc3RyaW5nTGl0ZXJhbChcInRydWVcIilcclxuICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICBvcGVuaW5nTm9kZS5hdHRyaWJ1dGVzLnB1c2goZGlzYWJsZWRBdHRyaWJ1dGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlc0FkZGVkKys7XHJcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIC8vIENvbmRpdGlvbiA0OiBJcyBhbnkgYW5jZXN0b3IgSlNYRWxlbWVudCBhbHNvIGVkaXRhYmxlP1xyXG4gICAgICAgICAgICAgIGxldCBjdXJyZW50QW5jZXN0b3JDYW5kaWRhdGVQYXRoID0gcGF0aC5wYXJlbnRQYXRoLnBhcmVudFBhdGg7XHJcbiAgICAgICAgICAgICAgd2hpbGUgKGN1cnJlbnRBbmNlc3RvckNhbmRpZGF0ZVBhdGgpIHtcclxuICAgICAgICAgICAgICAgICAgY29uc3QgYW5jZXN0b3JKc3hFbGVtZW50UGF0aCA9IGN1cnJlbnRBbmNlc3RvckNhbmRpZGF0ZVBhdGguaXNKU1hFbGVtZW50KClcclxuICAgICAgICAgICAgICAgICAgICAgID8gY3VycmVudEFuY2VzdG9yQ2FuZGlkYXRlUGF0aFxyXG4gICAgICAgICAgICAgICAgICAgICAgOiBjdXJyZW50QW5jZXN0b3JDYW5kaWRhdGVQYXRoLmZpbmRQYXJlbnQocCA9PiBwLmlzSlNYRWxlbWVudCgpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgIGlmICghYW5jZXN0b3JKc3hFbGVtZW50UGF0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgIGlmIChjaGVja1RhZ05hbWVFZGl0YWJsZShhbmNlc3RvckpzeEVsZW1lbnRQYXRoLm5vZGUub3BlbmluZ0VsZW1lbnQsIEVESVRBQkxFX0hUTUxfVEFHUykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICBjdXJyZW50QW5jZXN0b3JDYW5kaWRhdGVQYXRoID0gYW5jZXN0b3JKc3hFbGVtZW50UGF0aC5wYXJlbnRQYXRoO1xyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgY29uc3QgbGluZSA9IG9wZW5pbmdOb2RlLmxvYy5zdGFydC5saW5lO1xyXG4gICAgICAgICAgICAgIGNvbnN0IGNvbHVtbiA9IG9wZW5pbmdOb2RlLmxvYy5zdGFydC5jb2x1bW4gKyAxO1xyXG4gICAgICAgICAgICAgIGNvbnN0IGVkaXRJZCA9IGAke3dlYlJlbGF0aXZlRmlsZVBhdGh9OiR7bGluZX06JHtjb2x1bW59YDtcclxuXHJcbiAgICAgICAgICAgICAgY29uc3QgaWRBdHRyaWJ1dGUgPSB0LmpzeEF0dHJpYnV0ZShcclxuICAgICAgICAgICAgICAgIHQuanN4SWRlbnRpZmllcignZGF0YS1lZGl0LWlkJyksXHJcbiAgICAgICAgICAgICAgICB0LnN0cmluZ0xpdGVyYWwoZWRpdElkKVxyXG4gICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgIG9wZW5pbmdOb2RlLmF0dHJpYnV0ZXMucHVzaChpZEF0dHJpYnV0ZSk7XHJcbiAgICAgICAgICAgICAgYXR0cmlidXRlc0FkZGVkKys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYgKGF0dHJpYnV0ZXNBZGRlZCA+IDApIHtcclxuICAgICAgICAgIGNvbnN0IGdlbmVyYXRlRnVuY3Rpb24gPSBnZW5lcmF0ZS5kZWZhdWx0IHx8IGdlbmVyYXRlO1xyXG4gICAgICAgICAgY29uc3Qgb3V0cHV0ID0gZ2VuZXJhdGVGdW5jdGlvbihiYWJlbEFzdCwge1xyXG4gICAgICAgICAgICBzb3VyY2VNYXBzOiB0cnVlLFxyXG4gICAgICAgICAgICBzb3VyY2VGaWxlTmFtZTogd2ViUmVsYXRpdmVGaWxlUGF0aFxyXG4gICAgICAgICAgfSwgY29kZSk7XHJcblxyXG4gICAgICAgICAgcmV0dXJuIHsgY29kZTogb3V0cHV0LmNvZGUsIG1hcDogb3V0cHV0Lm1hcCB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihgW3ZpdGVdW3Zpc3VhbC1lZGl0b3JdIEVycm9yIHRyYW5zZm9ybWluZyAke2lkfTpgLCBlcnJvcik7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcblxyXG5cclxuICAgIC8vIFVwZGF0ZXMgc291cmNlIGNvZGUgYmFzZWQgb24gdGhlIGNoYW5nZXMgcmVjZWl2ZWQgZnJvbSB0aGUgY2xpZW50XHJcbiAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyKSB7XHJcbiAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoJy9hcGkvYXBwbHktZWRpdCcsIGFzeW5jIChyZXEsIHJlcywgbmV4dCkgPT4ge1xyXG4gICAgICAgIGlmIChyZXEubWV0aG9kICE9PSAnUE9TVCcpIHJldHVybiBuZXh0KCk7XHJcblxyXG4gICAgICAgIGxldCBib2R5ID0gJyc7XHJcbiAgICAgICAgcmVxLm9uKCdkYXRhJywgY2h1bmsgPT4geyBib2R5ICs9IGNodW5rLnRvU3RyaW5nKCk7IH0pO1xyXG5cclxuICAgICAgICByZXEub24oJ2VuZCcsIGFzeW5jICgpID0+IHtcclxuICAgICAgICAgIGxldCBhYnNvbHV0ZUZpbGVQYXRoID0gJyc7XHJcbiAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCB7IGVkaXRJZCwgbmV3RnVsbFRleHQgfSA9IEpTT04ucGFyc2UoYm9keSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWVkaXRJZCB8fCB0eXBlb2YgbmV3RnVsbFRleHQgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgcmVzLndyaXRlSGVhZCg0MDAsIHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9KTtcclxuICAgICAgICAgICAgICByZXR1cm4gcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnTWlzc2luZyBlZGl0SWQgb3IgbmV3RnVsbFRleHQnIH0pKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgcGFyc2VkSWQgPSBwYXJzZUVkaXRJZChlZGl0SWQpO1xyXG4gICAgICAgICAgICBpZiAoIXBhcnNlZElkKSB7XHJcbiAgICAgICAgICAgICAgcmVzLndyaXRlSGVhZCg0MDAsIHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9KTtcclxuICAgICAgICAgICAgICByZXR1cm4gcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnSW52YWxpZCBlZGl0SWQgZm9ybWF0IChmaWxlUGF0aDpsaW5lOmNvbHVtbiknIH0pKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgeyBmaWxlUGF0aCwgbGluZSwgY29sdW1uIH0gPSBwYXJzZWRJZDtcclxuXHJcbiAgICAgICAgICAgIGFic29sdXRlRmlsZVBhdGggPSBwYXRoLnJlc29sdmUoVklURV9QUk9KRUNUX1JPT1QsIGZpbGVQYXRoKTtcclxuICAgICAgICAgICAgaWYgKGZpbGVQYXRoLmluY2x1ZGVzKCcuLicpIHx8ICFhYnNvbHV0ZUZpbGVQYXRoLnN0YXJ0c1dpdGgoVklURV9QUk9KRUNUX1JPT1QpIHx8IGFic29sdXRlRmlsZVBhdGguaW5jbHVkZXMoJ25vZGVfbW9kdWxlcycpKSB7XHJcbiAgICAgICAgICAgICAgcmVzLndyaXRlSGVhZCg0MDAsIHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9KTtcclxuICAgICAgICAgICAgICByZXR1cm4gcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnSW52YWxpZCBwYXRoJyB9KSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IG9yaWdpbmFsQ29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhhYnNvbHV0ZUZpbGVQYXRoLCAndXRmLTgnKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGJhYmVsQXN0ID0gcGFyc2Uob3JpZ2luYWxDb250ZW50LCB7XHJcbiAgICAgICAgICAgICAgc291cmNlVHlwZTogJ21vZHVsZScsXHJcbiAgICAgICAgICAgICAgcGx1Z2luczogWydqc3gnLCAndHlwZXNjcmlwdCddLFxyXG4gICAgICAgICAgICAgIGVycm9yUmVjb3Zlcnk6IHRydWVcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBsZXQgdGFyZ2V0Tm9kZVBhdGggPSBudWxsO1xyXG4gICAgICAgICAgICBjb25zdCB2aXNpdG9yID0ge1xyXG4gICAgICAgICAgICAgIEpTWE9wZW5pbmdFbGVtZW50KHBhdGgpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBwYXRoLm5vZGU7XHJcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5sb2MgJiYgbm9kZS5sb2Muc3RhcnQubGluZSA9PT0gbGluZSAmJiBub2RlLmxvYy5zdGFydC5jb2x1bW4gKyAxID09PSBjb2x1bW4pIHtcclxuICAgICAgICAgICAgICAgICAgdGFyZ2V0Tm9kZVBhdGggPSBwYXRoO1xyXG4gICAgICAgICAgICAgICAgICBwYXRoLnN0b3AoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHRyYXZlcnNlQmFiZWwuZGVmYXVsdChiYWJlbEFzdCwgdmlzaXRvcik7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXRhcmdldE5vZGVQYXRoKSB7XHJcbiAgICAgICAgICAgICAgcmVzLndyaXRlSGVhZCg0MDQsIHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9KTtcclxuICAgICAgICAgICAgICByZXR1cm4gcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnVGFyZ2V0IG5vZGUgbm90IGZvdW5kIGJ5IGxpbmUvY29sdW1uJywgZWRpdElkIH0pKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgZ2VuZXJhdGVGdW5jdGlvbiA9IGdlbmVyYXRlLmRlZmF1bHQgfHwgZ2VuZXJhdGU7XHJcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldE9wZW5pbmdFbGVtZW50ID0gdGFyZ2V0Tm9kZVBhdGgubm9kZTtcclxuICAgICAgICAgICAgY29uc3QgcGFyZW50RWxlbWVudE5vZGUgPSB0YXJnZXROb2RlUGF0aC5wYXJlbnRQYXRoPy5ub2RlO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgaXNJbWFnZUVsZW1lbnQgPSB0YXJnZXRPcGVuaW5nRWxlbWVudC5uYW1lICYmIHRhcmdldE9wZW5pbmdFbGVtZW50Lm5hbWUubmFtZSA9PT0gJ2ltZyc7XHJcblxyXG4gICAgICAgICAgICBsZXQgYmVmb3JlQ29kZSA9ICcnO1xyXG4gICAgICAgICAgICBsZXQgYWZ0ZXJDb2RlID0gJyc7XHJcbiAgICAgICAgICAgIGxldCBtb2RpZmllZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgaWYgKGlzSW1hZ2VFbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgLy8gSGFuZGxlIGltYWdlIHNyYyBhdHRyaWJ1dGUgdXBkYXRlXHJcbiAgICAgICAgICAgICAgY29uc3QgYmVmb3JlT3V0cHV0ID0gZ2VuZXJhdGVGdW5jdGlvbih0YXJnZXRPcGVuaW5nRWxlbWVudCwge30pO1xyXG4gICAgICAgICAgICAgIGJlZm9yZUNvZGUgPSBiZWZvcmVPdXRwdXQuY29kZTtcclxuXHJcbiAgICAgICAgICAgICAgY29uc3Qgc3JjQXR0ciA9IHRhcmdldE9wZW5pbmdFbGVtZW50LmF0dHJpYnV0ZXMuZmluZChhdHRyID0+XHJcbiAgICAgICAgICAgICAgICB0LmlzSlNYQXR0cmlidXRlKGF0dHIpICYmIGF0dHIubmFtZSAmJiBhdHRyLm5hbWUubmFtZSA9PT0gJ3NyYydcclxuICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICBpZiAoc3JjQXR0ciAmJiB0LmlzU3RyaW5nTGl0ZXJhbChzcmNBdHRyLnZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgc3JjQXR0ci52YWx1ZSA9IHQuc3RyaW5nTGl0ZXJhbChuZXdGdWxsVGV4dCk7XHJcbiAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgYWZ0ZXJPdXRwdXQgPSBnZW5lcmF0ZUZ1bmN0aW9uKHRhcmdldE9wZW5pbmdFbGVtZW50LCB7fSk7XHJcbiAgICAgICAgICAgICAgICBhZnRlckNvZGUgPSBhZnRlck91dHB1dC5jb2RlO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBpZiAocGFyZW50RWxlbWVudE5vZGUgJiYgdC5pc0pTWEVsZW1lbnQocGFyZW50RWxlbWVudE5vZGUpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBiZWZvcmVPdXRwdXQgPSBnZW5lcmF0ZUZ1bmN0aW9uKHBhcmVudEVsZW1lbnROb2RlLCB7fSk7XHJcbiAgICAgICAgICAgICAgICBiZWZvcmVDb2RlID0gYmVmb3JlT3V0cHV0LmNvZGU7XHJcblxyXG4gICAgICAgICAgICAgICAgcGFyZW50RWxlbWVudE5vZGUuY2hpbGRyZW4gPSBbXTtcclxuICAgICAgICAgICAgICAgIGlmIChuZXdGdWxsVGV4dCAmJiBuZXdGdWxsVGV4dC50cmltKCkgIT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld1RleHROb2RlID0gdC5qc3hUZXh0KG5ld0Z1bGxUZXh0KTtcclxuICAgICAgICAgICAgICAgICAgcGFyZW50RWxlbWVudE5vZGUuY2hpbGRyZW4ucHVzaChuZXdUZXh0Tm9kZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBtb2RpZmllZCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgYWZ0ZXJPdXRwdXQgPSBnZW5lcmF0ZUZ1bmN0aW9uKHBhcmVudEVsZW1lbnROb2RlLCB7fSk7XHJcbiAgICAgICAgICAgICAgICBhZnRlckNvZGUgPSBhZnRlck91dHB1dC5jb2RlO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFtb2RpZmllZCkge1xyXG4gICAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoNDA5LCB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSk7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ0NvdWxkIG5vdCBhcHBseSBjaGFuZ2VzIHRvIEFTVC4nIH0pKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3Qgb3V0cHV0ID0gZ2VuZXJhdGVGdW5jdGlvbihiYWJlbEFzdCwge30pO1xyXG4gICAgICAgICAgICBjb25zdCBuZXdDb250ZW50ID0gb3V0cHV0LmNvZGU7XHJcblxyXG4gICAgICAgICAgICByZXMud3JpdGVIZWFkKDIwMCwgeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0pO1xyXG4gICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBuZXdGaWxlQ29udGVudDogbmV3Q29udGVudCxcclxuICAgICAgICAgICAgICAgIGJlZm9yZUNvZGUsXHJcbiAgICAgICAgICAgICAgICBhZnRlckNvZGUsXHJcbiAgICAgICAgICAgIH0pKTtcclxuXHJcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICByZXMud3JpdGVIZWFkKDUwMCwgeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0pO1xyXG4gICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdJbnRlcm5hbCBzZXJ2ZXIgZXJyb3IgZHVyaW5nIGVkaXQgYXBwbGljYXRpb24uJyB9KSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH07XHJcbn0iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXE1heGltXFxcXE9uZURyaXZlXFxcXERvY3VtZW50b3NcXFxcVmFsa2EtY291cnNlXFxcXFZhbGthLWNvdXJzZXNcXFxcVmFsa2EtY291cnNlc1xcXFxwbHVnaW5zXFxcXHZpc3VhbC1lZGl0b3JcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXE1heGltXFxcXE9uZURyaXZlXFxcXERvY3VtZW50b3NcXFxcVmFsa2EtY291cnNlXFxcXFZhbGthLWNvdXJzZXNcXFxcVmFsa2EtY291cnNlc1xcXFxwbHVnaW5zXFxcXHZpc3VhbC1lZGl0b3JcXFxcdmlzdWFsLWVkaXRvci1jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL01heGltL09uZURyaXZlL0RvY3VtZW50b3MvVmFsa2EtY291cnNlL1ZhbGthLWNvdXJzZXMvVmFsa2EtY291cnNlcy9wbHVnaW5zL3Zpc3VhbC1lZGl0b3IvdmlzdWFsLWVkaXRvci1jb25maWcuanNcIjtleHBvcnQgY29uc3QgUE9QVVBfU1RZTEVTID0gYFxyXG4jaW5saW5lLWVkaXRvci1wb3B1cCB7XHJcbiAgd2lkdGg6IDM2MHB4O1xyXG4gIHBvc2l0aW9uOiBmaXhlZDtcclxuICB6LWluZGV4OiAxMDAwMDtcclxuICBiYWNrZ3JvdW5kOiAjMTYxNzE4O1xyXG4gIGNvbG9yOiB3aGl0ZTtcclxuICBib3JkZXI6IDFweCBzb2xpZCAjNGE1NTY4O1xyXG4gIGJvcmRlci1yYWRpdXM6IDE2cHg7XHJcbiAgcGFkZGluZzogOHB4O1xyXG4gIGJveC1zaGFkb3c6IDAgNHB4IDEycHggcmdiYSgwLDAsMCwwLjIpO1xyXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XHJcbiAgZ2FwOiAxMHB4O1xyXG4gIGRpc3BsYXk6IG5vbmU7XHJcbn1cclxuXHJcbkBtZWRpYSAobWF4LXdpZHRoOiA3NjhweCkge1xyXG4gICNpbmxpbmUtZWRpdG9yLXBvcHVwIHtcclxuICAgIHdpZHRoOiBjYWxjKDEwMCUgLSAyMHB4KTtcclxuICB9XHJcbn1cclxuXHJcbiNpbmxpbmUtZWRpdG9yLXBvcHVwLmlzLWFjdGl2ZSB7XHJcbiAgZGlzcGxheTogZmxleDtcclxuICB0b3A6IDUwJTtcclxuICBsZWZ0OiA1MCU7XHJcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgLTUwJSk7XHJcbn1cclxuXHJcbiNpbmxpbmUtZWRpdG9yLXBvcHVwLmlzLWRpc2FibGVkLXZpZXcge1xyXG4gIHBhZGRpbmc6IDEwcHggMTVweDtcclxufVxyXG5cclxuI2lubGluZS1lZGl0b3ItcG9wdXAgdGV4dGFyZWEge1xyXG4gIGhlaWdodDogMTAwcHg7XHJcbiAgcGFkZGluZzogNHB4IDhweDtcclxuICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDtcclxuICBjb2xvcjogd2hpdGU7XHJcbiAgZm9udC1mYW1pbHk6IGluaGVyaXQ7XHJcbiAgZm9udC1zaXplOiAwLjg3NXJlbTtcclxuICBsaW5lLWhlaWdodDogMS40MjtcclxuICByZXNpemU6IG5vbmU7XHJcbiAgb3V0bGluZTogbm9uZTtcclxufVxyXG5cclxuI2lubGluZS1lZGl0b3ItcG9wdXAgLmJ1dHRvbi1jb250YWluZXIge1xyXG4gIGRpc3BsYXk6IGZsZXg7XHJcbiAganVzdGlmeS1jb250ZW50OiBmbGV4LWVuZDtcclxuICBnYXA6IDEwcHg7XHJcbn1cclxuXHJcbiNpbmxpbmUtZWRpdG9yLXBvcHVwIC5wb3B1cC1idXR0b24ge1xyXG4gIGJvcmRlcjogbm9uZTtcclxuICBwYWRkaW5nOiA2cHggMTZweDtcclxuICBib3JkZXItcmFkaXVzOiA4cHg7XHJcbiAgY3Vyc29yOiBwb2ludGVyO1xyXG4gIGZvbnQtc2l6ZTogMC43NXJlbTtcclxuICBmb250LXdlaWdodDogNzAwO1xyXG4gIGhlaWdodDogMzRweDtcclxuICBvdXRsaW5lOiBub25lO1xyXG59XHJcblxyXG4jaW5saW5lLWVkaXRvci1wb3B1cCAuc2F2ZS1idXR0b24ge1xyXG4gIGJhY2tncm91bmQ6ICM2NzNkZTY7XHJcbiAgY29sb3I6IHdoaXRlO1xyXG59XHJcblxyXG4jaW5saW5lLWVkaXRvci1wb3B1cCAuY2FuY2VsLWJ1dHRvbiB7XHJcbiAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XHJcbiAgYm9yZGVyOiAxcHggc29saWQgIzNiM2Q0YTtcclxuICBjb2xvcjogd2hpdGU7XHJcblxyXG4gICY6aG92ZXIge1xyXG4gICAgYmFja2dyb3VuZDojNDc0OTU4O1xyXG4gIH1cclxufVxyXG5gO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFBvcHVwSFRNTFRlbXBsYXRlKHNhdmVMYWJlbCwgY2FuY2VsTGFiZWwpIHtcclxuICByZXR1cm4gYFxyXG4gICAgPHRleHRhcmVhPjwvdGV4dGFyZWE+XHJcbiAgICA8ZGl2IGNsYXNzPVwiYnV0dG9uLWNvbnRhaW5lclwiPlxyXG4gICAgICA8YnV0dG9uIGNsYXNzPVwicG9wdXAtYnV0dG9uIGNhbmNlbC1idXR0b25cIj4ke2NhbmNlbExhYmVsfTwvYnV0dG9uPlxyXG4gICAgICA8YnV0dG9uIGNsYXNzPVwicG9wdXAtYnV0dG9uIHNhdmUtYnV0dG9uXCI+JHtzYXZlTGFiZWx9PC9idXR0b24+XHJcbiAgICA8L2Rpdj5cclxuICBgO1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IEVESVRfTU9ERV9TVFlMRVMgPSBgXHJcbiAgI3Jvb3RbZGF0YS1lZGl0LW1vZGUtZW5hYmxlZD1cInRydWVcIl0gW2RhdGEtZWRpdC1pZF0ge1xyXG4gICAgY3Vyc29yOiBwb2ludGVyOyBcclxuICAgIG91dGxpbmU6IDFweCBkYXNoZWQgIzM1N0RGOTsgXHJcbiAgICBvdXRsaW5lLW9mZnNldDogMnB4O1xyXG4gICAgbWluLWhlaWdodDogMWVtO1xyXG4gIH1cclxuICAjcm9vdFtkYXRhLWVkaXQtbW9kZS1lbmFibGVkPVwidHJ1ZVwiXSB7XHJcbiAgICBjdXJzb3I6IHBvaW50ZXI7XHJcbiAgfVxyXG4gICNyb290W2RhdGEtZWRpdC1tb2RlLWVuYWJsZWQ9XCJ0cnVlXCJdIFtkYXRhLWVkaXQtaWRdOmhvdmVyIHtcclxuICAgIGJhY2tncm91bmQtY29sb3I6ICMzNTdERjkzMztcclxuICAgIG91dGxpbmUtY29sb3I6ICMzNTdERjk7IFxyXG4gIH1cclxuXHJcbiAgQGtleWZyYW1lcyBmYWRlSW5Ub29sdGlwIHtcclxuICAgIGZyb20ge1xyXG4gICAgICBvcGFjaXR5OiAwO1xyXG4gICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoNXB4KTtcclxuICAgIH1cclxuICAgIHRvIHtcclxuICAgICAgb3BhY2l0eTogMTtcclxuICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgI2lubGluZS1lZGl0b3ItZGlzYWJsZWQtdG9vbHRpcCB7XHJcbiAgICBkaXNwbGF5OiBub25lOyBcclxuICAgIG9wYWNpdHk6IDA7IFxyXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xyXG4gICAgYmFja2dyb3VuZC1jb2xvcjogIzFEMUUyMDtcclxuICAgIGNvbG9yOiB3aGl0ZTtcclxuICAgIHBhZGRpbmc6IDRweCA4cHg7XHJcbiAgICBib3JkZXItcmFkaXVzOiA4cHg7XHJcbiAgICB6LWluZGV4OiAxMDAwMTtcclxuICAgIGZvbnQtc2l6ZTogMTRweDtcclxuICAgIGJvcmRlcjogMXB4IHNvbGlkICMzQjNENEE7XHJcbiAgICBtYXgtd2lkdGg6IDE4NHB4O1xyXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xyXG4gIH1cclxuXHJcbiAgI2lubGluZS1lZGl0b3ItZGlzYWJsZWQtdG9vbHRpcC50b29sdGlwLWFjdGl2ZSB7XHJcbiAgICBkaXNwbGF5OiBibG9jaztcclxuICAgIGFuaW1hdGlvbjogZmFkZUluVG9vbHRpcCAwLjJzIGVhc2Utb3V0IGZvcndhcmRzO1xyXG4gIH1cclxuYDsiLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXE1heGltXFxcXE9uZURyaXZlXFxcXERvY3VtZW50b3NcXFxcVmFsa2EtY291cnNlXFxcXFZhbGthLWNvdXJzZXNcXFxcVmFsa2EtY291cnNlc1xcXFxwbHVnaW5zXFxcXHZpc3VhbC1lZGl0b3JcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXE1heGltXFxcXE9uZURyaXZlXFxcXERvY3VtZW50b3NcXFxcVmFsa2EtY291cnNlXFxcXFZhbGthLWNvdXJzZXNcXFxcVmFsa2EtY291cnNlc1xcXFxwbHVnaW5zXFxcXHZpc3VhbC1lZGl0b3JcXFxcdml0ZS1wbHVnaW4tZWRpdC1tb2RlLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9NYXhpbS9PbmVEcml2ZS9Eb2N1bWVudG9zL1ZhbGthLWNvdXJzZS9WYWxrYS1jb3Vyc2VzL1ZhbGthLWNvdXJzZXMvcGx1Z2lucy92aXN1YWwtZWRpdG9yL3ZpdGUtcGx1Z2luLWVkaXQtbW9kZS5qc1wiO2ltcG9ydCB7IHJlYWRGaWxlU3luYyB9IGZyb20gJ2ZzJztcclxuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAndXJsJztcclxuaW1wb3J0IHsgRURJVF9NT0RFX1NUWUxFUyB9IGZyb20gJy4vdmlzdWFsLWVkaXRvci1jb25maWcnO1xyXG5cclxuY29uc3QgX19maWxlbmFtZSA9IGZpbGVVUkxUb1BhdGgoaW1wb3J0Lm1ldGEudXJsKTtcclxuY29uc3QgX19kaXJuYW1lID0gcmVzb2x2ZShfX2ZpbGVuYW1lLCAnLi4nKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGlubGluZUVkaXREZXZQbHVnaW4oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIG5hbWU6ICd2aXRlOmlubGluZS1lZGl0LWRldicsXHJcbiAgICBhcHBseTogJ3NlcnZlJyxcclxuICAgIHRyYW5zZm9ybUluZGV4SHRtbCgpIHtcclxuICAgICAgY29uc3Qgc2NyaXB0UGF0aCA9IHJlc29sdmUoX19kaXJuYW1lLCAnZWRpdC1tb2RlLXNjcmlwdC5qcycpO1xyXG4gICAgICBjb25zdCBzY3JpcHRDb250ZW50ID0gcmVhZEZpbGVTeW5jKHNjcmlwdFBhdGgsICd1dGYtOCcpO1xyXG5cclxuICAgICAgcmV0dXJuIFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICB0YWc6ICdzY3JpcHQnLFxyXG4gICAgICAgICAgYXR0cnM6IHsgdHlwZTogJ21vZHVsZScgfSxcclxuICAgICAgICAgIGNoaWxkcmVuOiBzY3JpcHRDb250ZW50LFxyXG4gICAgICAgICAgaW5qZWN0VG86ICdib2R5J1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgdGFnOiAnc3R5bGUnLFxyXG4gICAgICAgICAgY2hpbGRyZW46IEVESVRfTU9ERV9TVFlMRVMsXHJcbiAgICAgICAgICBpbmplY3RUbzogJ2hlYWQnXHJcbiAgICAgICAgfVxyXG4gICAgICBdO1xyXG4gICAgfVxyXG4gIH07XHJcbn1cclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxNYXhpbVxcXFxPbmVEcml2ZVxcXFxEb2N1bWVudG9zXFxcXFZhbGthLWNvdXJzZVxcXFxWYWxrYS1jb3Vyc2VzXFxcXFZhbGthLWNvdXJzZXNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXE1heGltXFxcXE9uZURyaXZlXFxcXERvY3VtZW50b3NcXFxcVmFsa2EtY291cnNlXFxcXFZhbGthLWNvdXJzZXNcXFxcVmFsa2EtY291cnNlc1xcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvTWF4aW0vT25lRHJpdmUvRG9jdW1lbnRvcy9WYWxrYS1jb3Vyc2UvVmFsa2EtY291cnNlcy9WYWxrYS1jb3Vyc2VzL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHBhdGggZnJvbSAnbm9kZTpwYXRoJztcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0JztcclxuaW1wb3J0IHsgY3JlYXRlTG9nZ2VyLCBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcclxuXHJcbmNvbnN0IGlzRGV2ID0gcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJztcclxubGV0IGlubGluZUVkaXRQbHVnaW4sIGVkaXRNb2RlRGV2UGx1Z2luO1xyXG5cclxuaWYgKGlzRGV2KSB7XHJcblx0aW5saW5lRWRpdFBsdWdpbiA9IChhd2FpdCBpbXBvcnQoJy4vcGx1Z2lucy92aXN1YWwtZWRpdG9yL3ZpdGUtcGx1Z2luLXJlYWN0LWlubGluZS1lZGl0b3IuanMnKSkuZGVmYXVsdDtcclxuXHRlZGl0TW9kZURldlBsdWdpbiA9IChhd2FpdCBpbXBvcnQoJy4vcGx1Z2lucy92aXN1YWwtZWRpdG9yL3ZpdGUtcGx1Z2luLWVkaXQtbW9kZS5qcycpKS5kZWZhdWx0O1xyXG59XHJcblxyXG5jb25zdCBjb25maWdIb3Jpem9uc1ZpdGVFcnJvckhhbmRsZXIgPSBgXHJcbmNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKG11dGF0aW9ucykgPT4ge1xyXG5cdGZvciAoY29uc3QgbXV0YXRpb24gb2YgbXV0YXRpb25zKSB7XHJcblx0XHRmb3IgKGNvbnN0IGFkZGVkTm9kZSBvZiBtdXRhdGlvbi5hZGRlZE5vZGVzKSB7XHJcblx0XHRcdGlmIChcclxuXHRcdFx0XHRhZGRlZE5vZGUubm9kZVR5cGUgPT09IE5vZGUuRUxFTUVOVF9OT0RFICYmXHJcblx0XHRcdFx0KFxyXG5cdFx0XHRcdFx0YWRkZWROb2RlLnRhZ05hbWU/LnRvTG93ZXJDYXNlKCkgPT09ICd2aXRlLWVycm9yLW92ZXJsYXknIHx8XHJcblx0XHRcdFx0XHRhZGRlZE5vZGUuY2xhc3NMaXN0Py5jb250YWlucygnYmFja2Ryb3AnKVxyXG5cdFx0XHRcdClcclxuXHRcdFx0KSB7XHJcblx0XHRcdFx0aGFuZGxlVml0ZU92ZXJsYXkoYWRkZWROb2RlKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxufSk7XHJcblxyXG5vYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwge1xyXG5cdGNoaWxkTGlzdDogdHJ1ZSxcclxuXHRzdWJ0cmVlOiB0cnVlXHJcbn0pO1xyXG5cclxuZnVuY3Rpb24gaGFuZGxlVml0ZU92ZXJsYXkobm9kZSkge1xyXG5cdGlmICghbm9kZS5zaGFkb3dSb290KSB7XHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cclxuXHRjb25zdCBiYWNrZHJvcCA9IG5vZGUuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcuYmFja2Ryb3AnKTtcclxuXHJcblx0aWYgKGJhY2tkcm9wKSB7XHJcblx0XHRjb25zdCBvdmVybGF5SHRtbCA9IGJhY2tkcm9wLm91dGVySFRNTDtcclxuXHRcdGNvbnN0IHBhcnNlciA9IG5ldyBET01QYXJzZXIoKTtcclxuXHRcdGNvbnN0IGRvYyA9IHBhcnNlci5wYXJzZUZyb21TdHJpbmcob3ZlcmxheUh0bWwsICd0ZXh0L2h0bWwnKTtcclxuXHRcdGNvbnN0IG1lc3NhZ2VCb2R5RWxlbWVudCA9IGRvYy5xdWVyeVNlbGVjdG9yKCcubWVzc2FnZS1ib2R5Jyk7XHJcblx0XHRjb25zdCBmaWxlRWxlbWVudCA9IGRvYy5xdWVyeVNlbGVjdG9yKCcuZmlsZScpO1xyXG5cdFx0Y29uc3QgbWVzc2FnZVRleHQgPSBtZXNzYWdlQm9keUVsZW1lbnQgPyBtZXNzYWdlQm9keUVsZW1lbnQudGV4dENvbnRlbnQudHJpbSgpIDogJyc7XHJcblx0XHRjb25zdCBmaWxlVGV4dCA9IGZpbGVFbGVtZW50ID8gZmlsZUVsZW1lbnQudGV4dENvbnRlbnQudHJpbSgpIDogJyc7XHJcblx0XHRjb25zdCBlcnJvciA9IG1lc3NhZ2VUZXh0ICsgKGZpbGVUZXh0ID8gJyBGaWxlOicgKyBmaWxlVGV4dCA6ICcnKTtcclxuXHJcblx0XHR3aW5kb3cucGFyZW50LnBvc3RNZXNzYWdlKHtcclxuXHRcdFx0dHlwZTogJ2hvcml6b25zLXZpdGUtZXJyb3InLFxyXG5cdFx0XHRlcnJvcixcclxuXHRcdH0sICcqJyk7XHJcblx0fVxyXG59XHJcbmA7XHJcblxyXG5jb25zdCBjb25maWdIb3Jpem9uc1J1bnRpbWVFcnJvckhhbmRsZXIgPSBgXHJcbndpbmRvdy5vbmVycm9yID0gKG1lc3NhZ2UsIHNvdXJjZSwgbGluZW5vLCBjb2xubywgZXJyb3JPYmopID0+IHtcclxuXHRjb25zdCBlcnJvckRldGFpbHMgPSBlcnJvck9iaiA/IEpTT04uc3RyaW5naWZ5KHtcclxuXHRcdG5hbWU6IGVycm9yT2JqLm5hbWUsXHJcblx0XHRtZXNzYWdlOiBlcnJvck9iai5tZXNzYWdlLFxyXG5cdFx0c3RhY2s6IGVycm9yT2JqLnN0YWNrLFxyXG5cdFx0c291cmNlLFxyXG5cdFx0bGluZW5vLFxyXG5cdFx0Y29sbm8sXHJcblx0fSkgOiBudWxsO1xyXG5cclxuXHR3aW5kb3cucGFyZW50LnBvc3RNZXNzYWdlKHtcclxuXHRcdHR5cGU6ICdob3Jpem9ucy1ydW50aW1lLWVycm9yJyxcclxuXHRcdG1lc3NhZ2UsXHJcblx0XHRlcnJvcjogZXJyb3JEZXRhaWxzXHJcblx0fSwgJyonKTtcclxufTtcclxuYDtcclxuXHJcbmNvbnN0IGNvbmZpZ0hvcml6b25zQ29uc29sZUVycnJvSGFuZGxlciA9IGBcclxuY29uc3Qgb3JpZ2luYWxDb25zb2xlRXJyb3IgPSBjb25zb2xlLmVycm9yO1xyXG5jb25zb2xlLmVycm9yID0gZnVuY3Rpb24oLi4uYXJncykge1xyXG5cdG9yaWdpbmFsQ29uc29sZUVycm9yLmFwcGx5KGNvbnNvbGUsIGFyZ3MpO1xyXG5cclxuXHRsZXQgZXJyb3JTdHJpbmcgPSAnJztcclxuXHJcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRjb25zdCBhcmcgPSBhcmdzW2ldO1xyXG5cdFx0aWYgKGFyZyBpbnN0YW5jZW9mIEVycm9yKSB7XHJcblx0XHRcdGVycm9yU3RyaW5nID0gYXJnLnN0YWNrIHx8IFxcYFxcJHthcmcubmFtZX06IFxcJHthcmcubWVzc2FnZX1cXGA7XHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0aWYgKCFlcnJvclN0cmluZykge1xyXG5cdFx0ZXJyb3JTdHJpbmcgPSBhcmdzLm1hcChhcmcgPT4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgPyBKU09OLnN0cmluZ2lmeShhcmcpIDogU3RyaW5nKGFyZykpLmpvaW4oJyAnKTtcclxuXHR9XHJcblxyXG5cdHdpbmRvdy5wYXJlbnQucG9zdE1lc3NhZ2Uoe1xyXG5cdFx0dHlwZTogJ2hvcml6b25zLWNvbnNvbGUtZXJyb3InLFxyXG5cdFx0ZXJyb3I6IGVycm9yU3RyaW5nXHJcblx0fSwgJyonKTtcclxufTtcclxuYDtcclxuXHJcbmNvbnN0IGNvbmZpZ1dpbmRvd0ZldGNoTW9ua2V5UGF0Y2ggPSBgXHJcbmNvbnN0IG9yaWdpbmFsRmV0Y2ggPSB3aW5kb3cuZmV0Y2g7XHJcblxyXG53aW5kb3cuZmV0Y2ggPSBmdW5jdGlvbiguLi5hcmdzKSB7XHJcblx0Y29uc3QgdXJsID0gYXJnc1swXSBpbnN0YW5jZW9mIFJlcXVlc3QgPyBhcmdzWzBdLnVybCA6IGFyZ3NbMF07XHJcblxyXG5cdC8vIFNraXAgV2ViU29ja2V0IFVSTHNcclxuXHRpZiAodXJsLnN0YXJ0c1dpdGgoJ3dzOicpIHx8IHVybC5zdGFydHNXaXRoKCd3c3M6JykpIHtcclxuXHRcdHJldHVybiBvcmlnaW5hbEZldGNoLmFwcGx5KHRoaXMsIGFyZ3MpO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIG9yaWdpbmFsRmV0Y2guYXBwbHkodGhpcywgYXJncylcclxuXHRcdC50aGVuKGFzeW5jIHJlc3BvbnNlID0+IHtcclxuXHRcdFx0Y29uc3QgY29udGVudFR5cGUgPSByZXNwb25zZS5oZWFkZXJzLmdldCgnQ29udGVudC1UeXBlJykgfHwgJyc7XHJcblxyXG5cdFx0XHQvLyBFeGNsdWRlIEhUTUwgZG9jdW1lbnQgcmVzcG9uc2VzXHJcblx0XHRcdGNvbnN0IGlzRG9jdW1lbnRSZXNwb25zZSA9XHJcblx0XHRcdFx0Y29udGVudFR5cGUuaW5jbHVkZXMoJ3RleHQvaHRtbCcpIHx8XHJcblx0XHRcdFx0Y29udGVudFR5cGUuaW5jbHVkZXMoJ2FwcGxpY2F0aW9uL3hodG1sK3htbCcpO1xyXG5cclxuXHRcdFx0aWYgKCFyZXNwb25zZS5vayAmJiAhaXNEb2N1bWVudFJlc3BvbnNlKSB7XHJcblx0XHRcdFx0XHRjb25zdCByZXNwb25zZUNsb25lID0gcmVzcG9uc2UuY2xvbmUoKTtcclxuXHRcdFx0XHRcdGNvbnN0IGVycm9yRnJvbVJlcyA9IGF3YWl0IHJlc3BvbnNlQ2xvbmUudGV4dCgpO1xyXG5cdFx0XHRcdFx0Y29uc3QgcmVxdWVzdFVybCA9IHJlc3BvbnNlLnVybDtcclxuXHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoXFxgRmV0Y2ggZXJyb3IgZnJvbSBcXCR7cmVxdWVzdFVybH06IFxcJHtlcnJvckZyb21SZXN9XFxgKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIHJlc3BvbnNlO1xyXG5cdFx0fSlcclxuXHRcdC5jYXRjaChlcnJvciA9PiB7XHJcblx0XHRcdGlmICghdXJsLm1hdGNoKC9cXC5odG1sPyQvaSkpIHtcclxuXHRcdFx0XHRjb25zb2xlLmVycm9yKGVycm9yKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhyb3cgZXJyb3I7XHJcblx0XHR9KTtcclxufTtcclxuYDtcclxuXHJcbmNvbnN0IGFkZFRyYW5zZm9ybUluZGV4SHRtbCA9IHtcclxuXHRuYW1lOiAnYWRkLXRyYW5zZm9ybS1pbmRleC1odG1sJyxcclxuXHR0cmFuc2Zvcm1JbmRleEh0bWwoaHRtbCkge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0aHRtbCxcclxuXHRcdFx0dGFnczogW1xyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdHRhZzogJ3NjcmlwdCcsXHJcblx0XHRcdFx0XHRhdHRyczogeyB0eXBlOiAnbW9kdWxlJyB9LFxyXG5cdFx0XHRcdFx0Y2hpbGRyZW46IGNvbmZpZ0hvcml6b25zUnVudGltZUVycm9ySGFuZGxlcixcclxuXHRcdFx0XHRcdGluamVjdFRvOiAnaGVhZCcsXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHR0YWc6ICdzY3JpcHQnLFxyXG5cdFx0XHRcdFx0YXR0cnM6IHsgdHlwZTogJ21vZHVsZScgfSxcclxuXHRcdFx0XHRcdGNoaWxkcmVuOiBjb25maWdIb3Jpem9uc1ZpdGVFcnJvckhhbmRsZXIsXHJcblx0XHRcdFx0XHRpbmplY3RUbzogJ2hlYWQnLFxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0dGFnOiAnc2NyaXB0JyxcclxuXHRcdFx0XHRcdGF0dHJzOiB7dHlwZTogJ21vZHVsZSd9LFxyXG5cdFx0XHRcdFx0Y2hpbGRyZW46IGNvbmZpZ0hvcml6b25zQ29uc29sZUVycnJvSGFuZGxlcixcclxuXHRcdFx0XHRcdGluamVjdFRvOiAnaGVhZCcsXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHR0YWc6ICdzY3JpcHQnLFxyXG5cdFx0XHRcdFx0YXR0cnM6IHsgdHlwZTogJ21vZHVsZScgfSxcclxuXHRcdFx0XHRcdGNoaWxkcmVuOiBjb25maWdXaW5kb3dGZXRjaE1vbmtleVBhdGNoLFxyXG5cdFx0XHRcdFx0aW5qZWN0VG86ICdoZWFkJyxcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRdLFxyXG5cdFx0fTtcclxuXHR9LFxyXG59O1xyXG5cclxuY29uc29sZS53YXJuID0gKCkgPT4ge307XHJcblxyXG5jb25zdCBsb2dnZXIgPSBjcmVhdGVMb2dnZXIoKVxyXG5jb25zdCBsb2dnZXJFcnJvciA9IGxvZ2dlci5lcnJvclxyXG5cclxubG9nZ2VyLmVycm9yID0gKG1zZywgb3B0aW9ucykgPT4ge1xyXG5cdGlmIChvcHRpb25zPy5lcnJvcj8udG9TdHJpbmcoKS5pbmNsdWRlcygnQ3NzU3ludGF4RXJyb3I6IFtwb3N0Y3NzXScpKSB7XHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cclxuXHRsb2dnZXJFcnJvcihtc2csIG9wdGlvbnMpO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG5cdGN1c3RvbUxvZ2dlcjogbG9nZ2VyLFxyXG5cdHBsdWdpbnM6IFtcclxuXHRcdC4uLihpc0RldiA/IFtpbmxpbmVFZGl0UGx1Z2luKCksIGVkaXRNb2RlRGV2UGx1Z2luKCldIDogW10pLFxyXG5cdFx0cmVhY3QoKSxcclxuXHRcdGFkZFRyYW5zZm9ybUluZGV4SHRtbFxyXG5cdF0sXHJcblx0c2VydmVyOiB7XHJcblx0XHRjb3JzOiB0cnVlLFxyXG5cdFx0Ly8gUmVtb3ZpZG8gQ09FUCBjcmVkZW50aWFsbGVzcyBwb3JxdWUgcHVlZGUgYmxvcXVlYXIgaWZyYW1lcyAoWW91VHViZSwgVmltZW8pIGVuIGRlc2Fycm9sbG8uXHJcblx0XHRoZWFkZXJzOiB7fSxcclxuXHRcdGFsbG93ZWRIb3N0czogdHJ1ZSxcclxuXHR9LFxyXG5cdHJlc29sdmU6IHtcclxuXHRcdGV4dGVuc2lvbnM6IFsnLmpzeCcsICcuanMnLCAnLnRzeCcsICcudHMnLCAnLmpzb24nLCBdLFxyXG5cdFx0YWxpYXM6IHtcclxuXHRcdFx0J0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKSxcclxuXHRcdH0sXHJcblx0fSxcclxuXHRidWlsZDoge1xyXG5cdFx0cm9sbHVwT3B0aW9uczoge1xyXG5cdFx0XHRleHRlcm5hbDogW1xyXG5cdFx0XHRcdCdAYmFiZWwvcGFyc2VyJyxcclxuXHRcdFx0XHQnQGJhYmVsL3RyYXZlcnNlJyxcclxuXHRcdFx0XHQnQGJhYmVsL2dlbmVyYXRvcicsXHJcblx0XHRcdFx0J0BiYWJlbC90eXBlcydcclxuXHRcdFx0XVxyXG5cdFx0fVxyXG5cdH1cclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBaWhCLE9BQU8sVUFBVTtBQUNsaUIsU0FBUyxxQkFBcUI7QUFDOUIs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RCxNQUFNO0FBQUEsSUFDTjtBQUFBLEVBQ0Q7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNQLE1BQU07QUFBQTtBQUFBLElBRU4sU0FBUyxDQUFDO0FBQUEsSUFDVixjQUFjO0FBQUEsRUFDZjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1IsWUFBWSxDQUFDLFFBQVEsT0FBTyxRQUFRLE9BQU8sT0FBUztBQUFBLElBQ3BELE9BQU87QUFBQSxNQUNOLEtBQUtDLE1BQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDckM7QUFBQSxFQUNEO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTixlQUFlO0FBQUEsTUFDZCxVQUFVO0FBQUEsUUFDVDtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0Q7QUFBQSxJQUNEO0FBQUEsRUFDRDtBQUNELENBQUM7IiwKICAibmFtZXMiOiBbInBhdGgiLCAiX19kaXJuYW1lIiwgImZpbGVVUkxUb1BhdGgiLCAiX19kaXJuYW1lIiwgIl9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwiLCAiX19maWxlbmFtZSIsICJwYXRoIiwgImlubGluZUVkaXRQbHVnaW4iLCAicGF0aCJdCn0K
