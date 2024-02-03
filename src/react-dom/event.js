// 定义一个事件类型的方法字典
import { isFunction } from "../utils/index";
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
          // 根据原生事件创建合成事件
          const syntheticEvent = createSyntheticEvent(nativeEvent);
          // 要模拟事件传播的顺序，事件传播路径上所有DOM元素上绑定的React事件取出来按顺序执行
          const composedPath = syntheticEvent.composedPath();
          // console.log("composedPath", composedPath);
          const domElements =
            phase === "capture" ? composedPath.reverse() : composedPath;
          // 拼出来方法名 onClick onClickCapture
          const methodName = eventTypeMethods[eventType][phase];
          // 遍历所有的 DOM 元素，执行它身上绑定的 React 事件监听函数
          for (let domElement of domElements) {
            // 如果某个方法执行的时候，已经调用了 event.stopPropagation 就跳出循环
            if (syntheticEvent.isPropagationStopped()) {
              break;
            }
            // 如果此DOM节点上绑定有回调函数，则执行它
            domElement.reactEvents?.[methodName]?.(syntheticEvent);
          }
        },
        phase === "capture"
      );
    });
  });
}

/**
 *  根据原生事件对象创建合成事件对象
 * @param {*} nativeEvent
 * @returns
 */
function createSyntheticEvent(nativeEvent) {
  // 当前事件是否已经阻止传播
  let isPropagationStopped = false;
  // 当前事件是否已经阻止默认行为
  let isDefaultPrevented = false;
  const target = {
    nativeEvent,
    preventDefault() {
      if (nativeEvent.preventDefault) {
        nativeEvent.preventDefault(); // 标准浏览器
      } else {
        nativeEvent.returnValue = false; // IE浏览器
      }
      isDefaultPrevented = true;
    },
    stopPropagation() {
      if (nativeEvent.stopPropagation) {
        nativeEvent.stopPropagation(); // 标准浏览器
      } else {
        nativeEvent.cancelBubble = true; // IE浏览器
      }
      isPropagationStopped = true;
    },
    isDefaultPrevented() {
      return isDefaultPrevented;
    },
    isPropagationStopped() {
      return isPropagationStopped;
    },
  };
  const handler = {
    get(target, key) {
      // 如果此属性是 target 自己的属性，就从自己身上拿
      if (target.hasOwnProperty(key)) {
        // 直接放回被代理对象的属性
        return Reflect.get(target, key);
      } else {
        // 先取出属性上的值，
        const val = Reflect.get(nativeEvent, key);
        // 如果是函数，就绑死 this，保证你在调用这些函数的时候它的this指向原生的事件对象
        if (isFunction(val)) {
          return val.bind(nativeEvent);
        } else {
          return val;
        }
      }
    },
  };
  // 相当于对 nativeEvent 进行扩展
  // 根据原生事件创建一个代理对象
  const syntheticEvent = new Proxy(target, handler);
  return syntheticEvent;
}
