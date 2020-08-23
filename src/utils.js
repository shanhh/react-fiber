export default function setProps(dom,oldProps, newProps) {
  for (let key in oldProps) {
    if (key !== 'children') {
      if (newProps.hasOwnProperty(key)) {
        setProp(dom, key, newProps[key]) // 新老都有,则更新
      } else {
        dom.removeAttribute(key) // 老props有 新的没有 删除
      }
    }
  }
  for(let key in newProps) {
    if (key !== 'children') {
      if (!oldProps.hasOwnProperty(key)) { // 老的没有 新的有 则添加 
        setProp(dom, key, newProps[key])
      }
    }
  }
}
function setProp(dom, key, value) {
  if (/^on/.test(key)) {
    dom[key.toLowerCase()] = value // 这个react会处理合成事件 这里先这样写
  } else if (key === 'style') {
    if (value) {
      for(let styleName in value) {
        dom.style[styleName] = value[styleName]
      }
    }
  } else {
    dom.setAttribute(key, value)
  }
}
