/**
 * storage.js
 * @format
 * @flow 
 */

export default {
  add: (key: string, id: number, data: any) => global.storage.save({key, id, data}),
  delete: (key: string, id: number) => global.storage.remove({key, id}),
  selectList: (key: string) => global.storage.getAllDataForKey(key)
}