import {TAG_ROOT} from './constants.js'
import scheduleRoot from './scheduler.js'

// 把元素渲染到容器内
function render(element, container){
  let rootFiber = {
    tag: TAG_ROOT, // 标识此元素的类型
    stateNode: container, // 一般情况下如果这个元素是一个原生节点的话， stateNode指向真实的Dom元素
    props: {children: [element]}, // children 属性中方的要渲染的元素
  }
  // 开始调度
  scheduleRoot(rootFiber)
}

const ReactDOM = {
  render
}
export default ReactDOM