import { ELEMENT_TEXT } from './constants.js'
import {Update} from './UpdateQueue.js'
import {scheduleRoot, useReducer, useState} from './scheduler.js'
/**
 * 创建虚拟Dom的方法
 * @param {*} type 元素类型 div span p
 * @param {*} config 配置对象 key ref
 * @param  {...any} children 所有的儿子 统一放在数组中
 */

function createElement(type, config, ...children) {
  delete config.__self
  delete config.__source
  return {
    type,
    props: {
      ...config,
      children: children.map(child => { //判断children 如果是文本的话 包装一下 而不是直接返回字符串
        return typeof child === 'object' ? child : {
          type: ELEMENT_TEXT,
          props: { text: child, children: [] }
        }
      })
    }
  }
}

class Component {
  constructor(props) {
    this.props = props
  }
  setState(payload) { // 可能是对象 也可能是函数
    let update = new Update(payload)
    // 放在fiber节点上 internalFiber 指向fiber节点
    this.internalFiber.updateQueue.enqueueUpdate(update)
    scheduleRoot() // 从根节点开始调度

  }
}
Component.prototype.isReactComponent = {} // 类组件的标识


const React = {
  createElement,
  Component,
  useReducer,
  useState
}

export default React