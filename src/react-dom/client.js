import { isNumber, isString } from "../utils";

/**
 * 创建 vdom 容器
 * @param {*} container
 */
function createRoot(container) {
  return {
    // 把 虚拟DOM 变成 真实DOM 并插入到容器container 中
    // reactElement 就是 vdom
    render(reactElement) {
      // 1. 把虚拟DOM 变为 真实DOM
      const domElement = renderElement(reactElement);
      // 2. 把真实DOM 添加到容器中
      container.appendChild(domElement);
    },
  };
}
/**
 * 把虚拟DOM 变为真实DOM
 * @param {*} reactElement 虚拟DOM
 * @returns 真实 DOM
 */
function renderElement(reactElement) {
  if (isString(reactElement) || isNumber(reactElement)) {
    return document.createTextNode(reactElement);
  }
  // reactElement 是个对象
  const { type, props } = reactElement;
  // 1. 根据 type 创建真实 DOM 节点
  const domElement = document.createElement(type);
  // 2. 把 props 对象的属性，都添加到真实 DOM 节点上
  Object.keys(props).forEach((propName) => {
    // 2.1 如果属性是 children 则先跳过不处理，后面会单独处理
    if (propName === "children") {
      return;
    }
    // 2.2 如果是行内样式属性的话，则直接覆盖到真实DOM 的style 上
    if (propName === "style") {
      Object.assign(domElement.style, props.style);
    } else {
      // 暂时不处理事件绑定
      domElement[propName] = props[propName];
    }
  });

  // 格式化children 为数组
  const children = Array.isArray(props.children)
    ? props.children
    : [props.children];
  //3. 遍历数组
  children.forEach((child) => {
    // 3.1 将每个儿子从 虚拟DOM 变为 真实DOM
    const el = renderElement(child);
    // 3.2 插入到父节点中
    domElement.appendChild(el);
  });

  return domElement;
}

const ReactDOM = {
  createRoot,
};

export default ReactDOM;
