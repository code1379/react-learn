import { createDOMElement, getDOMElementByVdom } from "./react-dom/client";
import { isFunction, wrapToVdom } from "./utils";

/**
 * 创建 React 元素也就是虚拟DOM的工厂方法
 * @param {*} type vdom 类型
 * @param {*} props 配置对象，属性
 * @param  {...any} children 儿子们
 * @returns
 */
function createElement(type, props, children) {
  // 创建 props 对象，也就是属性对象
  const { ref, ..._props } = props;
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
    ref,
  };
}

// 在 ES6 中类是一个语法糖，也是函数
class Component {
  // 可以给类组件的类型添加一个静态属性 Component.isReactComponent
  static isReactComponent = true;
  constructor(props) {
    // 把收到的属性对象保存在自己的实例上
    this.props = props;
    // 这里保存需要但还没生效的更新
    this.pendingStates = [];
  }

  setState(partialState) {
    // 如果当前处于批量更新模式，则把当前的实例添加到脏组件集合中
    if (isBatchingUpdates) {
      dirtyComponents.add(this);
      // 另外把更新添加到待更新队列中
      this.pendingStates.push(partialState);
    } else {
      // 如果当前处于非批量更新模式，则直接更新
      let newState = partialState;
      if (isFunction(partialState)) {
        newState = partialState(this.state);
      }
      this.state = {
        ...this.state,
        ...newState,
      };

      // 在计算完新状态后要更新组件
      this.forceUpdate();
    }
  }
  // 根据 this.pendingStates 计算新状态
  accumulateState = () => {
    // 取出老状态，然后依次执行更新队列中的新状态，计算出最终的新状态
    let state = this.pendingStates.reduce((state, partialState) => {
      let newState = partialState;
      if (isFunction(partialState)) {
        newState = partialState(this.state);
      }
      // 合并老状态和新状态作为最终状态
      return {
        ...state,
        ...newState,
      };
    }, this.state);
    // 清空更新队列
    this.pendingStates.length = 0;
    // 返回新状态
    return state;
  };

  forceUpdate() {
    // 再重新render 之前需要计算状态
    this.state = this.accumulateState();
    // 1. 从新调用 render 方法，计算新的虚拟DOM
    const newRenderVdom = this.render();
    // 2. 再创建新的真实DOM
    const newDOMElement = createDOMElement(newRenderVdom);
    // 3. 替换掉老的真实DOM 需要老的真实DOM 和 老的真实DOM 的父节点
    // const oldDOMElement = this.oldRenderVdom.domElement;
    // 嵌套函数组件
    // const oldDOMElement = this.oldRenderVdom.oldRenderVdom.domElement;
    const oldDOMElement = getDOMElementByVdom(this.oldRenderVdom);
    // 4. 获取父节点 div#root
    const parentDOM = oldDOMElement.parentNode;
    // 5. 替换子元素
    parentDOM.replaceChild(newDOMElement, oldDOMElement);
    // 6. 将实例的 oldRenderVdom 指向新的 vdom
    this.oldRenderVdom = newRenderVdom;
  }
}

function createRef() {
  return {
    current: null,
  };
}

const React = { createElement, Component, createRef };

export default React;

// 定义一个布尔值变量，用来控制当前是否处于批量更新模式
export let isBatchingUpdates = false;

export function setIsBatchingUpdates(value) {
  isBatchingUpdates = value;
}

// 定义一个 元素不能重复的集合，有待更新的组件称为 dirtyComponent
export const dirtyComponents = new Set();
export function flushDirtyComponents() {
  dirtyComponents.forEach((component) => component.forceUpdate());
  dirtyComponents.clear(); // 清空集合
  isBatchingUpdates = false; // 更新完之后要关闭批量更新
}
