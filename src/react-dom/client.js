import { REACT_TEXT } from "../constant";
import {
  isFunction,
  isNumber,
  isString,
  isUndefined,
  wrapToArray,
} from "../utils";
import { setupEventDelegation } from "./event";

/**
 * 创建 vdom 容器
 * @param {*} container
 */
function createRoot(container) {
  return {
    // 把 虚拟DOM 变成 真实DOM 并插入到容器container 中
    // vdom 就是 vdom
    render(rootVdom) {
      mountVdom(rootVdom, container);
      // 设置事件代理
      setupEventDelegation(container);
    },
  };
}

function mountVdom(vdom, parentDOMElement) {
  // 1. 把虚拟DOM 变为 真实DOM
  const domElement = createDOMElement(vdom);
  // 如果没有从虚拟DOM 的到真实DOM，则不需要添加到容器中
  if (!domElement) return;
  // 2. 把真实DOM 添加到容器中
  parentDOMElement.appendChild(domElement);
}

function createDOMElementFromTextComponent(vdom) {
  const { props } = vdom;
  return document.createTextNode(props);
}

function createDOMElementFromClassComponent(vdom) {
  const { type, props } = vdom;
  // 把属性对象传递给类组件的构造函数，返回类组件实例
  const classInstance = new type(props);
  // vdom 的 classInstance 属性指向类组件的实例
  vdom.classInstance = classInstance;
  // 调用实例的 render 方法，创建真实DOM
  const renderVdom = classInstance.render();
  // 关联（通过 vdom 关联，因为最后都会走到 createDOMElementFromNativeComponent ）
  // 类的实例的 oldRenderVdom 属性指向它调用 render 方法渲染出来的虚拟DOM
  classInstance.oldRenderVdom = renderVdom;
  // 把 React元素（VDom）传递给 createDOMElement，创建真实DOM
  return createDOMElement(renderVdom);
}
function createDOMElementFromFunctionComponent(vdom) {
  const { type, props } = vdom;
  // 将属性对象传递给函数组件，返回一个 React 元素，也就是虚拟DOM
  const renderVdom = type(props);
  // 在获取到函数组件返回的虚拟DOM 之后，也需要记录一下
  // 让函数组件的虚拟DOM 的 oldRenderVdom 属性指向它返回的虚拟DOM
  vdom.oldRenderVdom = renderVdom;
  // 把函数组件返回的 React元素（VDom）传递给 createDOMElement，创建真实DOM
  return createDOMElement(renderVdom);
}

function createDOMElementFromNativeComponent(vdom) {
  const { type, props } = vdom;
  // 1. 根据 type 创建真实 DOM 节点
  const domElement = document.createElement(type);
  // 2. 把 props 对象的属性，都添加到真实 DOM 节点上
  updateProps(domElement, {}, props);
  // 3. 挂载儿子
  mountChildren(vdom, domElement);
  vdom.domElement = domElement;
  return domElement;
}

/**
 * 把所有的子节点也从虚拟DOM变成真实DOM并且挂载到父节点上
 * @param {*} vdom 虚拟DOM
 * @param {*} domElement 真实DOM
 */
function mountChildren(vdom, domElement) {
  const { props } = vdom;
  // 格式化children 为数组
  const children = wrapToArray(props.children);
  //3. 遍历数组
  children.forEach((childVdom) => {
    mountVdom(childVdom, domElement);
  });
}

/**
 * 根据属性更新 DOM 元素
 * 抽离此方法是为了后面更新的时候可以复用
 * @param {*} domElement 真实DOM元素
 * @param {*} oldProps 老属性
 * @param {*} newProps 新属性
 */
function updateProps(domElement, oldProps, newProps) {
  Object.keys(newProps).forEach((propName) => {
    // 2.1 如果属性是 children 则先跳过不处理，后面会单独处理
    if (propName === "children") {
      return;
    }
    // 2.2 如果是行内样式属性的话，则直接覆盖到真实DOM 的style 上
    if (propName === "style") {
      Object.assign(domElement.style, newProps.style);
    } else if (propName.startsWith("on")) {
      // 在 domElement 上添加自定义属性 reactEvents，用来存放 React 事件回调
      if (isUndefined(domElement.reactEvents)) {
        domElement.reactEvents = {};
      }
      // domElement.reactEvents['onClick'] = newProps['onClick'];
      // domElement.reactEvents['onClickCapture'] = newProps['onClickCapture'];
      domElement.reactEvents[propName] = newProps[propName];
    } else {
      // 暂时不处理事件绑定
      domElement[propName] = newProps[propName];
    }
  });
}

/**
 * 把虚拟DOM 变为真实DOM
 * @param {*} vdom 虚拟DOM
 * @returns 真实 DOM
 */
export function createDOMElement(vdom) {
  // 如果传递的 vdom 为空，则直接返回 null
  if (isUndefined(vdom)) return null;
  // vdom 是个对象
  const { type, props } = vdom;
  // 如果 vdom 是文本节点
  if (type === REACT_TEXT) {
    return createDOMElementFromTextComponent(vdom);
  }
  // 如果元素的 type 是函数的话
  else if (isFunction(type)) {
    // 类组件
    if (type.isReactComponent) {
      return createDOMElementFromClassComponent(vdom);
    } else {
      return createDOMElementFromFunctionComponent(vdom);
    }
  } else {
    return createDOMElementFromNativeComponent(vdom);
  }
}

const ReactDOM = {
  createRoot,
};

export default ReactDOM;

/**
 * 获取虚拟DOM对应的真实DOM
 * @param {*} vdom
 */
export function getDOMElementByVdom(vdom) {
  if (isUndefined(vdom)) return null;
  let { type } = vdom;
  // 如果虚拟DOM的类型 type 是一个函数的话，类组件和函数组件
  if (isFunction(type)) {
    if (type.isReactComponent) {
      // 先获取类组件渲染出来的 虚拟DOM，然后再进行递归查找
      return getDOMElementByVdom(vdom.classInstance.oldRenderVdom);
    } else {
      return getDOMElementByVdom(vdom.oldRenderVdom);
    }
  } else {
    // 原生节点
    return vdom.domElement;
  }
}
