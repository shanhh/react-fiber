import { TAG_ROOT,  ELEMENT_TEXT, TAG_TEXT, TAG_HOST, PLACEMENT, DELETION, UPDATE} from './constants.js'
import setProps from './utils.js'
/**
 * 从根节点开始渲染和调度
 * 两个阶段 
 * diff对比新旧虚拟Dom, 进行增加 更新 创建 render阶段
 * render阶段 有两个任务 1.根据虚拟dom生成fiber树 2.收集effectList
 * 这个阶段花时间 可以对任务进行拆分， 这个阶段可以暂停
 * commit阶段 对Dom进行操作 这个阶段不能暂停
 */
let nextUnitOfWork = null  // 下一个工作单元
let workInProgressRoot = null // RootFiber 应用的根 正在工作的根fiber
let currentRoot = null // 渲染成功的当前根fiber树
let deletions = [] // 删除的节点 并不放在effectList 放在这个数组中
export default function scheduleRoot(rootFiber) {
  if(currentRoot && currentRoot.alternate) { // 第二次之后的更新 
    workInProgressRoot = currentRoot.alternate // 上上次渲染的那个fiber tree
    workInProgressRoot.props = rootFiber.props // 更新成要渲染的新的props
    workInProgressRoot.alternate = currentRoot // 确定好指向
  } else if (currentRoot) { // 第一次更新
    rootFiber.alternate = currentRoot
    workInProgressRoot = rootFiber
  } else { // 第一次渲染
    workInProgressRoot = rootFiber
  }
  // 把指针清空
  workInProgressRoot.firstEffect = workInProgressRoot.lastEffect = workInProgressRoot.nextEffect = null
  nextUnitOfWork = workInProgressRoot
}

/**
 * 
 * 1.创建真实的DOM元素
 * 2.创建子fiber
 */
function beginWork(currentFiber) {
  if(currentFiber.tag === TAG_ROOT) { // root 这个里面创建子fiber
    updateHostRoot(currentFiber)
  } else if(currentFiber.tag === TAG_TEXT) { // 文本节点
    updateHostText(currentFiber)
  } else if(currentFiber.tag === TAG_HOST) { // 原生DOM节点
    updateHost(currentFiber)
  }
}

// dom相关 生成给stateNode用
function createDOM(currentFiber) {
  if (currentFiber.tag === TAG_TEXT) {
    return document.createTextNode(currentFiber.props.text)
  } else if (currentFiber.tag === TAG_HOST) { // 原生DOM节点
    let stateNode = document.createElement(currentFiber.type)
    updateDOM(stateNode, {}, currentFiber.props)
    return stateNode
  }
}
function updateDOM(stateNode, oldProps, newProps) {
  setProps(stateNode,oldProps, newProps)
}

function updateHost(currentFiber) {
  if (!currentFiber.stateNode) {
    currentFiber.stateNode = createDOM(currentFiber)
  }
  let newChildren = currentFiber.props.children
  reconcileChildren(currentFiber, newChildren)
}
function updateHostText (currentFiber) {
  if (!currentFiber.stateNode) {
    currentFiber.stateNode = createDOM(currentFiber)
  }
}
function updateHostRoot(currentFiber) { 
  // 先处理自己 如果是一个原生的节点 创建真实的DOM 2. 创建子fiber
  let newChildren = currentFiber.props.children // [element]
  reconcileChildren(currentFiber, newChildren)
}
// 协调子节点
function reconcileChildren(currentFiber, newChildren) {
  let newChildIndex = 0 // 新子节点的索引
  // 如果currentFiber有alternate并且有child 第一个儿子
  let oldFiber = currentFiber.alternate && currentFiber.alternate.child
  let prevSibling; // 上一个新的子fiber
  // 遍历子虚拟DOM 为每一个虚拟DOM创建子fiber fiber是时间任务切片 也是一个数据结构
  while (newChildIndex < newChildren.length || oldFiber) {
    let newChild = newChildren[newChildIndex] // 取出虚拟DOM节点
    let newFiber; // 新的fiber
    const sameType = oldFiber && newChild && oldFiber.type === newChild.type
    let tag

    if (newChild && newChild.type === ELEMENT_TEXT) {
      tag = TAG_TEXT // 文本节点
    } else if (newChild && typeof newChild.type === 'string') {
      tag = TAG_HOST // 如果type 是一个字符串 那么他就是一个原生DOM节点
    }
    if (sameType) { // 老fiber和新虚拟DOM类型一样，可以复用老的DOM节点，更新即可
      newFiber = {
        tag: oldFiber.tag,
        type: oldFiber.type, // 元素 span div等 或者是ELEMENT_TEXT 文本标记 创建元素的类型
        props: newChild.props,
        stateNode: oldFiber.stateNode, // 还没有创建DOM元素
        return: currentFiber,
        alternate: oldFiber, // 让新fiber的alternate指向旧的fiber节点
        effectTag: UPDATE, // 副作用标识 用来收集effecList
        nextEffect: null, // 单链表 就是完成顺序
      }
    } else{
      if(newChild) { // newChild 可能为{null}
        newFiber = {
          tag,
          type: newChild.type, // 元素 span div等 或者是ELEMENT_TEXT 文本标记 创建元素的类型
          props: newChild.props,
          stateNode: null, // 还没有创建DOM元素
          return: currentFiber,
          effectTag: PLACEMENT, // 副作用标识 用来收集effecList
          nextEffect: null, // 单链表 就是完成顺序
        }
      }
      if (oldFiber) {
        oldFiber.effectTag = DELETION
        deletions.push(oldFiber)
      }
    }
    if (oldFiber) {
      oldFiber = oldFiber.sibling // oldFiber的指针也向后移动  对比 老fiber和新的虚拟dom
    }
    // fiber 数据结构 child sibling return
    if(newFiber) {
      if (newChildIndex === 0) { // 取第一元素 太子
        currentFiber.child = newFiber
      } else {
        prevSibling.sibling = newFiber // 第一个元素的sibling 指向下一个fiber
      }
      prevSibling = newFiber
    }
    newChildIndex++
  }

}

