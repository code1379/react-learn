import { REACT_FORWARD_REF } from "./constant";
import { compareVdom, createDOMElement, getDOMElementByVdom } from "./react-dom/client";
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
    // 用来存放新的属性
    this.nextProps = null;
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
      this.updateIfNeeded();
    }
  }

  // 如果有必要的话进行更新，如果没必要就不更新
  updateIfNeeded() {
    // 1. 先计算新状态
    const nextState = this.accumulateState();
    // 现在我们还没有处理子组件的更新，当父组件传递给自组件的属性发生变化后，子组件也要更新
    // 调用 shouldComponentUpdate 钩子计算是否要更新
    const shuldUpdate = this.shouldComponentUpdate?.(this.nextProps, nextState);
    // 不管要不要更新，this.state都要赋值新状态
    this.state = nextState;
    // 如果有新属性，则赋值给 props
    if (this.nextProps) {
      this.props = this.nextProps;
      this.nextProps = null;
    }
    // 如果返回 false，就表示不更新，直接结束
    if (!shuldUpdate) return
    this.forceUpdate();
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

  emitUpdate(nextProps) {
    // 暂存新属性对象
    this.nextProps = nextProps;
    // 如果有新的属性或者有待更新的状态的话，就进入视图更新逻辑
    if (this.nextProps || this.pendingStates.length > 0) {
      this.updateIfNeeded();
    }
  }
  forceUpdate() {
    // 组件将要更新 componentWillUpdate
    this.componentWillUpdate?.();
    // 1. 从新调用 render 方法，计算新的虚拟DOM
    const renderVdom = this.render();
    // 2. 再创建新的真实DOM
    // const newDOMElement = createDOMElement(renderVdom);
    // 3. 替换掉老的真实DOM 需要老的真实DOM 和 老的真实DOM 的父节点
    // const oldDOMElement = this.oldRenderVdom.domElement;
    // 嵌套函数组件
    // const oldDOMElement = this.oldRenderVdom.oldRenderVdom.domElement;
    const oldDOMElement = getDOMElementByVdom(this.oldRenderVdom);
    // 4. 获取父节点 div#root
    const parentDOM = oldDOMElement.parentNode;
    // 5. 替换子元素 现在不要简单粗暴的用新的 DOM 替换老的 DOM
    // parentDOM.replaceChild(newDOMElement, oldDOMElement);
    // 比较新旧DOM，找出最小化的差异，以最小的代价更新真实DOM
    compareVdom(parentDOM, this.oldRenderVdom, renderVdom)
    // 6. 将实例的 oldRenderVdom 指向新的 vdom
    this.oldRenderVdom = renderVdom;
    // 在更新完成后调用 componentDidUpdate
    this.componentDidUpdate?.(this.props, this.state)
  }
}

function createRef() {
  return {
    current: null,
  };
}

/**
 * 转发ref，可以实现ref的转发，可以接收ref，比更年期诶转发给函数组件
 * @param {*} render  是一个函数组件，也就是一个渲染函数
 */
function forwardRef(render) {
  return {
    $$typeof: REACT_FORWARD_REF,
    render
  }
}

const React = { createElement, Component, createRef, forwardRef };

export default React;

// 定义一个布尔值变量，用来控制当前是否处于批量更新模式
export let isBatchingUpdates = false;

export function setIsBatchingUpdates(value) {
  isBatchingUpdates = value;
}

// 定义一个 元素不能重复的集合，有待更新的组件称为 dirtyComponent
export const dirtyComponents = new Set();
export function flushDirtyComponents() {
  dirtyComponents.forEach((component) => component.updateIfNeeded());
  dirtyComponents.clear(); // 清空集合
  isBatchingUpdates = false; // 更新完之后要关闭批量更新
}
