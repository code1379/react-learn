import { REACT_FORWARD_REF, REACT_TEXT } from "../constant";
import {
  isDefined,
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

function mountVdom(vdom, parentDOMElement, nextDOMElement) {
  // 1. 把虚拟DOM 变为 真实DOM
  const domElement = createDOMElement(vdom);
  // 如果没有从虚拟DOM 的到真实DOM，则不需要添加到容器中
  if (!domElement) return;
  // 2. 把真实DOM 添加到容器中
  if (nextDOMElement) {
    parentDOMElement.insertBefore(domElement, nextDOMElement);
  } else {
    parentDOMElement.appendChild(domElement);
  }
  // 此时 DOM 元素已经挂载到页面上，可以执行挂载完成的钩子函数
  domElement.componentDidMount?.()
}

function createDOMElementFromTextComponent(vdom) {
  const { props } = vdom;
  const domElement = document.createTextNode(props);
  vdom.domElement = domElement;
  return domElement;
}

function createDOMElementFromClassComponent(vdom) {
  const { type, props, ref } = vdom;
  // 把属性对象传递给类组件的构造函数，返回类组件实例
  const classInstance = new type(props);
  // 组件将要挂载
  classInstance.componentWillMount?.()
  // ref 指向类组件的实例
  if (ref) ref.current = classInstance;
  // vdom 的 classInstance 属性指向类组件的实例
  vdom.classInstance = classInstance;
  // 调用实例的 render 方法，创建真实DOM
  const renderVdom = classInstance.render();
  // 关联（通过 vdom 关联，因为最后都会走到 createDOMElementFromNativeComponent ）
  // 类的实例的 oldRenderVdom 属性指向它调用 render 方法渲染出来的虚拟DOM
  classInstance.oldRenderVdom = renderVdom;
  // 把 React元素（VDom）传递给 createDOMElement，创建真实DOM
  // 此处只是生成了真实DOM，但此真实DOM此时还没有挂载到页面中，也就是还没有插入到父节点中
  const domElement = createDOMElement(renderVdom);
  // 因为我们也不知道这个 dom 元素是什么时候插入页面的，所以可以把此挂载完成的钩子函数先暂存到 dom 元素上
  // 等它真正挂载完成的时候在执行就可以了
  if (classInstance.componentDidMount) {
    domElement.componentDidMount = classInstance.componentDidMount
  }
  return domElement
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

function createDOMElementFromForwardComponent(vdom) {
  const { type, props, ref } = vdom; // type={$$typeof, render} render其实就是转发前的函数组件
  // 把自己接收到的属性对象和 ref 作为实参传递给render 函数
  const renderVdom = type.render(props, ref)
  vdom.oldRenderVdom = renderVdom
  // 根据虚拟DOM 变成真实DOM 并返回
  return createDOMElement(renderVdom)
}


function createDOMElementFromNativeComponent(vdom) {
  const { type, props, ref } = vdom;
  // 1. 根据 type 创建真实 DOM 节点
  const domElement = document.createElement(type);
  if (ref) ref.current = domElement;
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
  // 如果一个属性在老的属性里有，新属性上没有，则需要删除
  Object.keys(oldProps).forEach((propName) => {
    // 如果新的属性对象中没有此属性了
    if (!newProps.hasOwnProperty(propName)) {
      if (propName === 'style') {
        // 如果原来有行内样式，现在没有了，则需要清除原来的行内样式
        Object.keys(oldProps.style).forEach(styleProp => {
          domElement.style[styleProp] = null
        })
      } else if (propName.startsWith("on")) {
        delete domElement.reactEvents[propName]
      } else if (propName === 'children') {
      } else {
        delete domElement[propName]
      }
    }
  })

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
  // 说明是一个转发的函数组件
  if (type.$$typeof === REACT_FORWARD_REF) {
    return createDOMElementFromForwardComponent(vdom)
  }
  // 如果 vdom 是文本节点
  else if (type === REACT_TEXT) {
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

/**
 * 进行深度的DOM-DIFF
 * @param {*} parentDOM  真实的父DOM oldVdom 对应的真实DOM 的父节点
 * @param {*} oldVdom 上一次 render 渲染出来的虚拟DOM  
 * @param {*} newVdom 罪行的 render 渲染出来的虚拟DOM
 */
export function compareVdom(parentDOM, oldVdom, newVdom, nextDOMElement) {
  // 如果新的节点和老的节点都是空的，什么都不用做
  if (isUndefined(oldVdom) && isUndefined(newVdom)) {
    return
  } else if (isDefined(oldVdom) && isUndefined(newVdom)) {
    // 老的有值，新的没有值，卸载老的DOM 节点
    unmountVdom(oldVdom);
  } else if (isUndefined(oldVdom) && isDefined(newVdom)) {
    // 老的虚拟DOM 为空，新的不为空，创建新的真实DOM 并插入父容器
    mountVdom(newVdom, parentDOM, nextDOMElement);
  } else if (isDefined(oldVdom) && isDefined(newVdom) && oldVdom.type !== newVdom.type) {
    // 如果新旧都有，但是类型不同，也不能复用。卸载老的，插入新的
    unmountVdom(oldVdom);
    mountVdom(newVdom, parentDOM, nextDOMElement);
  } else {
    // 新老都有，并且类型也一样。就可以进入深入对比属性和子节点
    updateVdom(oldVdom, newVdom)
  }
}

/**
 * 卸载/删除 老的节点
 * @param {*} vdom 虚拟DOM对象
 * @returns 
 */
function unmountVdom(vdom) {
  if (isUndefined(vdom)) return;
  const { ref, props } = vdom;
  // 递归卸载子节点
  wrapToArray(props.children).forEach(unmountVdom)
  // 或取此虚拟DOM 对应的真实DOM，如果窜爱的话就删除它
  getDOMElementByVdom(vdom)?.remove();
  // 如果这是一个类组件，并且类组件实例上还有组件将要卸载的函数，则执行它
  vdom.classInstance?.componentWillUnmount?.();
  // 把 ref 的current 重置为 null
  if (ref) ref.current = null;

}

/**
 * 更新虚拟DOM
 * @param {*} oldVdom 
 * @param {*} newVdom 
 */
function updateVdom(oldVdom, newVdom) {
  const { type } = oldVdom;
  // 如果是一个转发的Ref 的话
  if (type.$$typeof === REACT_FORWARD_REF) {
    return updateReactForwardComponent(oldVdom, newVdom);
  } else if (type === REACT_TEXT) {
    // 如果是一个文本节点
    return updateReactTextComponent(oldVdom, newVdom);
  } else if (isString(type)) {
    // 说明这是一个普通的原生节点 div span
    return updateNativeComponent(oldVdom, newVdom);
  } else if (isFunction(type)) {
    if (type.isReactComponent) {
      return updateClassComponent(oldVdom, newVdom);
    } else {
      return updateFunctionComponent(oldVdom, newVdom);
    }
  }
}

function updateReactForwardComponent(oldVdom, newVdom) {
  const { type, props, ref } = newVdom; // type={$$typeof, render} render其实就是转发前的函数组件
  // 重新执行函数组件渲染的函数，得到渲染的虚拟DOM
  const renderVdom = type.render(props, ref);
  // 获取老的真实DOM的父节点，再传入老的虚拟DOM 和新的虚拟DOM
  const parentDOM = getParentDOMByVdom(oldVdom);
  compareVdom(parentDOM, oldVdom.oldRenderVdom, renderVdom);
}


function updateReactTextComponent(oldVdom, newVdom) {
  // 先获取老的文本节点的真实DOM，然后传递给 newVdom.domElement
  // const domElement = getDOMElementByVdom(oldVdom);
  // newVdom.domElement = domElement
  let domElement = newVdom.domElement = getDOMElementByVdom(oldVdom);
  // props 是文本
  // 如果老的文本和新的文本不一样的话，则修改文本节点内容
  if (oldVdom.props !== newVdom.props) {
    domElement.textContent = newVdom.props;
  }
}

function updateClassComponent(oldVdom, newVdom) {
  // 复用类组件的实例
  const classInstance = newVdom.classInstance = oldVdom.classInstance;
  // 类组件的父组件更新了，向子组件传递新的属性
  classInstance?.componentWillReceiveProps?.(newVdom.props)
  // 触发子组件的更新
  classInstance.emitUpdate(newVdom.props)
}
function updateFunctionComponent(oldVdom, newVdom) {
  const { type, props } = newVdom;
  // 重新执行函数组件渲染的函数，得到渲染的虚拟DOM
  const renderVdom = type(props);
  // 获取老的真实DOM的父节点，再传入老的虚拟DOM 和新的虚拟DOM
  const parentDOM = getParentDOMByVdom(oldVdom);
  compareVdom(parentDOM, oldVdom.oldRenderVdom, renderVdom);
  newVdom.oldRenderVdom = renderVdom;
}

function updateNativeComponent(oldVdom, newVdom) {
  let domElement = newVdom.domElement = getDOMElementByVdom(oldVdom);
  // 更新属性（根据旧的属性对象和新的属性对象进行更新）
  updateProps(domElement, oldVdom.props, newVdom.props)
  // 更新 children
  updateChildren(domElement, oldVdom.props.children, newVdom.props.children)
}

/**
 * 更新子节点
 * @param {*} parentDOM 父真实DOM
 * @param {*} oldVChildren 老的子虚拟DOM
 * @param {*} newVChildren 新的子虚拟DOM
 */
function updateChildren(parentDOM, oldVChildren, newVChildren) {
  oldVChildren = wrapToArray(oldVChildren)
  newVChildren = wrapToArray(newVChildren)
  // 这里先进行子节点的一一比较
  // 获取新旧子节点的最大长度
  const maxLength = Math.max(oldVChildren.length, newVChildren.length)
  for (let i = 0; i < maxLength; i++) {
    const nextDOMElement = getNextVdom(oldVChildren, i + 1);
    compareVdom(parentDOM, oldVChildren[i], newVChildren[i], nextDOMElement);
  }
}

/**
 * 查找 startIndex 后面的第一个真实DOM节点
 * @param {*} vChildren  老的虚拟DOM的 children
 * @param {*} startIndex 开始查找的索引
 */
function getNextVdom(vChildren, startIndex) {
  // 因为在传递 startIndex 的时候 + 1了，所以这里不用 + 1了
  for (let i = startIndex; i < vChildren.length; i++) {
    const vChild = vChildren[i];
    let domElement = getDOMElementByVdom(vChild);
    if (domElement) return domElement
  }
  return null
}


export function getParentDOMByVdom(vdom) {
  return getDOMElementByVdom(vdom)?.parentNode;
}