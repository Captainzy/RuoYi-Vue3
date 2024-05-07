const useTagsViewStore = defineStore(
  'tags-view',
  {
    //定义全局状态对象
    state: () => ({
      //访问过的视图
      visitedViews: [],
      //缓存视图
      cachedViews: [],

      iframeViews: []
    }),
    //定义全局方法
    actions: {
      //添加视图,入参view为路由对象
      addView(view) {
        this.addVisitedView(view)
        this.addCachedView(view)
      },
      //添加iframe视图
      addIframeView(view) {
        //如果缓存视图数组中存在当前路由对象,则添加iframe视图
        if (this.iframeViews.some(v => v.path === view.path))
          return this.iframeViews.push(
              Object.assign({}, view, {title: view.meta.title || 'no-name'})
          )
      },
      //添加访问过的视图
      addVisitedView(view) {
        //如果访问过的视图数组中存在当前路由对象,则添加访问过的视图
        if (this.visitedViews.some(v => v.path === view.path))
          return this.visitedViews.push(
            Object.assign({}, view, {title: view.meta.title || 'no-name'})
        )
      },
      addCachedView(view) {
        //如果缓存视图数组中存在当前路由对象名称,则不用继续后续判断
        if (this.cachedViews.includes(view.name)) return
        //如果路由对象源数据中noCache为true,则不缓存
        if (!view.meta.noCache) {
          this.cachedViews.push(view.name)
        }
      },
      //删除视图
      delView(view) {
        //如果删除视图是当前激活视图,则删除后激活下一个视图
        return new Promise(resolve => {
          this.delVisitedView(view)
          this.delCachedView(view)
          //这行代码的意思是返回一个对象,包含两个数组,一个是访问过的视图数组,一个是缓存视图数组
          resolve({
            //这段代码是 JavaScript 中的扩展运算符（Spread Operator）语法。
            // 在这里，[...this.visitedViews] 表示将 this.visitedViews 数组中的所有元素取出，并将它们作为一个新数组的元素。
            // 这样做的目的是为了创建一个新的数组副本，而不是直接引用原始数组。
            visitedViews: [...this.visitedViews],
            cachedViews: [...this.cachedViews]
          })
        })
      },
      delVisitedView(view) {
        return new Promise(resolve => {
          // for (const [i, v] of this.visitedViews.entries()) {
          //   if (v.path === view.path) {
          //     //如果访问过的视图数组中存在当前路由对象,则删除访问过的视图
          //     this.visitedViews.splice(i, 1)
          //     break
          //   }
          // }
          this.visitedViews = this.visitedViews.filter(item => item.path !== view.path)
          this.iframeViews = this.iframeViews.filter(item => item.path !== view.path)
          resolve([...this.visitedViews])
        })
      },
      delIframeView(view) {
        return new Promise(resolve => {
          this.iframeViews = this.iframeViews.filter(item => item.path !== view.path)
          resolve([...this.iframeViews])
        })
      },
      delCachedView(view) {
        return new Promise(resolve => {
          const index = this.cachedViews.indexOf(view.name)
          index > -1 && this.cachedViews.splice(index, 1)
          resolve([...this.cachedViews])
        })
      },
      //关闭其他视图
      delOthersViews(view) {
        return new Promise(resolve => {
          //关闭其他访问过的视图
          this.delOthersVisitedViews(view)
          //关闭其他缓存视图
          this.delOthersCachedViews(view)
          resolve({
            visitedViews: [...this.visitedViews],
            cachedViews: [...this.cachedViews]
          })
        })
      },
      //关闭其他访问过的视图
      delOthersVisitedViews(view) {
        return new Promise(resolve => {
          this.visitedViews = this.visitedViews.filter(v => {
            return v.meta.affix || v.path === view.path
          })
          this.iframeViews = this.iframeViews.filter(item => item.path === view.path)
          resolve([...this.visitedViews])
        })
      },
      delOthersCachedViews(view) {
        return new Promise(resolve => {
          const index = this.cachedViews.indexOf(view.name)
          if (index > -1) {
            this.cachedViews = this.cachedViews.slice(index, index + 1)
          } else {
            this.cachedViews = []
          }
          resolve([...this.cachedViews])
        })
      },
      //关闭所有视图
      delAllViews(view) {
        return new Promise(resolve => {
          this.delAllVisitedViews(view)
          this.delAllCachedViews(view)
          resolve({
            visitedViews: [...this.visitedViews],
            cachedViews: [...this.cachedViews]
          })
        })
      },
      //关闭所有访问过的视图，不包含固定的视图（affix=true）
      delAllVisitedViews(view) {
        return new Promise(resolve => {
          const affixTags = this.visitedViews.filter(tag => tag.meta.affix)
          this.visitedViews = affixTags
          this.iframeViews = []
          resolve([...this.visitedViews])
        })
      },
      //关闭所有缓存视图
      delAllCachedViews(view) {
        return new Promise(resolve => {
          this.cachedViews = []
          resolve([...this.cachedViews])
        })
      },
      //更新视图
      updateVisitedView(view) {
        for (let v of this.visitedViews) {
          if (v.path === view.path) {
            v = Object.assign(v, view)
            break
          }
        }
      },
      //关闭右侧视图
      delRightTags(view) {
        return new Promise(resolve => {
          const index = this.visitedViews.findIndex(v => v.path === view.path)
          if (index === -1) {
            return
          }
          this.visitedViews = this.visitedViews.filter((item, idx) => {
            if (idx <= index || (item.meta && item.meta.affix)) {
              return true
            }
            const i = this.cachedViews.indexOf(item.name)
            if (i > -1) {
              this.cachedViews.splice(i, 1)
            }
            if(item.meta.link) {
              const fi = this.iframeViews.findIndex(v => v.path === item.path)
              this.iframeViews.splice(fi, 1)
            }
            return false
          })
          resolve([...this.visitedViews])
        })
      },
      //关闭左侧视图
      delLeftTags(view) {
        return new Promise(resolve => {
          const index = this.visitedViews.findIndex(v => v.path === view.path)
          if (index === -1) {
            return
          }
          this.visitedViews = this.visitedViews.filter((item, idx) => {
            if (idx >= index || (item.meta && item.meta.affix)) {
              return true
            }
            const i = this.cachedViews.indexOf(item.name)
            if (i > -1) {
              this.cachedViews.splice(i, 1)
            }
            if(item.meta.link) {
              const fi = this.iframeViews.findIndex(v => v.path === item.path)
              this.iframeViews.splice(fi, 1)
            }
            return false
          })
          resolve([...this.visitedViews])
        })
      }
    }
  })

export default useTagsViewStore
