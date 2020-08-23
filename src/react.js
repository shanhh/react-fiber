import { ELEMENT_TEXT } from './constants.js'
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

const React = {
  createElement
}

export default React