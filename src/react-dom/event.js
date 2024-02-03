// 定义一个事件类型的方法字典
const eventTypeMethods = {
  // key 是原生事件名
  // 值是一个对象，对象有 key 和 值， key 是事件阶段，值是对应绑定元素上的事件
  click: {
    capture: "onClickCapture",
    bubble: "onClick",
  },
};
// 事件传播的两个阶段
const phases = ["capture", "bubble"];
/**
 *  设置事件委托，把所有的事件都绑到 container 上
 * @param {*} container root根节点
 */
export function setupEventDelegation(container) {
  // 遍历所有的事件
  Reflect.ownKeys(eventTypeMethods).forEach((eventType) => {
    // 遍历 两个阶段 capture bubble
    phases.forEach((phase) => {
      // 给容器添加监听函数
      container.addEventListener(
        // 事件名称 click
        eventType,
        // nativeEvent 原生的事件对象
        (nativeEvent) => {
          // console.log("nativeEvent", nativeEvent);
          // 要模拟事件传播的顺序，事件传播路径上所有DOM元素上绑定的React事件取出来按顺序执行

          const composedPath = nativeEvent.composedPath();
          // console.log("composedPath", composedPath);
          const domElements =
            phase === "capture" ? composedPath.reverse() : composedPath;
          // 拼出来方法名 onClick onClickCapture
          const methodName = eventTypeMethods[eventType][phase];
          // 遍历所有的 DOM 元素，执行它身上绑定的 React 事件监听函数
          for (let domElement of domElements) {
            // 如果此DOM节点上绑定有回调函数，则执行它
            domElement.reactEvents?.[methodName]?.(nativeEvent);
          }
        },
        phase === "capture"
      );
    });
  });
}
