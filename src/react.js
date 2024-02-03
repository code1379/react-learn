import { createDOMElement } from "./react-dom/client";
import { wrapToVdom } from "./utils";

/**
 * 创建 React 元素也就是虚拟DOM的工厂方法
 * @param {*} type vdom 类型
 * @param {*} props 配置对象，属性
 * @param  {...any} children 儿子们
 * @returns
 */
function createElement(type, props, children) {
  // 创建 props 对象，也就是属性对象
  const _props = { ...props };
  // 如果参数大于3个，说明不止有1个儿子
  if (arguments.length > 3) {
    _props.children = Array.prototype.slice.call(arguments, 2).map(wrapToVdom);
  } else {
    // 如果没有儿子，或者只有一个儿子，直接把 children 赋值给 props.children 即可
    _props.children = wrapToVdom(children);
  }

  return {
    type,
    props: _props,
  };
}

// 在 ES6 中类是一个语法糖，也是函数
class Component {
  // 可以给类组件的类型添加一个静态属性 Component.isReactComponent
  static isReactComponent = true;
  constructor(props) {
    // 把收到的属性对象保存在自己的实例上
    this.props = props;
  }

  setState(partialState) {
    this.state = {
      ...this.state,
      ...partialState,
    };
    // 在计算完新状态后要更新组件
    this.forceUpdate();
  }

  forceUpdate() {
    // 1. 从新调用 render 方法，计算新的虚拟DOM
    const newRenderVdom = this.render();
    // 2. 再创建新的真实DOM
    const newDOMElement = createDOMElement(newRenderVdom);
    // 3. 替换掉老的真实DOM 需要老的真实DOM 和 老的真实DOM 的父节点
    const oldDOMElement = this.oldRenderVdom.domElement;
    // 4. 获取父节点 div#root
    const parentDOM = oldDOMElement.parentNode;
    // 5. 替换子元素
    parentDOM.replaceChild(newDOMElement, oldDOMElement);
    // 6. 将实例的 oldRenderVdom 指向新的 vdom
    this.oldRenderVdom = newRenderVdom;
  }
}

const React = { createElement, Component };

export default React;
