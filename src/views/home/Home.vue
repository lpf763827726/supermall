<template>
  <div id="home">
    <nav-bar class="home-nav"><div slot="center">购物街</div></nav-bar>
    <tab-control :titles="['流行','新款','精选']"
                 @tabClick="tabClick"
                 ref="tabControl1"
                 class="tab-control"
                 v-show="isTabFixed"/>
    <scroll class="content"
            ref="scroll"
            :probe-type="3"
            @scroll="contentScroll"
            :pull-up-load="true"
            @pullingUp="loadMore">
      <home-swiper :banners="banners" @swiperImageLoad="swiperImageLoad"/>
      <recommend-view :recommends="recommends"/>
      <feature-view/>
      <tab-control :titles="['流行','新款','精选']"
                   @tabClick="tabClick"
                   ref="tabControl2"/>
      <goods-list :goods="showGoods"/>
    </scroll>

    <back-top @click.native="backClick" v-show="isShowBackTop"/>
    <!--.native修饰：在我们需要监听一个组件的原生事件时，必须给对应的事件加上.native修饰符，才能精选监听-->
  </div>
</template>

<script>
  import HomeSwiper from './childComps/HomeSwiper'
  import RecommendView from './childComps/RecommendView'
  import FeatureView from './childComps/FeatureView'

  import NavBar from 'components/common/navbar/NavBar'
  import TabControl from 'components/content/tabControl/TabControl'
  import GoodsList from 'components/content/goods/GoodsList'
  import Scroll from 'components/common/scroll/Scroll'

  import {
    getHomeMultidata,
    getHomeGoods
  } from "network/home";
  import {debounce} from "common/utils";
  import {itemListenerMixin, backTopMixin} from "common/mixin";

  export default {
    name: "Home",
    components: {
      HomeSwiper,
      RecommendView,
      FeatureView,
      NavBar,
      TabControl,
      GoodsList,
      Scroll,
    },
    mixins: [itemListenerMixin, backTopMixin],
    data() {
      return {
        banners: [],
        recommends: [],
        goods: {
          'pop': {page: 0, list: []},
          'new': {page: 0, list: []},
          'sell': {page: 0, list: []},
        },
        currentType: 'pop',
        tabOffsetTop: 0,
        isTabFixed: false,
        saveY: 0
      }
    },
    computed: {
      showGoods: {
        get(){
          return this.goods[this.currentType].list
        },
        set(val) {}
      }
    },
    destroyed() {
      console.log('home destroyed');
    },
    activated() {
      // console.log('activated');
      this.$refs.scroll.scrollTo(0, this.saveY, 0)
      this.$refs.scroll.refresh()
    },
    deactivated() {
      // console.log('deactivated');
      // 1.保存Y值
      this.saveY = this.$refs.scroll.getScrollY()
      // console.log(this.saveY);

      // 2.取消全局事件的监听
      this.$bus.$off('itemImgLoad', this.itemImgListener)
    },
    created() {
      // 1.请求多个数据
      this.getHomeMultidata()
      // 2.请求商品数据
      this.getHomeGoods('pop')
      this.getHomeGoods('new')
      this.getHomeGoods('sell')
    },
    // mounted() {
    //   // 1.图片加载完成的事件监听
    //   const refresh = debounce(this.$refs.scroll.refresh, 50)
    //   this.itemImgListener = () => {
    //     refresh()
    //   }
    //   this.$bus.$on('itemImageLoad', this.itemImgListener)
    // },
    methods: {
      /**
       *  事件监听相关的方法
       */
      tabClick(index) {
        // console.log(index);
        switch (index) {
          case 0:
            this.currentType = 'pop'
            break
          case 1:
            this.currentType = 'new'
            break
          case 2:
            this.currentType = 'sell'
            break
        }

        this.showGoods = this.goods[this.currentType].list

        // // 让两个TabControl的currentIndex保持一致
        this.$refs.tabControl1.currentIndex = index;
        this.$refs.tabControl2.currentIndex = index;
        // if (this.$refs.tabControl1 !== undefined) {
        //   this.$refs.tabControl1.currentIndex = index;
        //   this.$refs.tabControl2.currentIndex = index;
        // }
      },
      contentScroll(position) {
        // console.log(position);
        // 判断BackTop是否显示
        this.listenShowBackTop(position)

        // 2.决定tabControl是否吸顶(position: fixed)
        this.isTabFixed = (-position.y) > this.tabOffsetTop
      },
      loadMore() {
        // console.log('加载更多的方法');
        this.getHomeGoods(this.currentType)
      },
      swiperImageLoad() {
        // 2.获取tabControl的offsetTop
        // 所有的组件都有一个属性$el：用于获取组件中的元素
        this.tabOffsetTop = this.$refs.tabControl2.$el.offsetTop;
      },
      /**
       *  网络请求相关的方法
       */
      getHomeMultidata(){
        getHomeMultidata().then(res => {
          this.banners = res.data.banner.list;
          this.recommends = res.data.recommend.list;
        })
      },
      getHomeGoods(type){
        const page = this.goods[type].page + 1
        getHomeGoods(type, page).then(res => {
          // console.log(res);
          this.goods[type].list.push(...res.data.list)
          this.goods[type].page += 1

          // 完成上拉加载更多
          this.$refs.scroll.finishPullUp()
        })}
    }
  }
</script>

<style scoped>
  #home {
    /*padding-top: 44px;*/
    height: 100vh;
    /* vh -> viewport height */

    position: relative;
  }

  .home-nav{
    background-color: var(--color-tint);
    color: #fff;

    /*在使用浏览器原生滚动时，为了让导航不跟随一起滚动*/
    /*position: fixed;*/
    /*left: 0;*/
    /*right: 0;*/
    /*top: 0;*/
    /*z-index: 9;*/
  }
  .content {
    /*height: calc(100% - 93px);*/
    overflow: hidden;
    /*margin-top: 44px;*/

    position: absolute;
    top: 44px;
    bottom: 49px;
    left: 0;
    right: 0;
  }
  .tab-control {
    position: relative;
    z-index: 9;
  }
</style>
