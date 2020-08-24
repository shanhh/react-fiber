export class Update {
  constructor(payload) {
    this.payload = payload
  }
}

export class UpdateQueue {
  constructor() {
    this.firstUpdate = null
    this.lastUpdate = null
  }
  enqueueUpdate(update) {
    if (this.firstUpdate === null) {
      this.firstUpdate = this.lastUpdate = update
    } else { // 构建链表 下一个的nextUpdate指向update
      this.lastUpdate.nextUpdate = update
      this.lastUpdate = update
    }
  }
  forceUpdate(state) {
    let currentUpdate = this.firstUpdate
    while (currentUpdate) {
      let  nextState = typeof currentUpdate.payload === 'function' 
        ? currentUpdate.payload(state) : currentUpdate.payload
      state = typeof state === 'object' ? {...state, ...nextState} : nextState
      currentUpdate = currentUpdate.nextUpdate
    }
    this.firstUpdate = this.lastUpdate = null
    return state
  }
}