// 执行下一任务
function performUnitOfWork (currentFiber) {
  beginWork(currentFiber) // 开始
  if (currentFiber.child) {
    return currentFiber.child
  }
  // 反转 从下往上
  while (currentFiber) {
    completeUnitOfWork(currentFiber) // 没有儿子让自己完成
    if (currentFiber.sibling) { // 查兄弟
      return currentFiber.sibling 
    }
    currentFiber = currentFiber.return // 儿子和儿子的兄弟也没有了 让父亲完成
  }
}
// 完成任务 这个地方收集副作用 effectList链
// firstEffect指向第一个有副作用的子fiber lastEffect指向最后一个有副作用的子fiber
// 中间用nextEffect形成一个链表 firstEffect=大儿子.nextEffect二儿子.nextEffect三儿子
function completeUnitOfWork (currentFiber) { // 第一个完成的是A1(text)
  let returnFiber = currentFiber.return
  if (returnFiber) {
    // 倒数第二层 把自己的儿子的effect链挂载父亲身上
    if (!returnFiber.firstEffect && currentFiber.firstEffect) {
      returnFiber.firstEffect = currentFiber.firstEffect
    }
    if (currentFiber.lastEffect) {
      if (returnFiber.lastEffect) {
        returnFiber.lastEffect.nextEffect = currentFiber.firstEffect
      } 
      returnFiber.lastEffect = currentFiber.lastEffect
    }
    // 倒数第一层 把自己挂载父亲身上
    const effectTag = currentFiber.effectTag
    if (effectTag) { 
      if(returnFiber.lastEffect) {
        returnFiber.lastEffect.nextEffect = currentFiber
      } else {
        returnFiber.firstEffect = currentFiber
      }
      returnFiber.lastEffect = currentFiber
    }
  }
}

// 循环执行 nextUnitWork
function workLoop(deadline) {
  let shouldYield = false // 是否让出时间片 给浏览器
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining() < 1 // 没时间了就让出控制权
    
  }
  if (!nextUnitOfWork && workInProgressRoot) {
    console.log('render阶段结束')
    commitRoot()
  } 
  // 请求浏览器调度
  requestIdleCallback(workLoop, {timeout: 5000})
}

function commitRoot() {
  deletions.forEach(commitWork)
  let currentFiber = workInProgressRoot.firstEffect
  while (currentFiber) {
    console.log(currentFiber)
    commitWork(currentFiber)
    currentFiber = currentFiber.nextEffect
  }
  deletions.length = 0 // 提交之后清空deletion数组  
  currentRoot = workInProgressRoot // 把当前渲染成功的fiber 赋值给currentRoot
  workInProgressRoot = null
}
function commitWork(currentFiber) {
  if (!currentFiber) return
  let returnFiber = currentFiber.return
  let returnDOM = returnFiber.stateNode
  if (currentFiber.effectTag === PLACEMENT) { // 新增节点
    returnDOM.appendChild(currentFiber.stateNode)
  } else if (currentFiber.effectTag === DELETION) { 
    returnDOM.removeChild(currentFiber.stateNode)
  } else if (currentFiber.effectTag === UPDATE) {
    if (currentFiber.type === ELEMENT_TEXT) {
      // 新老fiber树进行对比
      if (currentFiber.alternate.props.text !== currentFiber.props.text)
        currentFiber.stateNode.textContent = currentFiber.props.text
    } else {
      updateDOM(currentFiber.stateNode, 
        currentFiber.alternate.props, currentFiber.props)
    }
  }
  currentFiber.effectTag = null
}

// 告诉浏览器在空闲的时候帮我执行任务
requestIdleCallback(workLoop, {timeout: 5000})