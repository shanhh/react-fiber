export default function setProps(dom,oldProps, newProps) {
  for (let key in oldProps) {}
  for(let key in newProps) {
    if (key !== 'children') {
      setProp(dom, key, newProps[key])
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
