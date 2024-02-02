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
    _props.children = Array.prototype.slice.call(arguments, 2);
  } else {
    // 如果没有儿子，或者只有一个儿子，直接把 children 赋值给 props.children 即可
    _props.children = children;
  }

  return {
    type,
    props: _props,
  };
}

const React = { createElement };

export default React;
